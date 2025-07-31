package com.promisenow.api.domain.user.service;

import com.promisenow.api.domain.user.dto.UserResponseDto;
import com.promisenow.api.domain.user.entity.User;

public interface UserService {
    User findOrCreateUser(UserResponseDto userResponseDto);
    User findByUserId(Long userId);
    UserResponseDto getUserProfile(Long userId);
} 