package com.promisenow.api.global.security;

import com.promisenow.api.domain.user.entity.User;
import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDate;
import java.util.Collection;
import java.util.Collections;

@Getter
public class OAuth2UserDetails implements UserDetails {
	
	// 사용자 ID 접근을 위한 메서드
	private final Long userId;
    private final String email;
    private final String username;
    private final LocalDate joinDate;
    
    public OAuth2UserDetails(User user) {
        this.userId = user.getUserId();
        this.email = user.getEmail();
        this.username = user.getUsername();
        this.joinDate = user.getJoinDate();
    }
    
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER"));
    }
    
    @Override
    public String getPassword() {
        // OAuth2 로그인이므로 비밀번호는 null
        return null;
    }
    
    @Override
    public String getUsername() {
        // UserDetails의 username은 고유 식별자로 사용
        // OAuth2에서는 email을 고유 식별자로 사용
        return this.email;
    }
    
    @Override
    public boolean isAccountNonExpired() {
        return true;
    }
    
    @Override
    public boolean isAccountNonLocked() {
        return true;
    }
    
    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }
    
    @Override
    public boolean isEnabled() {
        return true;
    }
    
    // 닉네임 접근을 위한 메서드
    public String getNickname() {
        return this.username;
    }
	
}
