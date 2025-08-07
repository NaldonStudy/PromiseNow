package com.promisenow.api.domain.user.controller;

import com.promisenow.api.global.jwt.JwtTokenProvider;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

import static com.promisenow.api.common.ApiUtils.success;

@Tag(name = "로그아웃/리프레쉬 토큰 발급", description = "카카오 로그아웃과 리프레쉬 토큰 발급 API")
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final JwtTokenProvider jwtTokenProvider;

    @Value("${spring.security.oauth2.client.registration.kakao.client-id}")
    String kakaoClientId;

    @Value("${auth.front-login-uri}")
    String frontLoginUri;

    @GetMapping("/logout")
    public void logout(HttpServletResponse response) throws IOException {
        // 쿠키 삭제
        ResponseCookie expiredAccessTokenCookie = jwtTokenProvider.expireAccessTokenCookie();
        ResponseCookie expiredRefreshTokenCookie = jwtTokenProvider.expireRefreshTokenCookie();

        response.addHeader("Set-Cookie", expiredAccessTokenCookie.toString());
        response.addHeader("Set-Cookie", expiredRefreshTokenCookie.toString());

        // 카카오 로그아웃 리다이렉트
        String kakaoLogoutUrl = "https://kauth.kakao.com/oauth/logout"
                + "?client_id=" + kakaoClientId
                + "&logout_redirect_uri=" + URLEncoder.encode(frontLoginUri, StandardCharsets.UTF_8);

        response.sendRedirect(kakaoLogoutUrl);
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refreshAccessToken(HttpServletRequest request, HttpServletResponse response) {
        // 쿠키에서 refresh_token 추출
        String refreshToken = jwtTokenProvider.resolveTokenFromCookie(request, "refresh_token");

        if (refreshToken == null || !jwtTokenProvider.validateToken(refreshToken)) {
            return ResponseEntity.status(401).body("Invalid or missing refresh token");
        }

        // 토큰에서 userId 추출
        Long userId = jwtTokenProvider.getUserId(refreshToken);

        // 새 access token 발급
        String newAccessToken = jwtTokenProvider.generateAccessToken(userId);

        ResponseCookie accessCookie = jwtTokenProvider.createAccessTokenCookie(newAccessToken);
        response.addHeader("Set-Cookie", accessCookie.toString());

        return success();
    }
}
