package com.promisenow.api.application.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.promisenow.api.domain.entity.Room;
import com.promisenow.api.domain.entity.User;
import com.promisenow.api.domain.repository.RoomRepository;
import com.promisenow.api.domain.repository.UserRepository;
import com.promisenow.api.domain.service.LocationDomainService;
import com.promisenow.api.infrastructure.service.RedisService;

@Service
@Transactional
public class LocationApplicationService {
    
    @Autowired
    private RedisService redisService;
    
    @Autowired
    private RoomRepository roomRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private LocationDomainService locationDomainService;
    
    /**
     * 실시간 위치 업데이트 (Redis 최적화)
     */
    public void updateUserLocation(Long userId, double latitude, double longitude) {
        // Redis에 위치 정보 저장 (TTL 1분)
        redisService.updateUserLocation(userId, latitude, longitude);
        
        // 사용자가 참여 중인 방 조회
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isPresent() && userOpt.get().getRoomId() != null) {
            String roomId = userOpt.get().getRoomId();
            
            // 방 내 위치 공유 업데이트 (비동기 처리)
            CompletableFuture.runAsync(() -> {
                redisService.updateRoomLocation(roomId, userId, latitude, longitude);
                
                // 도착 여부 자동 확인 (비동기)
                checkArrivalStatus(roomId, userId, latitude, longitude);
            });
        }
    }
    
    /**
     * 방 내 모든 참여자 위치 조회 (Redis 최적화)
     */
    public Map<String, Object> getRoomLocations(String roomId) {
        try {
            // Redis에서 방 참여자 목록 조회
            Map<Object, Object> participants = redisService.getRoomParticipants(roomId);
            Map<Object, Object> locations = redisService.getRoomLocations(roomId);
            
            // 방 정보 조회
            Optional<Room> roomOpt = roomRepository.findById(roomId);
            if (roomOpt.isEmpty()) {
                return Map.of("success", false, "message", "방을 찾을 수 없습니다.");
            }
            
            Room room = roomOpt.get();
            
            // 위치 정보와 참여자 정보 결합
            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("roomId", roomId);
            result.put("destination", Map.of(
                "name", room.getLocationName(),
                "latitude", room.getLocationLat(),
                "longitude", room.getLocationLng()
            ));
            
            // 참여자별 위치 정보 구성
            List<Map<String, Object>> participantLocations = new ArrayList<>();
            
            for (Map.Entry<Object, Object> entry : participants.entrySet()) {
                String participantUserId = entry.getKey().toString();
                Map<Object, Object> participantData = (Map<Object, Object>) entry.getValue();
                
                Map<String, Object> participantLocation = new HashMap<>();
                participantLocation.put("userId", Long.parseLong(participantUserId));
                participantLocation.put("displayName", participantData.get("displayName"));
                participantLocation.put("joinedAt", participantData.get("joinedAt"));
                
                // 위치 정보 추가
                if (locations.containsKey(participantUserId)) {
                    Map<Object, Object> locationData = (Map<Object, Object>) locations.get(participantUserId);
                    participantLocation.put("latitude", locationData.get("latitude"));
                    participantLocation.put("longitude", locationData.get("longitude"));
                    participantLocation.put("timestamp", locationData.get("timestamp"));
                    
                    // 도착 여부 확인
                    if (room.getLocationLat() != null && room.getLocationLng() != null) {
                        boolean isArrived = locationDomainService.isArrived(
                            (Double) locationData.get("latitude"),
                            (Double) locationData.get("longitude"),
                            room.getLocationLat(),
                            room.getLocationLng(),
                            100.0 // 100m 반경
                        );
                        participantLocation.put("isArrived", isArrived);
                    }
                }
                
                participantLocations.add(participantLocation);
            }
            
            result.put("participants", participantLocations);
            
            return result;
            
        } catch (Exception e) {
            return Map.of("success", false, "message", "위치 정보 조회에 실패했습니다: " + e.getMessage());
        }
    }
    
    /**
     * 도착 상태 자동 확인 (비동기 처리)
     */
    private void checkArrivalStatus(String roomId, Long userId, double latitude, double longitude) {
        try {
            Optional<Room> roomOpt = roomRepository.findById(roomId);
            if (roomOpt.isEmpty()) return;
            
            Room room = roomOpt.get();
            if (room.getLocationLat() == null || room.getLocationLng() == null) return;
            
            // 도착 여부 확인
            boolean isArrived = locationDomainService.isArrived(
                latitude, longitude,
                room.getLocationLat(), room.getLocationLng(),
                100.0 // 100m 반경
            );
            
            if (isArrived) {
                // 도착 순위 업데이트 (Redis ZSet 사용)
                updateArrivalRank(roomId, userId);
                
                // 도착 알림 (Redis Pub/Sub 또는 WebSocket으로 전송)
                notifyArrival(roomId, userId);
            }
            
        } catch (Exception e) {
            // 로그만 남기고 실패 시에도 서비스 계속 진행
            System.err.println("도착 상태 확인 실패: " + e.getMessage());
        }
    }
    
    /**
     * 도착 순위 업데이트 (Redis ZSet 최적화)
     */
    private void updateArrivalRank(String roomId, Long userId) {
        try {
            // 현재 도착 순위 조회
            Long currentRank = redisService.getUserRank(roomId, userId);
            
            // 이미 도착 순위가 있으면 업데이트하지 않음
            if (currentRank != null) return;
            
            // 새로운 도착 순위 계산
            Set<Object> arrivalRanking = redisService.getArrivalRanking(roomId)
                .stream()
                .map(tuple -> tuple.getValue())
                .collect(Collectors.toSet());
            
            int newRank = arrivalRanking.size() + 1;
            
            // Redis ZSet에 도착 순위 저장
            redisService.updateArrivalRank(roomId, userId, newRank);
            
        } catch (Exception e) {
            System.err.println("도착 순위 업데이트 실패: " + e.getMessage());
        }
    }
    
    /**
     * 도착 알림 (Redis Pub/Sub 또는 WebSocket)
     */
    private void notifyArrival(String roomId, Long userId) {
        try {
            // Redis에 도착 알림 저장 (WebSocket에서 구독)
            Map<String, Object> arrivalNotification = Map.of(
                "type", "ARRIVAL",
                "roomId", roomId,
                "userId", userId,
                "timestamp", System.currentTimeMillis()
            );
            
            // Redis Pub/Sub 채널에 발행
            String channel = "room:" + roomId + ":notifications";
            // redisTemplate.convertAndSend(channel, arrivalNotification);
            
        } catch (Exception e) {
            System.err.println("도착 알림 전송 실패: " + e.getMessage());
        }
    }
    
    /**
     * 예상 도착 시간 계산 (배치 처리)
     */
    public Map<String, Object> calculateETA(String roomId, Long userId) {
        try {
            Optional<Room> roomOpt = roomRepository.findById(roomId);
            if (roomOpt.isEmpty()) {
                return Map.of("success", false, "message", "방을 찾을 수 없습니다.");
            }
            
            Room room = roomOpt.get();
            if (room.getLocationLat() == null || room.getLocationLng() == null) {
                return Map.of("success", false, "message", "목적지 정보가 없습니다.");
            }
            
            // 사용자 현재 위치 조회
            Map<Object, Object> userLocation = redisService.getUserLocation(userId);
            if (userLocation.isEmpty()) {
                return Map.of("success", false, "message", "사용자 위치 정보가 없습니다.");
            }
            
            double userLat = (Double) userLocation.get("latitude");
            double userLng = (Double) userLocation.get("longitude");
            
            // 평균 속도 계산 (실제로는 사용자별 속도 이력을 사용)
            double averageSpeed = 30.0; // km/h (기본값)
            
            // 예상 도착 시간 계산
            LocalDateTime eta = locationDomainService.calculateETA(
                userLat, userLng,
                room.getLocationLat(), room.getLocationLng(),
                averageSpeed
            );
            
            // 지각 확률 계산
            double lateProbability = 0.0;
            if (room.getLocationDate() != null) {
                lateProbability = locationDomainService.calculateLateProbability(
                    room.getLocationDate(), eta
                );
            }
            
            return Map.of(
                "success", true,
                "eta", eta,
                "lateProbability", lateProbability,
                "distance", locationDomainService.calculateDistance(
                    userLat, userLng,
                    room.getLocationLat(), room.getLocationLng()
                )
            );
            
        } catch (Exception e) {
            return Map.of("success", false, "message", "ETA 계산에 실패했습니다: " + e.getMessage());
        }
    }
    
    /**
     * 방 내 도착 순위 조회 (Redis ZSet 최적화)
     */
    public Map<String, Object> getArrivalRanking(String roomId) {
        try {
            Set<Object> ranking = redisService.getArrivalRanking(roomId)
                .stream()
                .map(tuple -> Map.of(
                    "userId", Long.parseLong(tuple.getValue().toString()),
                    "rank", tuple.getScore().intValue()
                ))
                .collect(Collectors.toSet());
            
            return Map.of(
                "success", true,
                "roomId", roomId,
                "ranking", ranking
            );
            
        } catch (Exception e) {
            return Map.of("success", false, "message", "도착 순위 조회에 실패했습니다: " + e.getMessage());
        }
    }
} 