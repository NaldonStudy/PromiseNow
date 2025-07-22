package com.promisenow.api.infrastructure.service;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.promisenow.api.domain.entity.User;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;

@Service
public class JwtService {
    
    @Value("${jwt.secret}")
    private String secretKey;
    
    @Value("${jwt.expiration}")
    private long jwtExpiration;
    
    // 게스트 토큰 만료시간 (1시간)
    private static final long GUEST_EXPIRATION = 3600000;
    
    /**
     * 사용자명 추출
     */
    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }
    
    /**
     * 만료시간 추출
     */
    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }
    
    /**
     * 클레임 추출
     */
    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }
    
    /**
     * 모든 클레임 추출
     */
    private Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
    
    /**
     * 서명 키 생성
     */
    private SecretKey getSigningKey() {
        byte[] keyBytes = secretKey.getBytes();
        return Keys.hmacShaKeyFor(keyBytes);
    }
    
    /**
     * 토큰 만료 확인
     */
    private Boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }
    
    /**
     * 일반 사용자 토큰 생성
     */
    public String generateToken(User user) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", user.getUserId());
        claims.put("userType", "MEMBER");
        return createToken(claims, user.getUserName(), jwtExpiration);
    }
    
    /**
     * 게스트 토큰 생성 (짧은 만료시간)
     */
    public String generateGuestToken(User user) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", user.getUserId());
        claims.put("userType", "GUEST");
        return createToken(claims, user.getUserName(), GUEST_EXPIRATION);
    }
    
    /**
     * 토큰 생성
     */
    private String createToken(Map<String, Object> claims, String subject, long expiration) {
        return Jwts.builder()
                .setClaims(claims)
                .setSubject(subject)
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }
    
    /**
     * 토큰 유효성 검사
     */
    public Boolean isTokenValid(String token, User user) {
        final String username = extractUsername(token);
        return (username.equals(user.getUserName()) && !isTokenExpired(token));
    }
    
    /**
     * 토큰에서 사용자 ID 추출
     */
    public Long extractUserId(String token) {
        return extractClaim(token, claims -> claims.get("userId", Long.class));
    }
    
    /**
     * 토큰에서 사용자 타입 추출
     */
    public String extractUserType(String token) {
        return extractClaim(token, claims -> claims.get("userType", String.class));
    }
    
    /**
     * 토큰 새로고침
     */
    public String refreshToken(String token) {
        final Claims claims = extractAllClaims(token);
        final String username = extractUsername(token);
        
        // 새로운 클레임 생성
        Map<String, Object> newClaims = new HashMap<>();
        newClaims.put("userId", claims.get("userId"));
        newClaims.put("userType", claims.get("userType"));
        
        return Jwts.builder()
                .setClaims(newClaims)
                .setSubject(username)
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + jwtExpiration))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }
} 