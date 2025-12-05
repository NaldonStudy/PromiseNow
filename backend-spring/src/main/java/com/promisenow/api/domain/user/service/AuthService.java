package com.promisenow.api.domain.user.service;

import com.promisenow.api.global.jwt.JwtTokenProvider;
import com.promisenow.api.global.jwt.RefreshTokenService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final JwtTokenProvider jwtTokenProvider;
    private final RefreshTokenService refreshTokenService;

    /**
     * 사용자 로그아웃 처리
     */
    public void logout(HttpServletRequest request, HttpServletResponse response) {
        // Redis에서 Refresh Token 삭제
        deleteRefreshTokenFromRedis(request);
        
        // 쿠키 삭제
        deleteAllCookies(response);
    }

    /**
     * Refresh Token을 사용하여 새로운 Access Token 발급
     */
    public boolean refreshAccessToken(HttpServletRequest request, HttpServletResponse response) {
        String refreshToken = jwtTokenProvider.resolveTokenFromCookie(request, "refresh_token");
        
        if (refreshToken == null) {
            return false;
        }

        try {
            Long userId = jwtTokenProvider.getUserId(refreshToken);
            
            if (!refreshTokenService.validateRefreshToken(userId, refreshToken)) {
                return false;
            }

            // 새 access token 발급
            String newAccessToken = jwtTokenProvider.generateAccessToken(userId);
            ResponseCookie accessCookie = jwtTokenProvider.createAccessTokenCookie(newAccessToken);
            response.addHeader("Set-Cookie", accessCookie.toString());
            
            return true;
            
        } catch (Exception e) {
            log.error("토큰 재발급 실패", e);
            return false;
        }
    }

    /**
     * Redis에서 Refresh Token 삭제
     */
    private void deleteRefreshTokenFromRedis(HttpServletRequest request) {
        try {
            String refreshToken = jwtTokenProvider.resolveTokenFromCookie(request, "refresh_token");
            if (refreshToken != null && jwtTokenProvider.validateToken(refreshToken) && !jwtTokenProvider.isTokenExpired(refreshToken)) {
                Long userId = jwtTokenProvider.getUserId(refreshToken);
                refreshTokenService.deleteRefreshToken(userId);
            }
        } catch (Exception e) {
            // Refresh Token 삭제 실패는 무시 (이미 만료되었을 수 있음)
        }
    }

    /**
     * 모든 인증 쿠키 삭제
     */
    private void deleteAllCookies(HttpServletResponse response) {
        try {
            // ResponseCookie 방식으로 쿠키 삭제
            List<ResponseCookie> allCookies = jwtTokenProvider.expireAllCookies();
            for (ResponseCookie cookie : allCookies) {
                response.addHeader("Set-Cookie", cookie.toString());
            }
        } catch (Exception e) {
            deleteCookiesDirectly(response);
        }
    }

    /**
     * 직접 쿠키 삭제 (fallback)
     */
    private void deleteCookiesDirectly(HttpServletResponse response) {
        try {
            // 기본 쿠키 삭제
            jakarta.servlet.http.Cookie accessCookie = new jakarta.servlet.http.Cookie("access_token", "");
            jakarta.servlet.http.Cookie refreshCookie = new jakarta.servlet.http.Cookie("refresh_token", "");
            
            accessCookie.setPath("/");
            refreshCookie.setPath("/");
            accessCookie.setMaxAge(0);
            refreshCookie.setMaxAge(0);
            accessCookie.setHttpOnly(true);
            refreshCookie.setHttpOnly(true);
            
            response.addCookie(accessCookie);
            response.addCookie(refreshCookie);
            
            // localhost 도메인에서도 삭제
            jakarta.servlet.http.Cookie localhostAccessCookie = new jakarta.servlet.http.Cookie("access_token", "");
            jakarta.servlet.http.Cookie localhostRefreshCookie = new jakarta.servlet.http.Cookie("refresh_token", "");
            
            localhostAccessCookie.setPath("/");
            localhostRefreshCookie.setPath("/");
            localhostAccessCookie.setMaxAge(0);
            localhostRefreshCookie.setMaxAge(0);
            localhostAccessCookie.setHttpOnly(true);
            localhostRefreshCookie.setHttpOnly(true);
            localhostAccessCookie.setDomain("localhost");
            localhostRefreshCookie.setDomain("localhost");
            
            response.addCookie(localhostAccessCookie);
            response.addCookie(localhostRefreshCookie);
            
            // .localhost 도메인에서도 삭제
            jakarta.servlet.http.Cookie dotLocalhostAccessCookie = new jakarta.servlet.http.Cookie("access_token", "");
            jakarta.servlet.http.Cookie dotLocalhostRefreshCookie = new jakarta.servlet.http.Cookie("refresh_token", "");
            
            dotLocalhostAccessCookie.setPath("/");
            dotLocalhostRefreshCookie.setPath("/");
            dotLocalhostAccessCookie.setMaxAge(0);
            dotLocalhostRefreshCookie.setMaxAge(0);
            dotLocalhostAccessCookie.setHttpOnly(true);
            dotLocalhostRefreshCookie.setHttpOnly(true);
            dotLocalhostAccessCookie.setDomain(".localhost");
            dotLocalhostRefreshCookie.setDomain(".localhost");
            
            response.addCookie(dotLocalhostAccessCookie);
            response.addCookie(dotLocalhostRefreshCookie);
            
        } catch (Exception e) {
            // 쿠키 삭제 실패는 무시
        }
    }
}
