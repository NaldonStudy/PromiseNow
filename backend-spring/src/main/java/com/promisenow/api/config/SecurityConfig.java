package com.promisenow.api.config;

import java.util.Arrays;

import com.promisenow.api.domain.user.service.UserService;
import com.promisenow.api.global.jwt.JwtAuthenticationFilter;
import com.promisenow.api.global.jwt.JwtTokenProvider;
import com.promisenow.api.global.jwt.RefreshTokenService;
import com.promisenow.api.global.oauth.CustomOAuth2UserService;
import com.promisenow.api.global.oauth.OAuth2LoginSuccessHandler;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.annotation.web.configurers.HeadersConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserService;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.AuthenticationFailureHandler;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    @Profile("!test")
    public SecurityFilterChain filterChain(HttpSecurity http, JwtTokenProvider jwtTokenProvider, UserService userService, RefreshTokenService refreshTokenService, OAuth2LoginSuccessHandler oAuth2SuccessHandler) throws Exception {
        http
            // CSRF 비활성화
            .csrf(AbstractHttpConfigurer::disable)
            
            // CORS 설정
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            
            // 세션 정책 설정
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            
            // JWT 필터 추가
            .addFilterBefore(new JwtAuthenticationFilter(jwtTokenProvider, userService, refreshTokenService), UsernamePasswordAuthenticationFilter.class)
            
            // 헤더 설정 (h2-console용)
            .headers(headers -> headers.frameOptions(HeadersConfigurer.FrameOptionsConfig::sameOrigin))
            
            // 요청 인증 설정
            .authorizeHttpRequests(authz -> authz
                // 공개 엔드포인트
                .requestMatchers("/actuator/**").permitAll()
                .requestMatchers("/swagger-ui/**").permitAll()
                .requestMatchers("/v3/api-docs/**").permitAll()
                .requestMatchers("/h2-console/**").permitAll()
                
                // OAuth2 관련 엔드포인트
                .requestMatchers("/oauth2/**").permitAll()
                .requestMatchers("/login/oauth2/code/**").permitAll()
                
                // 웹소켓
                .requestMatchers("/ws-chat/**").permitAll()
                
                // 파일 업로드
                .requestMatchers("/api/upload/**").permitAll()
                .requestMatchers("/uploaded-images/**").permitAll()
                
                // OPTIONS 요청
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                
                // API 엔드포인트 (인증 필요)
                .requestMatchers("/api/**").authenticated()
                
                // 기타 모든 요청 허용
                .anyRequest().permitAll()
            )
            
            // OAuth2 설정
            .oauth2Login(oauth2 -> oauth2
                .userInfoEndpoint(userInfo -> userInfo
                    .userService(customOAuth2UserService(userService))
                )
                .successHandler(oAuth2SuccessHandler)
                .failureHandler(oAuth2FailureHandler())
            );

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        
        // 허용할 오리진 설정 (개발 환경 포함)
        configuration.setAllowedOriginPatterns(Arrays.asList(
            "https://promisenow.store",
            "https://api.promisenow.store",
            "http://localhost:*",
            "http://127.0.0.1:*",
            "https://localhost:*",
            "https://127.0.0.1:*"
        ));
        
        // 허용할 HTTP 메서드
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        
        // 허용할 헤더 (쿠키 관련 헤더 포함)
        configuration.setAllowedHeaders(Arrays.asList(
            "*",
            "Authorization",
            "Content-Type",
            "X-Requested-With",
            "Accept",
            "Origin",
            "Access-Control-Request-Method",
            "Access-Control-Request-Headers"
        ));
        
        // 노출할 헤더
        configuration.setExposedHeaders(Arrays.asList(
            "Access-Control-Allow-Origin",
            "Access-Control-Allow-Credentials",
            "Set-Cookie"
        ));
        
        // 쿠키 허용 (HttpOnly 쿠키 지원을 위해 필수)
        configuration.setAllowCredentials(true);
        
        // 프리플라이트 요청 캐시 시간
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }



    // 커스텀 OAuth2UserService 빈 등록
    @Bean
    public OAuth2UserService<OAuth2UserRequest, OAuth2User> customOAuth2UserService(UserService userService) {
        return new CustomOAuth2UserService(userService);
    }



    // 로그인 실패 핸들러
    @Bean
    public AuthenticationFailureHandler oAuth2FailureHandler() {
        return (request, response, exception) -> {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("text/plain;charset=UTF-8");
            response.getWriter().write("OAuth 로그인 실패: " + exception.getMessage());
        };
    }

    @Bean
    @Profile("test")
    public SecurityFilterChain testFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable)
            .cors(AbstractHttpConfigurer::disable)
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(authz -> authz
                .requestMatchers("/actuator/**").permitAll()
                .anyRequest().permitAll()
            );

        return http.build();
    }
}