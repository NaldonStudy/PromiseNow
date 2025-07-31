package com.promisenow.api.domain.user.service;

import org.springframework.http.ResponseCookie;

public interface AuthService {
    String handleKakaoLogin(String code);
    String getKakaoLoginUrl();
    ResponseCookie createAccessTokenCookie(String token);
    ResponseCookie expireAccessTokenCookie();
}
