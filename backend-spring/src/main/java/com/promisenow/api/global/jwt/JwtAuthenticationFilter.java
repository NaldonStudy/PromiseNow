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
        
        String requestURI = request.getRequestURI();
        
        // Swagger UI 관련 요청은 토큰 검증 없이 통과
        if (isSwaggerRequest(requestURI)) {
            filterChain.doFilter(request, response);
            return;
        }
        
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
                    
                    // 사용자 정보 조회
                    User user = userService.findByUserId(userId);
                    OAuth2UserDetails userDetails = new OAuth2UserDetails(user);

                    UsernamePasswordAuthenticationToken authentication =
                            new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());

                    SecurityContextHolder.getContext().setAuthentication(authentication);
                } catch (Exception e) {
                    log.warn("토큰은 유효하지만 사용자 정보 조회 실패: {}", e.getMessage());
                    SecurityContextHolder.clearContext();
                }
            } else {
                // Access Token이 만료된 경우, Refresh Token으로 자동 재발급 시도
                try {
                    String refreshToken = jwtTokenProvider.resolveTokenFromCookie(request, "refresh_token");
                    if (refreshToken != null) {
                        // Redis에서 저장된 Refresh Token과 비교하여 검증
                        Long userId = jwtTokenProvider.getUserId(refreshToken);
                        if (refreshTokenService.validateRefreshToken(userId, refreshToken)) {
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
                        }
                    }
                } catch (Exception e) {
                    SecurityContextHolder.clearContext();
                }
            }
        }

        // API 요청이고 인증이 필요한 경우, 인증 상태 확인
        if (requestURI.startsWith("/api/") && !isPublicEndpoint(requestURI)) {
            if (SecurityContextHolder.getContext().getAuthentication() == null || 
                !SecurityContextHolder.getContext().getAuthentication().isAuthenticated()) {
                
                log.warn("인증되지 않은 API 요청: {}", requestURI);
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.setContentType("application/json;charset=UTF-8");
                response.getWriter().write("{\"error\":\"Unauthorized\",\"message\":\"인증이 필요합니다.\"}");
                return; // 필터 체인 중단
            }
        }

        filterChain.doFilter(request, response);
    }
    
    /**
     * Swagger UI 관련 요청인지 확인
     */
    private boolean isSwaggerRequest(String requestURI) {
        return requestURI.startsWith("/swagger-ui/") ||
               requestURI.startsWith("/v3/api-docs") ||
               requestURI.equals("/swagger-ui-config") ||
               requestURI.equals("/swagger-ui/index.html") ||
               requestURI.contains("swagger-ui") ||
               requestURI.contains("api-docs");
    }
    
    /**
     * 공개 엔드포인트인지 확인
     */
    private boolean isPublicEndpoint(String requestURI) {
        return requestURI.equals("/api/auth/refresh") || // 리프레시 토큰 재발급 (인증 불필요)
               requestURI.startsWith("/api/upload/") || // 파일 업로드
               requestURI.startsWith("/actuator/") || // 모니터링
               requestURI.startsWith("/swagger-ui/") || // Swagger UI
               requestURI.startsWith("/v3/api-docs"); // API 문서
    }
}
