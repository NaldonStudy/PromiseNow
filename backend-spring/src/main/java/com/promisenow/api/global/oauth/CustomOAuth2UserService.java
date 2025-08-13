package com.promisenow.api.global.oauth;

import com.promisenow.api.domain.user.entity.User;
import com.promisenow.api.domain.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

@RequiredArgsConstructor
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final UserService userService;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) {
        try {
            OAuth2User oAuth2User = super.loadUser(userRequest);
            Map<String, Object> originalAttributes = oAuth2User.getAttributes();
            
            // KakaoOAuth2User로 래핑하여 타입 안전성 확보
            KakaoOAuth2User kakaoUser = new KakaoOAuth2User(originalAttributes);
            
            // 사용자 생성 또는 조회
            User user = userService.findOrCreateUser(kakaoUser);
            
            // 커스텀 속성에 userId 추가
            Map<String, Object> customAttributes = new HashMap<>(originalAttributes);
            customAttributes.put("userId", user.getUserId());

            return new DefaultOAuth2User(
                    Collections.singleton(new SimpleGrantedAuthority("ROLE_USER")),
                    customAttributes,
                    "id"
            );
        } catch (Exception e) {
            e.printStackTrace();
            throw e;
        }
    }
}
