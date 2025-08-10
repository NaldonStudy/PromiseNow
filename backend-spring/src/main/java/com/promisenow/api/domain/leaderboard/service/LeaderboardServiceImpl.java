package com.promisenow.api.domain.leaderboard.service;

import com.promisenow.api.domain.leaderboard.dto.PositionResponseDto;
import com.promisenow.api.domain.leaderboard.dto.UserPositionDto;
import com.promisenow.api.domain.leaderboard.repository.LeaderboardRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Slf4j
@Service
@Transactional
@RequiredArgsConstructor
public class LeaderboardServiceImpl implements LeaderboardService {
    private final LeaderboardRepository leaderboardRepository;

    @Override
    public double updateLeaderboard(long roomId, long roomUserId, double lat, double lng, boolean online, double goalLat, double goalLng) {
        String userKey = "room:" + roomId + ":user:" + roomUserId;
        String arrivalOrderKey = "room:" + roomId + ":arrivalOrder";
        String leaderboardKey = "room:" + roomId + ":leaderboard";
        long now = System.currentTimeMillis();

        // Redis 연결 상태 확인
        if (!leaderboardRepository.testConnection()) {
            log.error("Redis 연결 실패");
            return 0.0;
        }

        // 이전 데이터 조회
        UserPositionDto prevPosition = leaderboardRepository.getUserPosition(userKey);
        
        // 이전 데이터가 없으면 빈 DTO 생성
        if (prevPosition == null) {
            prevPosition = UserPositionDto.empty();
        }

        // 출발 위치 설정 (최초 한 번만)
        UserPositionDto positionWithStart = prevPosition.getStartLat() == null ? 
            prevPosition.withStartPosition(lat, lng) : prevPosition;
        Double startLat = positionWithStart.getStartLat();
        Double startLng = positionWithStart.getStartLng();

        // 이동거리 및 목표까지 남은 거리 계산
        double totalDistance = haversine(startLat, startLng, goalLat, goalLng);
        double distanceLeft = haversine(lat, lng, goalLat, goalLng);

        // 이미 도착한 유저는 위치/속도 등 갱신 중단, 온라인 상태 TTL만 갱신
        if (prevPosition.getArrived() != null && Boolean.parseBoolean(prevPosition.getArrived().toString())) {
            String onlineKey = userKey + ":online";
            leaderboardRepository.setOnlineStatus(onlineKey, online, 60);
            return 0.0;
        }

        // 속도 계산 (이전 위치가 있는 경우)
        double velocity = 0.0;
        if (prevPosition.getLat() != null && prevPosition.getLng() != null && prevPosition.getTimestamp() != null) {
            double distanceMoved = haversine(prevPosition.getLat(), prevPosition.getLng(), lat, lng);
            long timeDiff = now - prevPosition.getTimestamp();
            if (timeDiff > 0) {
                velocity = distanceMoved / (timeDiff / 1000.0); // m/s
            }
        }

        // 진행률 계산
        double progress = totalDistance > 0 ? ((totalDistance - distanceLeft) / totalDistance) * 100.0 : 0.0;

        // 도착 여부 확인 (목표 지점 50m 이내)
        boolean arrived = distanceLeft <= 0.05; // 50m

        // 새로운 위치 정보 생성
        UserPositionDto newPosition = UserPositionDto.builder()
                .lat(lat)
                .lng(lng)
                .startLat(startLat)
                .startLng(startLng)
                .timestamp(now)
                .velocity(velocity)
                .progress(progress)
                .arrived(arrived)
                .build();

        // Redis에 저장
        leaderboardRepository.saveUserPosition(userKey, newPosition);

        // 온라인 상태 설정
        String onlineKey = userKey + ":online";
        leaderboardRepository.setOnlineStatus(onlineKey, online, 60);

        // 도착한 경우 도착 순서 기록
        if (arrived && (prevPosition.getArrived() == null || !Boolean.parseBoolean(prevPosition.getArrived().toString()))) {
            leaderboardRepository.addToArrivalOrder(arrivalOrderKey, String.valueOf(roomUserId), now);
        }

        // 리더보드에 추가
        leaderboardRepository.addToLeaderboard(leaderboardKey, String.valueOf(roomUserId), progress);

        return velocity;
    }

