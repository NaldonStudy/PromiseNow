package com.promisenow.api.application.controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.promisenow.api.application.service.AuthApplicationService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = {"http://localhost:5555", "http://localhost:3000"})
@Tag(name = "인증 관리", description = "사용자 인증 관련 API")
public class AuthController {
    
    @Autowired
    private AuthApplicationService authApplicationService;
    
    /**
     * 회원가입
     */
    @PostMapping("/register")
    @Operation(summary = "회원가입", description = "새로운 사용자를 등록합니다.")
    public ResponseEntity<?> register(@RequestBody Map<String, Object> request) {
        try {
            String userName = (String) request.get("userName");
            String password = (String) request.get("password");
            String profileImage = (String) request.get("profileImage");
            
            Map<String, Object> result = authApplicationService.register(userName, password, profileImage);
            
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        }
    }
    
    /**
     * 로그인
     */
    @PostMapping("/login")
    @Operation(summary = "로그인", description = "사용자 로그인을 처리합니다.")
    public ResponseEntity<?> login(@RequestBody Map<String, Object> request) {
        try {
            String userName = (String) request.get("userName");
            String password = (String) request.get("password");
            
            Map<String, Object> result = authApplicationService.login(userName, password);
            
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        }
    }
    
    /**
     * 게스트 로그인
     */
    @PostMapping("/guest")
    @Operation(summary = "게스트 로그인", description = "게스트 사용자로 로그인합니다.")
    public ResponseEntity<?> guestLogin(@RequestBody Map<String, Object> request) {
        try {
            String displayName = (String) request.get("displayName");
            
            Map<String, Object> result = authApplicationService.guestLogin(displayName);
            
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        }
    }
    
    /**
     * 토큰 검증
     */
    @PostMapping("/validate")
    @Operation(summary = "토큰 검증", description = "JWT 토큰의 유효성을 검증합니다.")
    public ResponseEntity<?> validateToken(@RequestBody Map<String, Object> request) {
        try {
            String token = (String) request.get("token");
            
            var userOpt = authApplicationService.validateToken(token);
            
            if (userOpt.isPresent()) {
                return ResponseEntity.ok(Map.of(
                    "success", true,
                    "valid", true,
                    "user", Map.of(
                        "userId", userOpt.get().getUserId(),
                        "userName", userOpt.get().getUserName()
                    )
                ));
            } else {
                return ResponseEntity.ok(Map.of(
                    "success", true,
                    "valid", false,
                    "message", "유효하지 않은 토큰입니다."
                ));
            }
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        }
    }
    
    /**
     * 사용자 정보 조회
     */
    @GetMapping("/user/{userId}")
    @Operation(summary = "사용자 정보 조회", description = "특정 사용자의 정보를 조회합니다.")
    public ResponseEntity<?> getUserInfo(@PathVariable Long userId) {
        try {
            Map<String, Object> result = authApplicationService.getUserInfo(userId);
            
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        }
    }
    
    /**
     * 비밀번호 변경
     */
    @PostMapping("/change-password")
    @Operation(summary = "비밀번호 변경", description = "사용자의 비밀번호를 변경합니다.")
    public ResponseEntity<?> changePassword(@RequestBody Map<String, Object> request) {
        try {
            Long userId = Long.valueOf(request.get("userId").toString());
            String currentPassword = (String) request.get("currentPassword");
            String newPassword = (String) request.get("newPassword");
            
            Map<String, Object> result = authApplicationService.changePassword(userId, currentPassword, newPassword);
            
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        }
    }
} 