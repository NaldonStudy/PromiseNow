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
    public SecurityFilterChain filterChain(HttpSecurity http, JwtTokenProvider jwtTokenProvider, UserService userService, RefreshTokenService refreshTokenService) throws Exception {
        // CORS 설정
        http.cors(cors -> cors.configurationSource(corsConfigurationSource()));


        // CSRF 설정 Disable
        http.csrf(csrf -> csrf
            .ignoringRequestMatchers("/h2-console/**")
            .disable()
        );
        // 헤더 설정
        http.headers(
            // h2-console에서 iframe을 사용함. X-Frame-Options을 위해 sameOrigin 설정
            headersCustomizer -> headersCustomizer
                .frameOptions(HeadersConfigurer.FrameOptionsConfig::sameOrigin)
        );
        http
            .csrf(AbstractHttpConfigurer::disable)
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .addFilterBefore(new JwtAuthenticationFilter(jwtTokenProvider, userService, refreshTokenService), UsernamePasswordAuthenticationFilter.class)
            .authorizeHttpRequests(authz -> authz
                .requestMatchers("/uploaded-images/**").permitAll()
                .requestMatchers("/ws-chat/**").permitAll() // 웹소켓 경로
                .requestMatchers("/ws-leaderboard/**").permitAll() // 리더보드 웹소켓 경로
                .requestMatchers("/api/upload/**").permitAll()
                .requestMatchers("/api/leaderboard/**").permitAll() // 리더보드 API 경로
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll() // OPTIONS 요청 허용
                .requestMatchers("/actuator/health").permitAll() // 헬스체크만 허용
                .requestMatchers("/actuator/info").permitAll() // 정보만 허용
                .requestMatchers("/actuator/metrics").permitAll() // 메트릭만 허용
                .requestMatchers("/swagger-ui/**").permitAll()
                .requestMatchers("/v3/api-docs/**").permitAll()
                .requestMatchers("/api/**").authenticated() // 인증 필요
                .anyRequest().authenticated() // 모든 요청에 인증 필요
            )
            .oauth2Login(oauth2 -> oauth2
                    .userInfoEndpoint(userInfo -> userInfo
                            .userService(customOAuth2UserService(userService))
                    )
                    .successHandler(oAuth2SuccessHandler(jwtTokenProvider, refreshTokenService))
                    .failureHandler(oAuth2FailureHandler())
            );


        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        
        // 프로덕션 환경에서는 특정 도메인만 허용
        if (isProduction()) {
            configuration.setAllowedOriginPatterns(Arrays.asList(
                "https://promisenow.store",
                "https://www.promisenow.store",
                "https://api.promisenow.store"
            ));
        } else {
            // 개발/테스트용으로 모든 오리진 허용
            configuration.setAllowedOriginPatterns(Arrays.asList("*"));
        }
        
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
    
    /**
     * 프로덕션 환경 여부 확인
     */
    private boolean isProduction() {
        String profile = System.getProperty("spring.profiles.active", "dev");
        return "prod".equals(profile);
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

    // 로그인 성공 핸들러
    @Bean
    public AuthenticationSuccessHandler oAuth2SuccessHandler(JwtTokenProvider jwtTokenProvider, RefreshTokenService refreshTokenService) {
        return new OAuth2LoginSuccessHandler(jwtTokenProvider, refreshTokenService);
    }

    // 로그인 실패 핸들러
    @Bean
    public AuthenticationFailureHandler oAuth2FailureHandler() {
        return (request, response, exception) -> {
            System.err.println("OAuth2 로그인 실패: " + exception.getMessage());
            exception.printStackTrace();
            
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