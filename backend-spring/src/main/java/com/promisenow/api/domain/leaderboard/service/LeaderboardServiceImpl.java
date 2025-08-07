package com.promisenow.api.domain.leaderboard.service;

import com.promisenow.api.domain.leaderboard.dto.PositionResponseDto;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.util.*;

@Service
@Transactional
@RequiredArgsConstructor
public class LeaderboardServiceImpl implements LeaderboardService {
    private final RedisTemplate<String, String> redisTemplate;

    @Override
    public double updateLeaderboard(long roomId, long roomUserId, double lat, double lng, boolean online, double goalLat, double goalLng) {
        String userKey = "room:" + roomId + ":user:" + roomUserId;
        String arrivalOrderKey = "room:" + roomId + ":arrivalOrder";
        String leaderboardKey = "room:" + roomId + ":leaderboard";
        long now = System.currentTimeMillis();

        // 이전 데이터 조회
        Map<Object, Object> prev = redisTemplate.opsForHash().entries(userKey);
        Double prevLat = Optional.ofNullable(prev.get("lat"))
                .map(Object::toString)
                .map(Double::valueOf)
                .orElse(null);
        Double prevLng = Optional.ofNullable(prev.get("lng"))
                .map(Object::toString)
                .map(Double::valueOf)
                .orElse(null);
        Long prevTime = Optional.ofNullable(prev.get("time"))
                .map(Object::toString)
                .map(Long::valueOf)
                .orElse(null);

        Boolean prevArrived = Optional.ofNullable(prev.get("arrived"))
                .map(Object::toString)
                .map(Boolean::valueOf)
                .orElse(false);

        // 출발 위치
        Double startLat = Optional.ofNullable(prev.get("startLat")).map(Object::toString).map(Double::valueOf).orElse(lat);
        Double startLng = Optional.ofNullable(prev.get("startLng")).map(Object::toString).map(Double::valueOf).orElse(lng);

        // 이동거리 및 목표까지 남은 거리 계산
        double totalDistance = haversine(startLat, startLng, goalLat, goalLng);
        double distanceLeft = haversine(lat, lng, goalLat, goalLng);

        // 이미 도착한 유저는 위치/속도 등 갱신 중단, 온라인 상태 TTL만 갱신
        if (prevArrived) {
            String onlineKey = userKey + ":online";
            if (online) {
                redisTemplate.opsForValue().set(onlineKey, "true", Duration.ofMinutes(3));
            }

            return Optional.ofNullable(prev.get("velocity"))
                    .map(Object::toString)
                    .map(Double::valueOf)
                    .orElse(0.0);
        }

        boolean justArrived = distanceLeft <= 0.4;  // 도착 기준 200m

        if (prev.get("startLat") == null || prev.get("startLng") == null) {
            // 최초 시작 위치 저장
            redisTemplate.opsForHash().put(userKey, "startLat", lat);
            redisTemplate.opsForHash().put(userKey, "startLng", lng);
        }

        if (justArrived) {
            // 도착 처리
            redisTemplate.opsForHash().put(userKey, "arrived", true);
            redisTemplate.opsForHash().put(userKey, "progress", 1.0);
            redisTemplate.opsForHash().put(userKey, "lat", lat);
            redisTemplate.opsForHash().put(userKey, "lng", lng);
            redisTemplate.opsForHash().put(userKey, "time", now);

            // 도착 순서 저장 (score = 도착시각)
            redisTemplate.opsForZSet().add(arrivalOrderKey, String.valueOf(roomUserId), now);

            // 도착 순위(작은 도착시간이 먼저) 조회
            Long rankInArrival = redisTemplate.opsForZSet().rank(arrivalOrderKey, String.valueOf(roomUserId));
            if (rankInArrival == null) rankInArrival = 0L;

            // 도착자 점수 음수 부여 (다른 사용자(비도착자)는 양수 distanceLeft 점수)
            double scoreForLeaderboard = -(1000000 - rankInArrival);
            redisTemplate.opsForZSet().add(leaderboardKey, String.valueOf(roomUserId), scoreForLeaderboard);

            // 온라인 상태 갱신
            String onlineKey = userKey + ":online";
            if (online) {
                redisTemplate.opsForValue().set(onlineKey, "true", Duration.ofMinutes(3));
            }

            return 0.0; // 도착 후 속도는 0 처리
        }

        // 도착하지 않은 경우 위치, 시간, 속도 등 갱신

        // 현재 위치 및 시간 저장
        Map<String, Object> map = new HashMap<>();
        map.put("lat", lat);
        map.put("lng", lng);
        map.put("time", now);
        redisTemplate.opsForHash().putAll(userKey, map);

        // 온라인 상태 TTL 갱신
        String onlineKey = userKey + ":online";
        if (online) {
            redisTemplate.opsForValue().set(onlineKey, "true", Duration.ofMinutes(3));
        }

        // 속도 계산 (km/h)
        double velocity = 0.0;
        if (prevLat != null && prevLng != null && prevTime != null && now > prevTime) {
            double dist = haversine(prevLat, prevLng, lat, lng);
            double dt = (now - prevTime) / 1000.0;
            velocity = dt > 0 ? dist / dt : 0;
            velocity *= 3600; // 시간당 km로 변환
            redisTemplate.opsForHash().put(userKey, "velocity", velocity);
        }

        // 진행률 산출
        double progress = totalDistance > 0 ? (totalDistance - distanceLeft) / totalDistance : 0;
        redisTemplate.opsForHash().put(userKey, "progress", progress);
        redisTemplate.opsForHash().put(userKey, "arrived", false);

        // 리더보드 갱신 (거리 기준 점수)
        redisTemplate.opsForZSet().add(leaderboardKey, String.valueOf(roomUserId), distanceLeft);

        return velocity;
    }

