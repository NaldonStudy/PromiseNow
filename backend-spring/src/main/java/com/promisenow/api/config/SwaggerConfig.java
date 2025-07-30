package com.promisenow.api.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import io.swagger.v3.oas.models.servers.Server;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;

@Configuration
public class SwaggerConfig {
    
    @Bean
    public OpenAPI openAPI() {
        return new OpenAPI()
            .addServersItem(new Server().url("https://api.promisenow.store").description("Production Server"))
            .addServersItem(new Server().url("http://localhost:8080").description("Local Development Server"))
            
            .info(new Info()
                        .title("PromiseNow API")
                        .description("PromiseNow - 실시간 위치 기반 약속 서비스 API 문서")
                        .version("v1.0.0")
                        .contact(new Contact()
                                .name("PromiseNow Team")
                                .email("nstgic3@gmail.com"))
                        .license(new License()
                                .name("Apache 2.0")
                                .url("http://www.apache.org/licenses/LICENSE-2.0.html")));
    }
} 