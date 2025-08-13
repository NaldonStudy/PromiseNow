package com.promisenow.api.domain.user.service;

import com.promisenow.api.domain.user.dto.UserResponseDto;
import com.promisenow.api.domain.user.entity.User;
import com.promisenow.api.global.oauth.KakaoOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;

public interface UserService {
    User findOrCreateUser(KakaoOAuth2User kakaoUser);
    User findByUserId(Long userId);
} 