    @Override
    public List<PositionResponseDto> getLeaderboard(long roomId, double goalLat, double goalLng, int topN) {
        String leaderboardKey = "room:" + roomId + ":leaderboard";

        // 오름차순 조회 (점수가 낮은 게 상위, 즉 도착자는 음수 점수로 상위권)
        Set<String> roomUserIds = redisTemplate.opsForZSet().range(leaderboardKey, 0, topN - 1);
        if (roomUserIds == null || roomUserIds.isEmpty()) {
            return Collections.emptyList();
        }

        List<PositionResponseDto> positions = new ArrayList<>();
        for (String roomUserId : roomUserIds) {
            String userKey = "room:" + roomId + ":user:" + roomUserId;
            String onlineKey = userKey + ":online";

            // 온라인 상태 TTL 확인
            if (!redisTemplate.hasKey(onlineKey)) {
                continue;
            }

            Map<Object, Object> userInfo = redisTemplate.opsForHash().entries(userKey);
            if (userInfo.isEmpty()) continue;

            PositionResponseDto dto = new PositionResponseDto();
            dto.setRoomUserId(Long.parseLong(roomUserId));
            dto.setLat(userInfo.get("lat") != null ? Double.parseDouble(userInfo.get("lat").toString()) : 0);
            dto.setLng(userInfo.get("lng") != null ? Double.parseDouble(userInfo.get("lng").toString()) : 0);
            dto.setVelocity(userInfo.get("velocity") != null ? Double.parseDouble(userInfo.get("velocity").toString()) : 0);
            dto.setDistance(haversine(dto.getLat(), dto.getLng(), goalLat, goalLng));
            dto.setProgress(userInfo.get("progress") != null ? Double.parseDouble(userInfo.get("progress").toString()) : 0.0);
            dto.setArrived(userInfo.get("arrived") != null && Boolean.parseBoolean(userInfo.get("arrived").toString()));
            dto.setOnline(true);

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
        return redisTemplate.opsForZSet().zCard(leaderboardKey);
    }
}
