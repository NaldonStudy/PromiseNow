package com.promisenow.api.domain.leaderboard.repository;

import com.promisenow.api.domain.leaderboard.dto.UserPositionDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Repository;

import java.time.Duration;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

@Slf4j
@Repository
@RequiredArgsConstructor
public class RedisLeaderboardRepository implements LeaderboardRepository {
    
    private final RedisTemplate<String, String> redisTemplate;
    
    @Override
    public void saveUserPosition(String userKey, UserPositionDto userPosition) {
        try {
            Map<String, Object> userData = userPosition.toRedisMap();
            redisTemplate.opsForHash().putAll(userKey, userData);
            log.debug("사용자 위치 정보 저장 완료: userKey={}", userKey);
        } catch (Exception e) {
            log.error("사용자 위치 정보 저장 실패: userKey={}, error={}", userKey, e.getMessage());
            throw new RuntimeException("사용자 위치 정보 저장 실패", e);
        }
    }
    
    @Override
    public UserPositionDto getUserPosition(String userKey) {
        try {
            Map<Object, Object> redisData = redisTemplate.opsForHash().entries(userKey);
            UserPositionDto userPosition = UserPositionDto.fromRedisMap(redisData);
            log.debug("사용자 위치 정보 조회 완료: userKey={}, dataSize={}", userKey, redisData.size());
            return userPosition;
        } catch (Exception e) {
            log.error("사용자 위치 정보 조회 실패: userKey={}, error={}", userKey, e.getMessage());
            throw new RuntimeException("사용자 위치 정보 조회 실패", e);
        }
    }
    
    @Override
    public void setOnlineStatus(String onlineKey, boolean online, long ttlSeconds) {
        try {
            if (online) {
                redisTemplate.opsForValue().set(onlineKey, "true", Duration.ofSeconds(ttlSeconds));
                log.debug("온라인 상태 설정 완료: onlineKey={}, ttl={}초", onlineKey, ttlSeconds);
            } else {
                redisTemplate.delete(onlineKey);
                log.debug("오프라인 상태 설정 완료: onlineKey={}", onlineKey);
            }
        } catch (Exception e) {
            log.error("온라인 상태 설정 실패: onlineKey={}, error={}", onlineKey, e.getMessage());
            throw new RuntimeException("온라인 상태 설정 실패", e);
        }
    }
    
    @Override
    public boolean isOnline(String onlineKey) {
        try {
            boolean isOnline = redisTemplate.hasKey(onlineKey);
            log.debug("온라인 상태 확인: onlineKey={}, isOnline={}", onlineKey, isOnline);
            return isOnline;
        } catch (Exception e) {
            log.error("온라인 상태 확인 실패: onlineKey={}, error={}", onlineKey, e.getMessage());
            return false;
        }
    }
    
    @Override
    public void addToLeaderboard(String leaderboardKey, String roomUserId, double score) {
        try {
            redisTemplate.opsForZSet().add(leaderboardKey, roomUserId, score);
            log.debug("리더보드 추가 완료: leaderboardKey={}, roomUserId={}, score={}", leaderboardKey, roomUserId, score);
        } catch (Exception e) {
            log.error("리더보드 추가 실패: leaderboardKey={}, roomUserId={}, error={}", leaderboardKey, roomUserId, e.getMessage());
            throw new RuntimeException("리더보드 추가 실패", e);
        }
    }
    
    @Override
    public void addToArrivalOrder(String arrivalOrderKey, String roomUserId, long timestamp) {
        try {
            redisTemplate.opsForZSet().add(arrivalOrderKey, roomUserId, timestamp);
            log.debug("도착 순서 추가 완료: arrivalOrderKey={}, roomUserId={}, timestamp={}", arrivalOrderKey, roomUserId, timestamp);
        } catch (Exception e) {
            log.error("도착 순서 추가 실패: arrivalOrderKey={}, roomUserId={}, error={}", arrivalOrderKey, roomUserId, e.getMessage());
            throw new RuntimeException("도착 순서 추가 실패", e);
        }
    }
    
    @Override
    public Set<Object> getTopUsers(String leaderboardKey, int topN) {
        try {
            Set<String> topUsers = redisTemplate.opsForZSet().range(leaderboardKey, 0, topN - 1);
            Set<Object> result = topUsers != null ? new HashSet<>(topUsers) : new HashSet<>();
            log.debug("리더보드 상위 사용자 조회 완료: leaderboardKey={}, topN={}, resultSize={}", leaderboardKey, topN, result.size());
            return result;
        } catch (Exception e) {
            log.error("리더보드 상위 사용자 조회 실패: leaderboardKey={}, topN={}, error={}", leaderboardKey, topN, e.getMessage());
            throw new RuntimeException("리더보드 상위 사용자 조회 실패", e);
        }
    }
    
    @Override
    public Long getLeaderboardSize(String leaderboardKey) {
        try {
            Long size = redisTemplate.opsForZSet().zCard(leaderboardKey);
            log.debug("리더보드 크기 조회 완료: leaderboardKey={}, size={}", leaderboardKey, size);
            return size;
        } catch (Exception e) {
            log.error("리더보드 크기 조회 실패: leaderboardKey={}, error={}", leaderboardKey, e.getMessage());
            throw new RuntimeException("리더보드 크기 조회 실패", e);
        }
    }
    
    @Override
    public boolean testConnection() {
        try {
            redisTemplate.opsForValue().set("test:connection", "test", Duration.ofSeconds(10));
            String testValue = redisTemplate.opsForValue().get("test:connection");
            boolean isConnected = testValue != null;
            log.info("Redis 연결 테스트: {}", isConnected ? "성공" : "실패");
            return isConnected;
        } catch (Exception e) {
            log.error("Redis 연결 테스트 실패: {}", e.getMessage());
            return false;
        }
    }
}
