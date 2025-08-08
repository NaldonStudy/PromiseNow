package com.promisenow.api.domain.user.controller;

import com.promisenow.api.common.ApiUtils;
import com.promisenow.api.domain.user.dto.UserResponseDto;
import com.promisenow.api.domain.user.entity.User;
import com.promisenow.api.domain.user.service.UserService;
import com.promisenow.api.global.jwt.JwtTokenProvider;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.headers.Header;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import static com.promisenow.api.common.ApiUtils.success;

@Tag(name = "사용자 정보", description = "카카오 고유 ID, 가입날짜 확인")
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final JwtTokenProvider jwtTokenProvider;
    private final UserService userService;

    @Operation(
            summary = "내 정보 조회",
            description = "HttpOnly 쿠키에 저장된 access_token JWT를 기반으로 현재 로그인한 사용자 정보를 반환합니다.",
            responses = {
                    @ApiResponse(
                            responseCode = "200",
                            description = "조회 성공",
                            content = @Content(mediaType = "application/json", schema = @Schema(implementation = UserResponseDto.class)),
                            headers = {
                                    @Header(name = "Authorization", description = "Bearer JWT access token", schema = @Schema(type = "string"), example = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6...")
                            }
                    ),
                    @ApiResponse(
                            responseCode = "401",
                            description = "인증 실패 (토큰 누락 또는 유효하지 않음)",
                            content = @Content(mediaType = "application/json", examples = {
                                    @ExampleObject(value = "{ \"error\": \"Unauthorized\" }")
                            })
                    )
            }
    )
    @GetMapping("/me")
    public ResponseEntity<ApiUtils.ApiResponse<User>> getMyInfo(@AuthenticationPrincipal Long userId) {
        User user = userService.findByUserId(userId);
        return success(user);
    }
}
