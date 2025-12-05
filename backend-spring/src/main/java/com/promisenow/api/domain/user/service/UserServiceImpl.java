package com.promisenow.api.domain.user.service;

import com.promisenow.api.domain.user.dto.UserResponseDto;
import com.promisenow.api.common.ErrorMessage;
import com.promisenow.api.domain.user.entity.User;
import com.promisenow.api.domain.user.repository.UserRepository;
import com.promisenow.api.global.oauth.KakaoOAuth2User;
import com.promisenow.api.global.util.NicknameGenerator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Slf4j
@Service
@Transactional
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {
    
    private final UserRepository userRepository;
    private final NicknameGenerator nicknameGenerator;

    /**
     * 사용자 존재 여부 파악 후 저장
     */
    @Override
    public User findOrCreateUser(KakaoOAuth2User kakaoUser) {
        try {
            Long kakaoId = kakaoUser.getId();
            
            // KakaoOAuth2User에서 안전하게 정보 추출
            String email = kakaoUser.getEmail();
            String nickname = kakaoUser.getNickname();
            
            // 이메일이 없으면 카카오 ID를 이메일로 사용 (고유 식별자 보장)
            final String finalEmail = (email != null) ? email : "kakao_" + kakaoId + "@kakao.com";
            
            // 닉네임이 없으면 랜덤 닉네임 생성
            final String finalNickname = (nickname != null) ? nickname : nicknameGenerator.generateNicknameWithNumber();

            return userRepository.findById(kakaoId)
                    .orElseGet(() -> {
                        User newUser = User.builder()
                                        .userId(kakaoId)
                                        .email(finalEmail)
                                        .username(finalNickname)
                                        .joinDate(LocalDate.now())
                                        .build();
                        return userRepository.save(newUser);
                    });
        } catch (Exception e) {
            System.err.println("Error in findOrCreateUser: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException(ErrorMessage.USER_INFO_PROCESSING_ERROR, e);
        }
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