package com.promisenow.api.global.oauth;

import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.core.user.OAuth2User;

import java.util.Collection;
import java.util.Collections;
import java.util.Map;

@Getter
public class KakaoOAuth2User implements OAuth2User {

    private final Long id;
    private final String email;
    private final String nickname;
    private final String profileImageUrl;
    private final String thumbnailImageUrl;
    private final Map<String, Object> attributes;

    public KakaoOAuth2User(Map<String, Object> attributes) {
        this.attributes = attributes;
        this.id = extractId(attributes);
        this.email = extractEmail(attributes);
        this.nickname = extractNickname(attributes);
        this.profileImageUrl = extractProfileImageUrl(attributes);
        this.thumbnailImageUrl = extractThumbnailImageUrl(attributes);
    }

    @Override
    public Map<String, Object> getAttributes() {
        return attributes;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER"));
    }

    @Override
    public String getName() {
        return String.valueOf(id);
    }

    /**
     * 카카오 고유 ID 추출
     */
    private Long extractId(Map<String, Object> attributes) {
        Object idObj = attributes.get("id");
        if (idObj instanceof Number) {
            return ((Number) idObj).longValue();
        }
        throw new IllegalArgumentException("카카오 ID를 찾을 수 없습니다.");
    }

    /**
     * 이메일 추출
     */
    private String extractEmail(Map<String, Object> attributes) {
        @SuppressWarnings("unchecked")
        Map<String, Object> kakaoAccount = (Map<String, Object>) attributes.get("kakao_account");
        if (kakaoAccount != null) {
            Object emailObj = kakaoAccount.get("email");
            if (emailObj instanceof String) {
                return (String) emailObj;
            }
        }
        return null;
    }

    /**
     * 닉네임 추출
     */
    private String extractNickname(Map<String, Object> attributes) {
        @SuppressWarnings("unchecked")
        Map<String, Object> kakaoAccount = (Map<String, Object>) attributes.get("kakao_account");
        if (kakaoAccount != null) {
            @SuppressWarnings("unchecked")
            Map<String, Object> profile = (Map<String, Object>) kakaoAccount.get("profile");
            if (profile != null) {
                Object nicknameObj = profile.get("nickname");
                if (nicknameObj instanceof String) {
                    return (String) nicknameObj;
                }
            }
        }
        return null;
    }

    /**
     * 프로필 이미지 URL 추출
     */
    private String extractProfileImageUrl(Map<String, Object> attributes) {
        @SuppressWarnings("unchecked")
        Map<String, Object> kakaoAccount = (Map<String, Object>) attributes.get("kakao_account");
        if (kakaoAccount != null) {
            @SuppressWarnings("unchecked")
            Map<String, Object> profile = (Map<String, Object>) kakaoAccount.get("profile");
            if (profile != null) {
                Object profileImageUrlObj = profile.get("profile_image_url");
                if (profileImageUrlObj instanceof String) {
                    return (String) profileImageUrlObj;
                }
            }
        }
        return null;
    }

    /**
     * 썸네일 이미지 URL 추출
     */
    private String extractThumbnailImageUrl(Map<String, Object> attributes) {
        @SuppressWarnings("unchecked")
        Map<String, Object> kakaoAccount = (Map<String, Object>) attributes.get("kakao_account");
        if (kakaoAccount != null) {
            @SuppressWarnings("unchecked")
            Map<String, Object> profile = (Map<String, Object>) kakaoAccount.get("profile");
            if (profile != null) {
                Object thumbnailImageUrlObj = profile.get("thumbnail_image_url");
                if (thumbnailImageUrlObj instanceof String) {
                    return (String) thumbnailImageUrlObj;
                }
            }
        }
        return null;
    }

    /**
     * 이메일 수집 동의 여부 확인
     */
    public boolean isEmailNeedsAgreement() {
        @SuppressWarnings("unchecked")
        Map<String, Object> kakaoAccount = (Map<String, Object>) attributes.get("kakao_account");
        if (kakaoAccount != null) {
            Object emailNeedsAgreementObj = kakaoAccount.get("email_needs_agreement");
            return emailNeedsAgreementObj instanceof Boolean && (Boolean) emailNeedsAgreementObj;
        }
        return false;
    }

    /**
     * 이메일 유효 여부 확인
     */
    public boolean isEmailValid() {
        @SuppressWarnings("unchecked")
        Map<String, Object> kakaoAccount = (Map<String, Object>) attributes.get("kakao_account");
        if (kakaoAccount != null) {
            Object isEmailValidObj = kakaoAccount.get("is_email_valid");
            return isEmailValidObj instanceof Boolean && (Boolean) isEmailValidObj;
        }
        return false;
    }

    /**
     * 이메일 인증 여부 확인
     */
    public boolean isEmailVerified() {
        @SuppressWarnings("unchecked")
        Map<String, Object> kakaoAccount = (Map<String, Object>) attributes.get("kakao_account");
        if (kakaoAccount != null) {
            Object isEmailVerifiedObj = kakaoAccount.get("is_email_verified");
            return isEmailVerifiedObj instanceof Boolean && (Boolean) isEmailVerifiedObj;
        }
        return false;
    }

    /**
     * 닉네임 수집 동의 여부 확인
     */
    public boolean isNicknameNeedsAgreement() {
        @SuppressWarnings("unchecked")
        Map<String, Object> kakaoAccount = (Map<String, Object>) attributes.get("kakao_account");
        if (kakaoAccount != null) {
            @SuppressWarnings("unchecked")
            Map<String, Object> profile = (Map<String, Object>) kakaoAccount.get("profile");
            if (profile != null) {
                Object nicknameNeedsAgreementObj = profile.get("nickname_needs_agreement");
                return nicknameNeedsAgreementObj instanceof Boolean && (Boolean) nicknameNeedsAgreementObj;
            }
        }
        return false;
    }

    /**
     * 프로필 이미지 수집 동의 여부 확인
     */
    public boolean isProfileImageNeedsAgreement() {
        @SuppressWarnings("unchecked")
        Map<String, Object> kakaoAccount = (Map<String, Object>) attributes.get("kakao_account");
        if (kakaoAccount != null) {
            @SuppressWarnings("unchecked")
            Map<String, Object> profile = (Map<String, Object>) kakaoAccount.get("profile");
            if (profile != null) {
                Object profileImageNeedsAgreementObj = profile.get("profile_image_needs_agreement");
                return profileImageNeedsAgreementObj instanceof Boolean && (Boolean) profileImageNeedsAgreementObj;
            }
        }
        return false;
    }

    /**
     * 카카오 계정 정보가 있는지 확인
     */
    public boolean hasKakaoAccount() {
        return attributes.containsKey("kakao_account") && attributes.get("kakao_account") != null;
    }

    /**
     * 프로필 정보가 있는지 확인
     */
    public boolean hasProfile() {
        if (!hasKakaoAccount()) {
            return false;
        }
        @SuppressWarnings("unchecked")
        Map<String, Object> kakaoAccount = (Map<String, Object>) attributes.get("kakao_account");
        return kakaoAccount != null && kakaoAccount.containsKey("profile") && kakaoAccount.get("profile") != null;
    }
}
