package com.promisenow.api.application.service;

import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.promisenow.api.domain.entity.User;
import com.promisenow.api.domain.repository.UserRepository;
import com.promisenow.api.domain.service.UserDomainService;
import com.promisenow.api.infrastructure.service.JwtService;

@Service
@Transactional
public class AuthApplicationService {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private UserDomainService userDomainService;
    
    @Autowired
    private JwtService jwtService;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    /**
     * 회원가입
     */
    public Map<String, Object> register(String userName, String password, String profileImage) {
        
        // 도메인 서비스: 사용자명 유효성 검사
        if (!userDomainService.isValidUsername(userName)) {
            throw new RuntimeException("사용자명이 유효하지 않습니다. (2-20자, 영문/숫자/한글)");
        }
        
        // 도메인 서비스: 비밀번호 유효성 검사
        if (!userDomainService.isValidPassword(password)) {
            throw new RuntimeException("비밀번호가 유효하지 않습니다. (최소 8자, 영문+숫자 포함)");
        }
        
        // 도메인 서비스: 프로필 이미지 유효성 검사
        if (!userDomainService.isValidProfileImage(profileImage)) {
            throw new RuntimeException("프로필 이미지 URL이 유효하지 않습니다.");
        }
        
        // 사용자명 중복 확인
        if (userRepository.existsByUserName(userName)) {
            throw new RuntimeException("이미 사용 중인 사용자명입니다.");
        }
        
        // 사용자 생성
        User user = new User();
        user.setUserName(userName);
        user.setPassword(passwordEncoder.encode(password));
        user.setProfileImage(profileImage);
        
        User savedUser = userRepository.save(user);
        
        // JWT 토큰 생성
        String token = jwtService.generateToken(savedUser);
        
        return Map.of(
            "success", true,
            "token", token,
            "user", Map.of(
                "userId", savedUser.getUserId(),
                "userName", savedUser.getUserName(),
                "profileImage", savedUser.getProfileImage()
            ),
            "message", "회원가입이 완료되었습니다."
        );
    }
    
    /**
     * 로그인
     */
    public Map<String, Object> login(String userName, String password) {
        
        // 사용자 조회
        Optional<User> userOpt = userRepository.findByUserName(userName);
        if (userOpt.isEmpty()) {
            throw new RuntimeException("사용자명 또는 비밀번호가 올바르지 않습니다.");
        }
        
        User user = userOpt.get();
        
        // 비밀번호 확인
        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new RuntimeException("사용자명 또는 비밀번호가 올바르지 않습니다.");
        }
        
        // JWT 토큰 생성
        String token = jwtService.generateToken(user);
        
        return Map.of(
            "success", true,
            "token", token,
            "user", Map.of(
                "userId", user.getUserId(),
                "userName", user.getUserName(),
                "profileImage", user.getProfileImage()
            ),
            "message", "로그인이 완료되었습니다."
        );
    }
    
    /**
     * 게스트 로그인 (임시 사용자)
     */
    public Map<String, Object> guestLogin(String displayName) {
        
        // 게스트 사용자명 생성
        String guestUserName = "guest_" + UUID.randomUUID().toString().substring(0, 8);
        
        // 게스트 사용자 생성 (비밀번호 없음)
        User guestUser = new User();
        guestUser.setUserName(guestUserName);
        guestUser.setPassword(""); // 게스트는 비밀번호 없음
        guestUser.setProfileImage(""); // 기본 프로필 이미지
        
        User savedGuestUser = userRepository.save(guestUser);
        
        // JWT 토큰 생성 (게스트용, 짧은 만료시간)
        String token = jwtService.generateGuestToken(savedGuestUser);
        
        return Map.of(
            "success", true,
            "token", token,
            "user", Map.of(
                "userId", savedGuestUser.getUserId(),
                "userName", displayName, // 표시용 이름
                "guestUserName", guestUserName, // 실제 사용자명
                "isGuest", true
            ),
            "message", "게스트로 입장했습니다."
        );
    }
    
    /**
     * 토큰 검증
     */
    public Optional<User> validateToken(String token) {
        try {
            String userName = jwtService.extractUsername(token);
            Optional<User> userOpt = userRepository.findByUserName(userName);
            
            if (userOpt.isPresent() && jwtService.isTokenValid(token, userOpt.get())) {
                return userOpt;
            }
            
            return Optional.empty();
        } catch (Exception e) {
            return Optional.empty();
        }
    }
    
    /**
     * 사용자 정보 조회
     */
    public Map<String, Object> getUserInfo(Long userId) {
        Optional<User> userOpt = userRepository.findById(userId);
        
        if (userOpt.isEmpty()) {
            throw new RuntimeException("사용자를 찾을 수 없습니다.");
        }
        
        User user = userOpt.get();
        
        return Map.of(
            "success", true,
            "user", Map.of(
                "userId", user.getUserId(),
                "userName", user.getUserName(),
                "profileImage", user.getProfileImage(),
                "roomId", user.getRoomId()
            )
        );
    }
    
    /**
     * 비밀번호 변경
     */
    public Map<String, Object> changePassword(Long userId, String currentPassword, String newPassword) {
        
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            throw new RuntimeException("사용자를 찾을 수 없습니다.");
        }
        
        User user = userOpt.get();
        
        // 현재 비밀번호 확인
        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new RuntimeException("현재 비밀번호가 올바르지 않습니다.");
        }
        
        // 새 비밀번호 유효성 검사
        if (!userDomainService.isValidPassword(newPassword)) {
            throw new RuntimeException("새 비밀번호가 유효하지 않습니다.");
        }
        
        // 비밀번호 변경
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        
        return Map.of(
            "success", true,
            "message", "비밀번호가 변경되었습니다."
        );
    }
} 