package com.promisenow.api.domain.user.controller;

import com.promisenow.api.common.ApiUtils;
import com.promisenow.api.domain.user.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "로그아웃/리프레쉬 토큰 발급", description = "카카오 로그아웃과 리프레쉬 토큰 발급 API")
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthController {

    private final AuthService authService;

    @GetMapping("/logout")
    @Operation(
            summary = "로그아웃",
            description = "사용자 로그아웃을 처리합니다. JWT 쿠키를 삭제하고 Redis에서 Refresh Token을 삭제합니다.",
            responses = {
                    @ApiResponse(responseCode = "200", description = "로그아웃 성공")
            }
    )
    public ResponseEntity<?> logout(HttpServletRequest request, HttpServletResponse response) {
        authService.logout(request, response);
        return ApiUtils.success();
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
        boolean success = authService.refreshAccessToken(request, response);
        
        if (success) {
            return ApiUtils.success();
        } else {
            return ApiUtils.error("유효하지 않은 Refresh Token입니다.");
        }
    }
}
