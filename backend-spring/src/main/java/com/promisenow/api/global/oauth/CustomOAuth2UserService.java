package com.promisenow.api.global.oauth;

import com.promisenow.api.domain.user.entity.User;
import com.promisenow.api.domain.user.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@RequiredArgsConstructor
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final UserService userService;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) {
        try {
            log.info("OAuth2 사용자 정보 로드 시작");
            
            OAuth2User oAuth2User = super.loadUser(userRequest);
            Map<String, Object> originalAttributes = oAuth2User.getAttributes();
            
            log.info("카카오에서 받은 원본 속성: {}", originalAttributes);
            
            // KakaoOAuth2User로 래핑하여 타입 안전성 확보
            KakaoOAuth2User kakaoUser = new KakaoOAuth2User(originalAttributes);
            log.info("KakaoOAuth2User 생성 완료: id={}, email={}, nickname={}", 
                    kakaoUser.getId(), kakaoUser.getEmail(), kakaoUser.getNickname());
            
            // 사용자 생성 또는 조회
            User user = userService.findOrCreateUser(kakaoUser);
            log.info("사용자 처리 완료: userId={}", user.getUserId());
            
            // 커스텀 속성에 userId 추가
            Map<String, Object> customAttributes = new HashMap<>(originalAttributes);
            customAttributes.put("userId", user.getUserId());

            log.info("OAuth2 사용자 정보 로드 완료");
            return new DefaultOAuth2User(
                    Collections.singleton(new SimpleGrantedAuthority("ROLE_USER")),
                    customAttributes,
                    "id"
            );
        } catch (Exception e) {
            log.error("OAuth2 사용자 정보 로드 중 오류 발생: {}", e.getMessage(), e);
            e.printStackTrace();
            throw e;
        }
    }
}
