package com.promisenow.api.infrastructure.service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.TimeUnit;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ZSetOperations;
import org.springframework.stereotype.Service;

@Service
public class RedisService {
    
    @Autowired
    private RedisTemplate<String, Object> redisTemplate;
    
    @Value("${redis.keys.user-location}")
    private String userLocationKey;
    
    @Value("${redis.keys.user-online}")
    private String userOnlineKey;
    
    @Value("${redis.keys.room-participants}")
    private String roomParticipantsKey;
    
    @Value("${redis.keys.room-locations}")
    private String roomLocationsKey;
    
    @Value("${redis.keys.room-leaderboard}")
    private String roomLeaderboardKey;
    
    @Value("${redis.keys.session-info}")
    private String sessionInfoKey;
    
    @Value("${redis.ttl.user-online}")
    private long userOnlineTtl;
    
    @Value("${redis.ttl.user-location}")
    private long userLocationTtl;
    
    @Value("${redis.ttl.session-info}")
    private long sessionInfoTtl;
    
    // ===== 사용자 위치 관리 =====
    
    /**
     * 사용자 위치 업데이트
     */
    public void updateUserLocation(Long userId, double latitude, double longitude) {
        String key = userLocationKey.replace("{userId}", userId.toString());
        
        Map<String, Object> locationData = new HashMap<>();
        locationData.put("latitude", latitude);
        locationData.put("longitude", longitude);
        locationData.put("timestamp", System.currentTimeMillis());
        
        redisTemplate.opsForHash().putAll(key, locationData);
        redisTemplate.expire(key, userLocationTtl, TimeUnit.SECONDS);
    }
    
    /**
     * 사용자 위치 조회
     */
    public Map<Object, Object> getUserLocation(Long userId) {
        String key = userLocationKey.replace("{userId}", userId.toString());
        return redisTemplate.opsForHash().entries(key);
    }
    
    // ===== 온라인 상태 관리 =====
    
    /**
     * 사용자 온라인 상태 업데이트
     */
    public void updateUserOnline(Long userId, String roomId) {
        String key = userOnlineKey.replace("{userId}", userId.toString());
        Map<String, Object> onlineData = new HashMap<>();
        onlineData.put("roomId", roomId);
        onlineData.put("lastSeen", System.currentTimeMillis());
        onlineData.put("status", "online");
        
        redisTemplate.opsForHash().putAll(key, onlineData);
        redisTemplate.expire(key, userOnlineTtl, TimeUnit.SECONDS);
    }
    
    /**
     * 사용자 온라인 상태 조회
     */
    public Map<Object, Object> getUserOnlineStatus(Long userId) {
        String key = userOnlineKey.replace("{userId}", userId.toString());
        return redisTemplate.opsForHash().entries(key);
    }
    
    /**
     * 온라인 사용자 목록 조회
     */
    public List<Long> getOnlineUsersInRoom(String roomId) {
        String pattern = userOnlineKey.replace("{userId}", "*");
        Set<String> keys = redisTemplate.keys(pattern);
        List<Long> onlineUsers = new ArrayList<>();
        
        for (String key : keys) {
            Map<Object, Object> onlineData = redisTemplate.opsForHash().entries(key);
            if (roomId.equals(onlineData.get("roomId"))) {
                String userId = key.substring(key.lastIndexOf(":") + 1);
                onlineUsers.add(Long.parseLong(userId));
            }
        }
        
        return onlineUsers;
    }
    
    // ===== 방 참여자 관리 =====
    
    /**
     * 방 참여자 추가
     */
    public void addRoomParticipant(String roomId, Long userId, String displayName) {
        String key = roomParticipantsKey.replace("{roomId}", roomId);
        Map<String, Object> participantData = new HashMap<>();
        participantData.put("userId", userId);
        participantData.put("displayName", displayName);
        participantData.put("joinedAt", System.currentTimeMillis());
        
        redisTemplate.opsForHash().put(key, userId.toString(), participantData);
    }
    
