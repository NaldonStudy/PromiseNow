package com.promisenow.api.domain.user.service;

import com.promisenow.api.domain.user.dto.KakaoUserResponseDto;
import com.promisenow.api.domain.user.entity.User;
import com.promisenow.api.global.jwt.JwtTokenProvider;
import com.promisenow.api.global.oauth.KakaoOAuthClient;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final KakaoOAuthClient kakaoOAuthClient;
    private final UserService userService;
    private final JwtTokenProvider jwtTokenProvider;

    @Override
    public String handleKakaoLogin(String code) {

        // 카카오 액세스 토큰 요청
        String accessToken = kakaoOAuthClient.requestAccessToken(code);

        // 카카오 유저 정보 요청
        KakaoUserResponseDto kakaoUser = kakaoOAuthClient.requestUserInfo(accessToken);

        // DB에 해당 사용자 존재 여부 확인 및 생성
        User user = userService.findOrCreateUser(kakaoUser.getId());

        // 카카오 고유 ID로 JWT 토큰 생성 후 반환
        return jwtTokenProvider.generateToken(user.getUserId());
    }
}
