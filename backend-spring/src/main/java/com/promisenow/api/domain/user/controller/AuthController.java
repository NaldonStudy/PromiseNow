package com.promisenow.api.domain.user.controller;

import com.promisenow.api.domain.user.service.AuthService;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;

// @CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @Value("${kakao.client-id}")
    private String kakaoClientId;

    @Value("${kakao.redirect-uri}")
    private String kakaoRedirectUri;

    /**
     * 로그인 URL 반환
     */
    @GetMapping("/login")
    public void getKakaoRedirectUri(HttpServletResponse response) throws IOException {
        String redirectUrl = "https://kauth.kakao.com/oauth/authorize"
                + "?response_type=code"
                + "&client_id=" + kakaoClientId
                + "&redirect_uri=" + kakaoRedirectUri;

        response.sendRedirect(redirectUrl);
    }

    /**
     * 로그아웃
     */
    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletResponse response) {
        ResponseCookie cookie = ResponseCookie.from("access_token", "")
                .httpOnly(true)
                .secure(false) // 개발 환경 설정
                .path("/")
                .maxAge(0) // 즉시 만료
                .sameSite("Lax") // 크로스 도메인 대응
                .build();

        response.addHeader("Set-Cookie", cookie.toString());
        return ResponseEntity.ok("로그아웃 완료");
    }

    /**
     * 받은 인가코드로 액세스토큰 발급 부터 JWT생성까지 수행 후 JWT반환
     */
    @GetMapping("/callback")
    public void kakaoCallback(@RequestParam String code, HttpServletResponse response) throws IOException {

        String jwt = authService.handleKakaoLogin(code); // 인가코드로 액세스토큰 발급, 사용자 정보 조회, DB조회, JWT생성

        // JWT를 HttpOnly 쿠키로 설정
        ResponseCookie cookie = ResponseCookie.from("access_token", jwt)
                .httpOnly(true)
                .secure(false) // 개발 환경 설정
                .path("/")
                .maxAge(60 * 60 * 3)
                .sameSite("Lax") // 크로스 도메인 대응
                .build();

        // 헤더에 Set-Cookie 추가
        response.addHeader("Set-Cookie", cookie.toString());

        response.sendRedirect("http://localhost:3000");
    }

}
