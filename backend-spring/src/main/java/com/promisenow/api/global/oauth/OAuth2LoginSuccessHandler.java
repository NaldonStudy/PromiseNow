package com.promisenow.api.global.oauth;

import com.promisenow.api.global.jwt.JwtTokenProvider;
import com.promisenow.api.global.jwt.RefreshTokenService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseCookie;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Slf4j
@Component
@RequiredArgsConstructor
public class OAuth2LoginSuccessHandler implements AuthenticationSuccessHandler {

    private final JwtTokenProvider jwtTokenProvider;
    private final RefreshTokenService refreshTokenService;

    @Value("${auth.front-login-uri}")
    private String frontLoginUri;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException {
        try {
            OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();

            // CustomOAuth2UserService에서 등록해준 userId 꺼내기
            Long userId = oAuth2User.getAttribute("userId");

            if (userId == null) {
                log.error("userId is null. attribute: {}", oAuth2User.getAttributes());
                response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "로그인 처리 중 오류가 발생했습니다.");
                return;
            }

            String accessToken = jwtTokenProvider.generateAccessToken(userId);
            String refreshToken = jwtTokenProvider.generateRefreshToken(userId);

            // Refresh Token을 Redis에 저장
            refreshTokenService.saveRefreshToken(userId, refreshToken);

            ResponseCookie accessCookie = jwtTokenProvider.createAccessTokenCookie(accessToken);
            ResponseCookie refreshCookie = jwtTokenProvider.createRefreshTokenCookie(refreshToken);

            response.addHeader("Set-Cookie", accessCookie.toString());
            response.addHeader("Set-Cookie", refreshCookie.toString());

            response.sendRedirect(frontLoginUri + "/home");
            
        } catch (Exception e) {
            log.error("OAuth2 로그인 성공 핸들러에서 오류 발생: {}", e.getMessage(), e);
            response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "로그인 처리 중 오류가 발생했습니다: " + e.getMessage());
        }
    }
}
