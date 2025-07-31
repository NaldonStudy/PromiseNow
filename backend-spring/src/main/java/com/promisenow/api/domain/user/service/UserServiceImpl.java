package com.promisenow.api.domain.user.service;

import com.promisenow.api.domain.user.dto.UserResponseDto;
import com.promisenow.api.domain.user.entity.User;
import com.promisenow.api.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {
    
    private final UserRepository userRepository;

    /**
     * 사용자 존재 여부 파악 후 저장
     */
    @Override
    public User findOrCreateUser(UserResponseDto userResponseDto) {
        return userRepository.findById(userResponseDto.getId())
                .orElseGet(() -> userRepository.save(userResponseDto.toEntity()));
    }

    @Override
    public User findByUserId(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("user not found"));
    }

}