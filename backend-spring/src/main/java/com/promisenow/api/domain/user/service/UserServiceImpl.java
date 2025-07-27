package com.promisenow.api.domain.user.service;

import com.promisenow.api.domain.user.entity.User;
import com.promisenow.api.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Service
@Transactional
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {
    
    private final UserRepository userRepository;

    /**
     * 사용자 존재 여부 파악 후 저장
     */
    @Override public User findOrCreateUser(Long userId) {
        return userRepository.findById(userId)
                .orElseGet(() -> {
                    User user = User.builder()
                            .userId(userId)
                            .joinDate(LocalDate.now())
                            .build();
                    return userRepository.save(user);
                });
    }
}