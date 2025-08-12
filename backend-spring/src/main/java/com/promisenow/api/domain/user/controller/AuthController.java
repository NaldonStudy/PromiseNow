package com.promisenow.api.domain.user.controller;

import com.promisenow.api.common.ApiUtils;
import com.promisenow.api.global.jwt.JwtTokenProvider;
import com.promisenow.api.global.jwt.RefreshTokenService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Profile;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@Tag(name = "로그아웃/리프레쉬 토큰 발급", description = "카카오 로그아웃과 리프레쉬 토큰 발급 API")
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthController {

    private final JwtTokenProvider jwtTokenProvider;
    private final RefreshTokenService refreshTokenService;

    @Value("${spring.security.oauth2.client.registration.kakao.client-id}")
    String kakaoClientId;

    @Value("${auth.front-login-uri}")
    String frontLoginUri;

    @GetMapping("/logout")
    @Operation(
            summary = "로그아웃",
            description = "사용자 로그아웃을 처리합니다. JWT 쿠키를 삭제하고 Redis에서 Refresh Token을 삭제합니다.",
            responses = {
                    @ApiResponse(responseCode = "200", description = "로그아웃 성공")
            }
    )
    public ResponseEntity<?> logout(HttpServletRequest request, HttpServletResponse response) {
        
        // 현재 인증된 사용자의 Refresh Token을 Redis에서 삭제
        try {
            String refreshToken = jwtTokenProvider.resolveTokenFromCookie(request, "refresh_token");
            if (refreshToken != null) {
                Long userId = jwtTokenProvider.getUserId(refreshToken);
                refreshTokenService.deleteRefreshToken(userId);
                log.info("✅ Redis에서 Refresh Token 삭제 완료: userId={}", userId);
            }
        } catch (Exception e) {
            log.warn("⚠️ 로그아웃 시 Refresh Token 삭제 실패: {}", e.getMessage());
        }
        
        // 쿠키 삭제
        ResponseCookie expiredAccessTokenCookie = jwtTokenProvider.expireAccessTokenCookie();
        ResponseCookie expiredRefreshTokenCookie = jwtTokenProvider.expireRefreshTokenCookie();

        response.addHeader("Set-Cookie", expiredAccessTokenCookie.toString());
        response.addHeader("Set-Cookie", expiredRefreshTokenCookie.toString());

        log.info("🎉 로그아웃 완료");
        return ApiUtils.success("로그아웃이 완료되었습니다.");
    }

    @PostMapping("/refresh")
    @Operation(
            summary = "액세스 토큰 재발급",
            description = "Refresh Token을 사용하여 새로운 Access Token을 발급받습니다.",
            responses = {
                    @ApiResponse(responseCode = "200", description = "토큰 재발급 성공"),
                    @ApiResponse(responseCode = "401", description = "유효하지 않은 Refresh Token")
            }
    )
    public ResponseEntity<?> refreshAccessToken(HttpServletRequest request, HttpServletResponse response) {
        log.info("🔄 토큰 재발급 요청 시작");
        
        // 쿠키에서 refresh_token 추출
        String refreshToken = jwtTokenProvider.resolveTokenFromCookie(request, "refresh_token");

        if (refreshToken == null) {
            return ApiUtils.error("Refresh Token이 없습니다.");
        }

        // 토큰에서 userId 추출
        Long userId = jwtTokenProvider.getUserId(refreshToken);
        
        // Redis에서 저장된 Refresh Token과 비교하여 검증
        if (!refreshTokenService.validateRefreshToken(userId, refreshToken)) {
            return ApiUtils.error("유효하지 않은 Refresh Token입니다.");
        }

        // 새 access token 발급
        String newAccessToken = jwtTokenProvider.generateAccessToken(userId);

        // 새 access token을 쿠키에 설정
        ResponseCookie accessCookie = jwtTokenProvider.createAccessTokenCookie(newAccessToken);
        response.addHeader("Set-Cookie", accessCookie.toString());

        log.info("🎉 Access Token 재발급 완료: userId={}", userId);
        return ApiUtils.success("Access Token이 성공적으로 재발급되었습니다.");
    }
}
