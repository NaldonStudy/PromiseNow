package com.promisenow.api.global.jwt;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Component;

import io.jsonwebtoken.Claims;
import java.security.Key;
import java.util.Base64;
import java.util.Date;

@Slf4j
@Component
public class JwtTokenProvider {

    @Value("${jwt.secret}")
    private String secretKey;

    @Value("${jwt.access-expiration}")  // ex) 3600000 (1시간)
    private long accessTokenValidity;

    @Value("${jwt.refresh-expiration}") // ex) 1209600000 (14일)
    private long refreshTokenValidity;

    private Key key;

    @PostConstruct
    protected void init() {
        byte[] keyBytes = Base64.getEncoder().encode(secretKey.getBytes());
        this.key = Keys.hmacShaKeyFor(keyBytes);
    }

    /**
     * Access Token 생성
     */
    public String generateAccessToken(Long userId) {
        return createToken(userId, accessTokenValidity, "access");
    }

    /**
     * Refresh Token 생성
     */
    public String generateRefreshToken(Long userId) {
        return createToken(userId, refreshTokenValidity, "refresh");
    }

    /**
     * JWT 생성 공통 로직
     */
    public String createToken(Long userId, long validityInMillis, String type) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + validityInMillis);

        return Jwts.builder()
                .setSubject(String.valueOf(userId))
                .claim("type", type)
                .setIssuedAt(now)
                .setExpiration(expiry)
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    /**
     * 토큰에서 userId(카카오 고유 ID) 추출
     */
    public Long getUserId(String token) {
        if (token == null || token.isBlank()) {
            throw new IllegalArgumentException("JWT token is null or empty");
        }

        return Long.parseLong(Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody()
                .getSubject());
    }

    /**
     * 토큰 유효성 검증
     */
    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            log.warn("JWT 유효성 검증 실패: {}", e.getMessage());
            return false;
        }
    }
    
    /**
     * 토큰 타입 검증
     */
    public boolean validateTokenType(String token, String expectedType) {
        try {
            Claims claims = Jwts.parserBuilder()
                    .setSigningKey(key)
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
            
            String tokenType = claims.get("type", String.class);
            return expectedType.equals(tokenType);
        } catch (JwtException | IllegalArgumentException e) {
            log.warn("JWT 타입 검증 실패: {}", e.getMessage());
            return false;
        }
    }

    /**
     * 요청 쿠키에서 지정된 이름의 토큰 값을 추출
     */
    public String resolveTokenFromCookie(HttpServletRequest request, String cookieName) {
        if (request.getCookies() != null) {
            for (var cookie : request.getCookies()) {
                if (cookieName.equals(cookie.getName())) {
                    return cookie.getValue();
                }
            }
        }
        return null;
    }

    /**
     * Access Token을 담은 HttpOnly 쿠키를 생성
     */
    public ResponseCookie createAccessTokenCookie(String token) {
        ResponseCookie.ResponseCookieBuilder builder = ResponseCookie.from("access_token", token)
                .httpOnly(true)
                .path("/")
                .maxAge(accessTokenValidity / 1000); // JWT 만료시간과 일치
        
        if (isProduction()) {
            builder.secure(true).sameSite("Lax");
        } else {
            // 개발 환경에서는 Secure false, SameSite None으로 설정
            builder.secure(false).sameSite("None");
        }
        
        return builder.build();
    }

    /**
     * Refresh Token을 담은 HttpOnly 쿠키를 생성
     */
    public ResponseCookie createRefreshTokenCookie(String token) {
        ResponseCookie.ResponseCookieBuilder builder = ResponseCookie.from("refresh_token", token)
                .httpOnly(true)
                .path("/")
                .maxAge(60 * 60 * 24 * 14); // 14일
        
        if (isProduction()) {
            builder.secure(true).sameSite("Lax");
        } else {
            // 개발 환경에서는 Secure false, SameSite None으로 설정
            builder.secure(false).sameSite("None");
        }
        
        return builder.build();
    }

    /**
     * Access Token 쿠키를 즉시 만료시키는 빈 쿠키를 생성
     */
    public ResponseCookie expireAccessTokenCookie() {
        ResponseCookie.ResponseCookieBuilder builder = ResponseCookie.from("access_token", "")
                .httpOnly(true)
                .path("/")
                .maxAge(0);
        
        if (isProduction()) {
            builder.secure(true).sameSite("Lax");
        } else {
            builder.secure(false).sameSite("None");
        }
        
        return builder.build();
    }

    /**
     * Refresh Token 쿠키를 즉시 만료시키는 빈 쿠키를 생성
     */
    public ResponseCookie expireRefreshTokenCookie() {
        ResponseCookie.ResponseCookieBuilder builder = ResponseCookie.from("refresh_token", "")
                .httpOnly(true)
                .path("/")
                .maxAge(0);
        
        if (isProduction()) {
            builder.secure(true).sameSite("Lax");
        } else {
            builder.secure(false).sameSite("None");
        }
        
        return builder.build();
    }
    
    /**
     * 프로덕션 환경 여부 확인
     */
    private boolean isProduction() {
        String profile = System.getProperty("spring.profiles.active", "dev");
        return "prod".equals(profile);
    }


}
