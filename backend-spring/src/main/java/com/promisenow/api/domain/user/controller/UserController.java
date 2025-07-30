package com.promisenow.api.domain.user.controller;

import com.promisenow.api.domain.user.dto.UserResponseDto;
import com.promisenow.api.domain.user.entity.User;
import com.promisenow.api.domain.user.service.UserService;
import com.promisenow.api.global.jwt.JwtTokenProvider;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final JwtTokenProvider jwtTokenProvider;
    private final UserService userService;

    @GetMapping("/me")
    public ResponseEntity<UserResponseDto> getMyInfo(HttpServletRequest request) {
        String token = jwtTokenProvider.resolveToken(request);
        Long userId = jwtTokenProvider.getUserId(token);
        User user = userService.findByUserId(userId);

        return ResponseEntity.ok(new UserResponseDto(user));
    }

} 