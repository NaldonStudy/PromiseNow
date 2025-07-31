package com.promisenow.api.domain.user.controller;

import com.promisenow.api.domain.user.service.AuthService;
import io.swagger.v3.oas.annotations.Hidden;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;

@Tag(name = "로그인/로그아웃", description = "카카오 OAuth 2.0 인증 API")
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @Operation(
            summary = "카카오 로그인 리다이렉트",
            description = "브라우저를 통해 호출되어야 하는 API입니다.",
            responses = {
                    @ApiResponse(responseCode = "302", description = "카카오 로그인 페이지로 리디렉트")
            }
    )
    @GetMapping("/login")
    public void getKakaoRedirectUri(HttpServletResponse response) throws IOException {
        String redirectUrl = authService.getKakaoLoginUrl();
        response.sendRedirect(redirectUrl);
    }

    @Operation(
            summary = "로그아웃 (access_token 쿠키 삭제)",
            description = "프론트엔드에서 호출 시 JWT 쿠키를 삭제합니다.",
            responses = {
                    @ApiResponse(responseCode = "200", description = "로그아웃 완료")
            }
    )
    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletResponse response) {
        ResponseCookie cookie = authService.expireAccessTokenCookie();
        response.addHeader("Set-Cookie", cookie.toString());
        return ResponseEntity.ok("로그아웃 완료");
    }

    @Hidden
    @GetMapping("/callback")
    public void kakaoCallback(
            @RequestParam String code,
            HttpServletResponse response
    ) throws IOException {
        String jwt = authService.handleKakaoLogin(code);
        ResponseCookie cookie = authService.createAccessTokenCookie(jwt);
        response.addHeader("Set-Cookie", cookie.toString());
        response.sendRedirect("http://localhost:3000");
    }
}
