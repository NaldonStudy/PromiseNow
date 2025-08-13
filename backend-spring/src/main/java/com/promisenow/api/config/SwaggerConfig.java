package com.promisenow.api.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

import io.swagger.v3.oas.models.servers.Server;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.security.SecurityRequirement;

@Configuration
public class SwaggerConfig {
    
    @Bean
    public OpenAPI openAPI() {
        return new OpenAPI()
            .addServersItem(new Server().url("https://api.promisenow.store").description("Production Server"))
            .addServersItem(new Server().url("http://localhost:8080").description("Local Development Server"))
            
            // HttpOnly 쿠키 인증을 위한 보안 스키마 추가
            .components(new Components()
                .addSecuritySchemes("cookieAuth", 
                    new SecurityScheme()
                        .type(SecurityScheme.Type.APIKEY)
                        .in(SecurityScheme.In.COOKIE)
                        .name("access_token")
                        .description("HttpOnly 쿠키로 전송되는 JWT Access Token")
                )
            )
            
            .info(new Info()
                        .title("PromiseNow API")
                        .description("PromiseNow - 실시간 위치 기반 약속 서비스 API 문서\n\n" +
                                   "**인증 방법:**\n" +
                                   "1. OAuth2 로그인 후 HttpOnly 쿠키로 자동 설정됩니다.\n" +
                                   "2. Swagger UI에서 'Try it out' 버튼을 클릭하면 쿠키가 자동으로 전송됩니다.\n" +
                                   "3. 로컬 테스트 시에는 브라우저에서 쿠키가 활성화되어 있어야 합니다.")
                        .version("v1.0.0")
                        .contact(new Contact()
                                .name("PromiseNow Team")
                                .email("nstgic3@gmail.com"))
                        .license(new License()
                                .name("Apache 2.0")
                                .url("http://www.apache.org/licenses/LICENSE-2.0.html")));
    }
    
    /**
     * 개발 환경에서 Swagger UI 설정을 위한 추가 설정
     */
    @Bean
    @Profile("dev")
    public org.springdoc.core.customizers.OpenApiCustomizer openApiCustomizer() {
        return openApi -> {
            // 개발 환경에서 추가 서버 정보
            openApi.addServersItem(new Server()
                .url("http://localhost:8080")
                .description("Local Development (with HttpOnly cookies enabled)"));
        };
    }
} 