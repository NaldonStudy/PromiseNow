package com.promisenow.api.global.oauth;

import com.promisenow.api.global.jwt.JwtTokenProvider;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseCookie;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;

import java.io.IOException;

@Slf4j
@RequiredArgsConstructor
public class OAuth2LoginSuccessHandler implements AuthenticationSuccessHandler {

    private final JwtTokenProvider jwtTokenProvider;

    @Value("${auth.front-login-uri}")
    private String frontLoginUri;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException {
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

        log.info("JWT 발급 성공: {}, {}", accessToken, refreshToken);

        ResponseCookie accessCookie = jwtTokenProvider.createAccessTokenCookie(accessToken);
        ResponseCookie refreshCookie = jwtTokenProvider.createRefreshTokenCookie(refreshToken);

        response.addHeader("Set-Cookie", accessCookie.toString());
        response.addHeader("Set-Cookie", refreshCookie.toString());

        response.sendRedirect(frontLoginUri+"/home");
    }
}
