package com.promisenow.api.domain.user.service;

import com.promisenow.api.domain.user.dto.UserResponseDto;
import com.promisenow.api.domain.user.entity.User;
import com.promisenow.api.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.core.user.OAuth2User;
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
    @Override
    public User findOrCreateUser(OAuth2User oAuth2User) {

        Long kakaoId = ((Number) oAuth2User.getAttribute("id")).longValue();

        return userRepository.findById(kakaoId)
                .orElseGet(() -> {
                    User newUser = User.builder()
                                    .userId(kakaoId)
                                    .joinDate(LocalDate.now())
                                    .build();
                    return userRepository.save(newUser);
                });
    }

    /**
     * 카카오 고유ID로 정보 받아오기
     */
    @Override
    public User findByUserId(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("user not found"));
    }

}