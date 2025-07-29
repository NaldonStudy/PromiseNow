package com.promisenow.api.domain.user.service;

import com.promisenow.api.domain.user.entity.User;

public interface UserService {
    User findOrCreateUser(Long userId);
    User findByUserId(Long userId);
} 