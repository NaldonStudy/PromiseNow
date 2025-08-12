package com.promisenow.api.global.jwt;

import com.promisenow.api.common.ErrorMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;

@Slf4j
@Service
@RequiredArgsConstructor
public class RefreshTokenService {

    private final RedisTemplate<String, String> redisTemplate;
    private final JwtTokenProvider jwtTokenProvider;

    private static final String REFRESH_TOKEN_KEY_PREFIX = "refresh_token:";
    private static final long REFRESH_TOKEN_TTL_DAYS = 14;

    /**
     * Refresh Token을 Redis에 저장
     */
    public void saveRefreshToken(Long userId, String refreshToken) {
        try {
            String key = REFRESH_TOKEN_KEY_PREFIX + userId;
            Duration ttl = Duration.ofDays(REFRESH_TOKEN_TTL_DAYS);
            
            redisTemplate.opsForValue().set(key, refreshToken, ttl);
            log.info("Refresh Token Redis 저장 완료: userId={}, ttl={}일", userId, REFRESH_TOKEN_TTL_DAYS);
        } catch (Exception e) {
            log.error("Refresh Token Redis 저장 실패: userId={}, error={}", userId, e.getMessage());
            throw new RuntimeException(ErrorMessage.REFRESH_TOKEN_SAVE_FAILED, e);
        }
    }

    /**
     * Redis에서 Refresh Token 조회
     */
    public String getRefreshToken(Long userId) {
        try {
            String key = REFRESH_TOKEN_KEY_PREFIX + userId;
            String refreshToken = redisTemplate.opsForValue().get(key);
            
            if (refreshToken != null) {
                log.debug("Refresh Token Redis 조회 성공: userId={}", userId);
            } else {
                log.warn("Refresh Token Redis에서 찾을 수 없음: userId={}", userId);
            }
            
            return refreshToken;
        } catch (Exception e) {
            log.error("Refresh Token Redis 조회 실패: userId={}, error={}", userId, e.getMessage());
            throw new RuntimeException(ErrorMessage.REFRESH_TOKEN_GET_FAILED, e);
        }
    }

    /**
     * Refresh Token 유효성 검증 (Redis 저장된 토큰과 비교)
     */
    public boolean validateRefreshToken(Long userId, String refreshToken) {
        try {
            String storedToken = getRefreshToken(userId);
            
            if (storedToken == null) {
                log.warn("Redis에 저장된 Refresh Token 없음: userId={}", userId);
                return false;
            }

            if (!storedToken.equals(refreshToken)) {
                log.warn("Refresh Token 불일치: userId={}", userId);
                return false;
            }

            // JWT 자체 유효성 검증
            if (!jwtTokenProvider.validateToken(refreshToken)) {
                log.warn("Refresh Token JWT 유효성 검증 실패: userId={}", userId);
                return false;
            }

            // 토큰 타입 검증
            if (!jwtTokenProvider.validateTokenType(refreshToken, "refresh")) {
                log.warn("Refresh Token 타입 검증 실패: userId={}", userId);
                return false;
            }

            log.debug("Refresh Token 유효성 검증 성공: userId={}", userId);
            return true;
        } catch (Exception e) {
            log.error("Refresh Token 유효성 검증 중 오류: userId={}, error={}", userId, e.getMessage());
            return false;
        }
    }

    /**
     * Refresh Token 삭제 (로그아웃 시)
     */
    public void deleteRefreshToken(Long userId) {
        try {
            String key = REFRESH_TOKEN_KEY_PREFIX + userId;
            Boolean deleted = redisTemplate.delete(key);
            
            if (Boolean.TRUE.equals(deleted)) {
                log.info("Refresh Token Redis 삭제 완료: userId={}", userId);
            } else {
                log.warn("⚠️ Redis에서 삭제할 Refresh Token 없음: userId={}", userId);
            }
        } catch (Exception e) {
            log.error("Refresh Token Redis 삭제 실패: userId={}, error={}", userId, e.getMessage());
            throw new RuntimeException(ErrorMessage.REFRESH_TOKEN_DELETE_FAILED, e);
        }
    }

    /**
     * Redis 연결 상태 확인
     */
    public boolean isRedisAvailable() {
        try {
            redisTemplate.opsForValue().get("test");
            return true;
        } catch (Exception e) {
            log.error("Redis 연결 실패: {}", e.getMessage());
            throw new RuntimeException(ErrorMessage.REDIS_CONNECTION_FAILED, e);
        }
    }
}
