package com.promisenow.api.domain.user.service;

import com.promisenow.api.domain.user.dto.UserResponseDto;
import com.promisenow.api.domain.user.entity.User;
import org.springframework.security.oauth2.core.user.OAuth2User;

public interface UserService {
    User findOrCreateUser(OAuth2User oAuth2User);
    User findByUserId(Long userId);
} 