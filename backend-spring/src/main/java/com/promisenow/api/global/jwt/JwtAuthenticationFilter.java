package com.promisenow.api.global.jwt;

import com.promisenow.api.domain.user.entity.User;
import com.promisenow.api.domain.user.service.UserService;
import com.promisenow.api.global.security.OAuth2UserDetails;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.http.ResponseCookie;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Slf4j
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenProvider jwtTokenProvider;
    private final UserService userService;
    private final RefreshTokenService refreshTokenService;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        String token = null;

        // 쿠키에서 access_token 추출
        if (request.getCookies() != null) {
            for (Cookie cookie : request.getCookies()) {
                if ("access_token".equals(cookie.getName())) {
                    token = cookie.getValue();
                    break;
                }
            }
        }

        // Authorization 헤더에서 Bearer 토큰 추출 (쿠키에 없을 경우)
        if (token == null || token.isBlank()) {
            String authHeader = request.getHeader("Authorization");
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                token = authHeader.substring(7);
            }
        }

        // 토큰이 있으면 인증 처리
        if (token != null && !token.isBlank()) {
            if (jwtTokenProvider.validateToken(token)) {
                // 토큰이 유효한 경우
                try {
                    Long userId = jwtTokenProvider.getUserId(token);
                    log.debug("유효한 Access Token으로 인증 성공: userId={}", userId);
                    
                    // 사용자 정보 조회
                    User user = userService.findByUserId(userId);
                    OAuth2UserDetails userDetails = new OAuth2UserDetails(user);

                    UsernamePasswordAuthenticationToken authentication =
                            new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());

                    SecurityContextHolder.getContext().setAuthentication(authentication);
                } catch (Exception e) {
                    // 토큰은 유효하지만 사용자 정보 조회 실패 시 로그 기록
                    log.warn("토큰은 유효하지만 사용자 정보 조회 실패: {}", e.getMessage());
                    SecurityContextHolder.clearContext();
                }
            } else {
                // Access Token이 만료된 경우, Refresh Token으로 자동 재발급 시도
                log.info("Access Token 만료됨, Refresh Token으로 재발급 시도");
                try {
                    String refreshToken = jwtTokenProvider.resolveTokenFromCookie(request, "refresh_token");
                    if (refreshToken != null) {
                        // Redis에서 저장된 Refresh Token과 비교하여 검증
                        Long userId = jwtTokenProvider.getUserId(refreshToken);
                        if (refreshTokenService.validateRefreshToken(userId, refreshToken)) {
                            log.info("Redis 저장된 Refresh Token 유효, 새 Access Token 발급: userId={}", userId);
                            
                            // 새 Access Token 생성
                            String newAccessToken = jwtTokenProvider.generateAccessToken(userId);
                            ResponseCookie accessCookie = jwtTokenProvider.createAccessTokenCookie(newAccessToken);
                            response.addHeader("Set-Cookie", accessCookie.toString());
                            
                            // 사용자 정보 조회 및 인증 설정
                            User user = userService.findByUserId(userId);
                            OAuth2UserDetails userDetails = new OAuth2UserDetails(user);

                            UsernamePasswordAuthenticationToken authentication =
                                    new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());

                            SecurityContextHolder.getContext().setAuthentication(authentication);
                            log.info("토큰 재발급 및 인증 성공: userId={}", userId);
                        } else {
                            log.warn("Redis 저장된 Refresh Token이 유효하지 않음: userId={}", userId);
                        }
                    } else {
                        log.warn("Refresh Token이 없음");
                    }
                } catch (Exception e) {
                    // Refresh Token도 만료된 경우, 인증 실패
                    log.error("Refresh Token 재발급 실패: {}", e.getMessage());
                    SecurityContextHolder.clearContext();
                }
            }
        } else {
            log.debug("토큰이 없음: {}", request.getRequestURI());
        }

        filterChain.doFilter(request, response);
    }

}