    /**
     * 방 참여자 제거
     */
    public void removeRoomParticipant(String roomId, Long userId) {
        String key = roomParticipantsKey.replace("{roomId}", roomId);
        redisTemplate.opsForHash().delete(key, userId.toString());
    }
    
    /**
     * 방 참여자 목록 조회
     */
    public Map<Object, Object> getRoomParticipants(String roomId) {
        String key = roomParticipantsKey.replace("{roomId}", roomId);
        return redisTemplate.opsForHash().entries(key);
    }
    
    // ===== 실시간 위치 공유 =====
    
    /**
     * 방 내 모든 참여자 위치 조회
     */
    public Map<Object, Object> getRoomLocations(String roomId) {
        String key = roomLocationsKey.replace("{roomId}", roomId);
        return redisTemplate.opsForHash().entries(key);
    }
    
    /**
     * 방 내 참여자 위치 업데이트
     */
    public void updateRoomLocation(String roomId, Long userId, double latitude, double longitude) {
        String key = roomLocationsKey.replace("{roomId}", roomId);
        Map<String, Object> locationData = new HashMap<>();
        locationData.put("latitude", latitude);
        locationData.put("longitude", longitude);
        locationData.put("timestamp", System.currentTimeMillis());
        
        redisTemplate.opsForHash().put(key, userId.toString(), locationData);
    }
    
    // ===== 리더보드 관리 =====
    
    /**
     * 도착 순위 업데이트 (ZSet 사용)
     */
    public void updateArrivalRank(String roomId, Long userId, int rank) {
        String key = roomLeaderboardKey.replace("{roomId}", roomId);
        ZSetOperations<String, Object> zSetOps = redisTemplate.opsForZSet();
        zSetOps.add(key, userId.toString(), rank);
    }
    
    /**
     * 도착 순위 조회
     */
    public Set<ZSetOperations.TypedTuple<Object>> getArrivalRanking(String roomId) {
        String key = roomLeaderboardKey.replace("{roomId}", roomId);
        ZSetOperations<String, Object> zSetOps = redisTemplate.opsForZSet();
        return zSetOps.rangeWithScores(key, 0, -1);
    }
    
    /**
     * 특정 사용자의 순위 조회
     */
    public Long getUserRank(String roomId, Long userId) {
        String key = roomLeaderboardKey.replace("{roomId}", roomId);
        ZSetOperations<String, Object> zSetOps = redisTemplate.opsForZSet();
        return zSetOps.rank(key, userId.toString());
    }
    
    // ===== 세션 정보 관리 =====
    
    /**
     * 세션 정보 저장
     */
    public void setSessionInfo(String roomId, Map<String, Object> sessionData) {
        String key = sessionInfoKey.replace("{roomId}", roomId);
        redisTemplate.opsForHash().putAll(key, sessionData);
        redisTemplate.expire(key, sessionInfoTtl, TimeUnit.SECONDS);
    }
    
    /**
     * 세션 정보 조회
     */
    public Map<Object, Object> getSessionInfo(String roomId) {
        String key = sessionInfoKey.replace("{roomId}", roomId);
        return redisTemplate.opsForHash().entries(key);
    }
    
    // ===== 유틸리티 메서드 =====
    
    /**
     * 키 존재 여부 확인
     */
    public boolean keyExists(String key) {
        return Boolean.TRUE.equals(redisTemplate.hasKey(key));
    }
    
    /**
     * 키 삭제
     */
    public void deleteKey(String key) {
        redisTemplate.delete(key);
    }
    
    /**
     * 패턴으로 키 삭제
     */
    public void deleteKeysByPattern(String pattern) {
        Set<String> keys = redisTemplate.keys(pattern);
        if (keys != null && !keys.isEmpty()) {
            redisTemplate.delete(keys);
        }
    }
} 