    @Override
    public List<PositionResponseDto> getLeaderboard(long roomId, double goalLat, double goalLng, int topN) {
        String leaderboardKey = "room:" + roomId + ":leaderboard";
        
        // 전체 사용자 수 조회
        Long totalUsers = leaderboardRepository.getLeaderboardSize(leaderboardKey);
        if (totalUsers == null || totalUsers == 0) {
            return new ArrayList<>();
        }

        // 실제 조회할 사용자 수 결정 (전체 사용자 수와 요청된 topN 중 작은 값)
        int actualTopN = Math.min(totalUsers.intValue(), topN);
        
        // 상위 사용자 ID 목록 조회
        Set<Object> roomUserIds = leaderboardRepository.getTopUsers(leaderboardKey, actualTopN);
        if (roomUserIds == null || roomUserIds.isEmpty()) {
            return new ArrayList<>();
        }

        List<PositionResponseDto> positions = new ArrayList<>();
        
        for (Object roomUserIdObj : roomUserIds) {
            String roomUserId = roomUserIdObj.toString();
            String userKey = "room:" + roomId + ":user:" + roomUserId;
            String onlineKey = userKey + ":online";

            // 온라인 상태 확인 (오프라인도 포함)
            boolean isOnline = leaderboardRepository.isOnline(onlineKey);

            UserPositionDto userInfo = leaderboardRepository.getUserPosition(userKey);
            if (userInfo == null) {
                continue;
            }

            PositionResponseDto dto = new PositionResponseDto();
            dto.setRoomUserId(Long.parseLong(roomUserId));
            dto.setLat(userInfo.getLat() != null ? userInfo.getLat() : 0);
            dto.setLng(userInfo.getLng() != null ? userInfo.getLng() : 0);
            dto.setVelocity(userInfo.getVelocity() != null ? userInfo.getVelocity() : 0);
            dto.setDistance(haversine(dto.getLat(), dto.getLng(), goalLat, goalLng));
            dto.setProgress(userInfo.getProgress() != null ? userInfo.getProgress() : 0.0);
            dto.setArrived(userInfo.getArrived() != null && Boolean.parseBoolean(userInfo.getArrived().toString()));
            dto.setOnline(isOnline);  // 실제 온라인 상태 설정
            
            // 개선된 예상 도착 시간 계산
            dto.setEstimatedArrivalMinutes(calculateEstimatedArrivalTime(dto.getDistance(), dto.getVelocity()));

            positions.add(dto);
        }

        return positions;
    }

    // 하버사인 공식으로 두 좌표 간 거리(km) 계산
    private double haversine(double lat1, double lng1, double lat2, double lng2) {
        final int R = 6371; // 지구 반경(km)
        double dLat = Math.toRadians(lat2 - lat1);
        double dLng = Math.toRadians(lng2 - lng1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(dLng / 2) * Math.sin(dLng / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    public Long getLeaderboardSize(String leaderboardKey) {
        return leaderboardRepository.getLeaderboardSize(leaderboardKey);
    }
    
    /**
     * 개선된 예상 도착 시간 계산
     * 가만히 있는 사용자의 비현실적인 도착 시간을 방지
     */
    private Integer calculateEstimatedArrivalTime(double distanceKm, double velocityKmh) {
        // 이미 도착한 경우
        if (distanceKm <= 0.4) { // 400m 이내
            return 0;
        }
        
        // 최소 속도 설정 (도보 속도: 4km/h)
        final double MIN_VELOCITY_KMH = 4.0;
        // 최대 속도 설정 (자전거 속도: 20km/h)
        final double MAX_VELOCITY_KMH = 20.0;
        
        // 속도 범위 제한
        double adjustedVelocity = Math.max(MIN_VELOCITY_KMH, Math.min(MAX_VELOCITY_KMH, velocityKmh));
        
        // 정지 상태이거나 매우 느린 경우 최소 속도 사용
        if (velocityKmh < 1.0) {
            adjustedVelocity = MIN_VELOCITY_KMH;
        }
        
        // 예상 도착 시간 계산 (분 단위)
        double estimatedMinutes = (distanceKm / adjustedVelocity) * 60;
        
        // 최대 예상 시간 제한 (2시간)
        final int MAX_ESTIMATED_MINUTES = 120;
        estimatedMinutes = Math.min(estimatedMinutes, MAX_ESTIMATED_MINUTES);
        
        log.info("⏰ 도착 시간 계산: distance={}km, velocity={}km/h, adjustedVelocity={}km/h, estimatedMinutes={}분", 
                distanceKm, velocityKmh, adjustedVelocity, estimatedMinutes);
        
        return (int) Math.round(estimatedMinutes);
    }
}
