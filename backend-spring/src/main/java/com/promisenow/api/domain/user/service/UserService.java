package com.promisenow.api.domain.user.service;

import com.promisenow.api.domain.user.entity.User;

public interface UserService {
    User findOrCreateUSer(Long userId);
} 