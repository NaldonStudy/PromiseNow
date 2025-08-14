package com.promisenow.api.domain.user.controller;

import com.promisenow.api.common.ApiUtils;
import com.promisenow.api.domain.user.dto.*;
import com.promisenow.api.domain.user.entity.User;
import com.promisenow.api.domain.user.service.UserService;
import com.promisenow.api.global.jwt.JwtTokenProvider;
import com.promisenow.api.global.security.OAuth2UserDetails;
import com.promisenow.api.global.util.NicknameGenerator;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.headers.Header;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.context.annotation.Profile;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import java.util.*;


@Tag(name = "사용자 정보", description = "카카오 고유 ID, 가입날짜 확인")
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final JwtTokenProvider jwtTokenProvider;
    private final UserService userService;
    private final NicknameGenerator nicknameGenerator;

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
    @PostMapping("/me")
    public ResponseEntity<ApiUtils.ApiResponse<User>> getMyInfo(@AuthenticationPrincipal OAuth2UserDetails userDetails) {
        User user = userService.findByUserId(userDetails.getUserId());
        return ApiUtils.success(user);
    }
    
    @Operation(
            summary = "내 기본 정보 조회",
            description = "현재 로그인한 사용자의 기본 정보(닉네임, 이메일)를 반환합니다.",
            responses = {
                    @ApiResponse(
                            responseCode = "200",
                            description = "조회 성공",
                            content = @Content(mediaType = "application/json", schema = @Schema(implementation = UserBasicInfoResponseDto.class))
                    ),
                    @ApiResponse(
                            responseCode = "401",
                            description = "인증 실패"
                    )
            }
    )
    @GetMapping("/me/basic")
    public ResponseEntity<ApiUtils.ApiResponse<UserBasicInfoResponseDto>> getMyBasicInfo(@AuthenticationPrincipal OAuth2UserDetails userDetails) {
        UserBasicInfoResponseDto response = UserBasicInfoResponseDto.builder()
                .userId(userDetails.getUserId())
                .email(userDetails.getEmail())
                .nickname(userDetails.getNickname())
                .joinDate(userDetails.getJoinDate())
                .build();
        return ApiUtils.success(response);
    }
    
    @Operation(
            summary = "랜덤 닉네임 생성 테스트",
            description = "형용사+명사 형태의 랜덤 닉네임을 생성합니다.",
            responses = {
                    @ApiResponse(
                            responseCode = "200",
                            description = "생성 성공",
                            content = @Content(mediaType = "application/json", schema = @Schema(implementation = NicknameTestResponseDto.class))
                    )
            }
    )
    @GetMapping("/test/nickname")
    public ResponseEntity<ApiUtils.ApiResponse<NicknameTestResponseDto>> generateTestNickname() {
        NicknameTestResponseDto response = NicknameTestResponseDto.builder()
                .nickname(nicknameGenerator.generateNicknameWithNumber())
                .message("랜덤 닉네임이 생성되었습니다.")
                .build();
        return ApiUtils.success(response);
    }
    
    @Operation(
            summary = "OAuth2 디버깅 정보",
            description = "현재 OAuth2 사용자 정보를 확인합니다.",
            responses = {
                    @ApiResponse(
                            responseCode = "200",
                            description = "조회 성공",
                            content = @Content(mediaType = "application/json", schema = @Schema(implementation = OAuthDebugResponseDto.class))
                    ),
                    @ApiResponse(
                            responseCode = "404",
                            description = "프로덕션 환경에서는 비활성화"
                    )
            }
    )
    @GetMapping("/debug/oauth")
    public ResponseEntity<ApiUtils.ApiResponse<OAuthDebugResponseDto>> debugOAuthInfo(@AuthenticationPrincipal OAuth2UserDetails userDetails) {
        // 프로덕션 환경에서는 비활성화
        if (isProduction()) {
            return ResponseEntity.status(404).build();
        }
        
        OAuthDebugResponseDto response = OAuthDebugResponseDto.builder()
                .userId(userDetails.getUserId())
                .email(userDetails.getEmail())
                .nickname(userDetails.getNickname())
                .joinDate(userDetails.getJoinDate())
                .message("OAuth2 사용자 정보가 성공적으로 로드되었습니다.")
                .build();
        return ApiUtils.success(response);
    }
    
    @Operation(
            summary = "OAuth2 설정 확인",
            description = "OAuth2 설정이 제대로 되어 있는지 확인합니다.",
            responses = {
                    @ApiResponse(
                            responseCode = "200",
                            description = "확인 성공",
                            content = @Content(mediaType = "application/json", schema = @Schema(implementation = OAuthConfigDebugResponseDto.class))
                    ),
                    @ApiResponse(
                            responseCode = "404",
                            description = "프로덕션 환경에서는 비활성화"
                    )
            }
    )
    @GetMapping("/debug/oauth-config")
    public ResponseEntity<ApiUtils.ApiResponse<OAuthConfigDebugResponseDto>> debugOAuthConfig() {
        // 프로덕션 환경에서는 비활성화
        if (isProduction()) {
            return ResponseEntity.status(404).build();
        }
        
        OAuthConfigDebugResponseDto response = OAuthConfigDebugResponseDto.builder()
                .message("OAuth2 설정 확인 엔드포인트 접근 성공")
                .timestamp(System.currentTimeMillis())
                .status("OK")
                .build();
        return ApiUtils.success(response);
    }
    
    @Operation(
            summary = "토큰 정보 확인",
            description = "현재 토큰의 만료시간과 타입을 확인합니다.",
            responses = {
                    @ApiResponse(
                            responseCode = "200",
                            description = "확인 성공",
                            content = @Content(mediaType = "application/json", schema = @Schema(implementation = TokenInfoDebugResponseDto.class))
                    ),
                    @ApiResponse(
                            responseCode = "404",
                            description = "프로덕션 환경에서는 비활성화"
                    )
            }
    )
    @GetMapping("/debug/token-info")
    public ResponseEntity<ApiUtils.ApiResponse<TokenInfoDebugResponseDto>> debugTokenInfo(@AuthenticationPrincipal OAuth2UserDetails userDetails) {
        // 프로덕션 환경에서는 비활성화
        if (isProduction()) {
            return ResponseEntity.status(404).build();
        }
        
        TokenInfoDebugResponseDto response = TokenInfoDebugResponseDto.builder()
                .userId(userDetails.getUserId())
                .email(userDetails.getEmail())
                .nickname(userDetails.getNickname())
                .message("토큰 정보가 성공적으로 로드되었습니다.")
                .build();
        return ApiUtils.success(response);
    }
    
    /**
     * HttpOnly 쿠키 테스트용 엔드포인트
     * 개발 환경에서만 사용
     */
    @GetMapping("/test-cookie")
    @Profile("dev")
    public ResponseEntity<Map<String, Object>> testCookie(HttpServletRequest request) {
        Map<String, Object> response = new HashMap<>();
        
        // 쿠키 정보 수집
        Cookie[] cookies = request.getCookies();
        List<Map<String, String>> cookieInfo = new ArrayList<>();
        
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                Map<String, String> cookieData = new HashMap<>();
                cookieData.put("name", cookie.getName());
                cookieData.put("value", cookie.getValue().substring(0, Math.min(20, cookie.getValue().length())) + "...");
                cookieData.put("domain", cookie.getDomain());
                cookieData.put("path", cookie.getPath());
                cookieData.put("secure", String.valueOf(cookie.getSecure()));
                cookieData.put("httpOnly", String.valueOf(cookie.isHttpOnly()));
                cookieInfo.add(cookieData);
            }
        }
        
        response.put("message", "쿠키 테스트 성공");
        response.put("cookies", cookieInfo);
        response.put("timestamp", new Date());
        response.put("userAgent", request.getHeader("User-Agent"));
        
        return ResponseEntity.ok(response);
    }

    /**
     * 프로덕션 환경 여부 확인
     */
    private boolean isProduction() {
        String profile = System.getProperty("spring.profiles.active", "dev");
        return "prod".equals(profile);
    }
}
