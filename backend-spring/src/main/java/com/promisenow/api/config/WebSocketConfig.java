package com.promisenow.api.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketTransportRegistration;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {
    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        //클라이언트가 /ws-chat 경로로 웹소켓 연결을 시도
        registry.addEndpoint("/ws-chat") // 서버와 웹소켓 연결을 위한 엔드포인트
                .setAllowedOriginPatterns("*")  // 또는 정확한 프론트 주소로 제한 가능
                .withSockJS(); // SockJS 지원
        //리더보드용 웹소켓 설정
        registry.addEndpoint("/ws-leaderboard")
                .setAllowedOriginPatterns("*")
                .withSockJS();
        
        registry.addEndpoint("/ws-leaderboard-native")
                .setAllowedOriginPatterns("*");
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry){
        //SimpleBroker가 해당 토픽에 메시지를 브로드캐스틍 하기 위한 엔드포인트
        registry.setApplicationDestinationPrefixes("/app");
        //브로커가 받기전에 스프링이 먼저 받는 주소
        registry.enableSimpleBroker("/topic");
    }

    @Override
    public void configureWebSocketTransport(WebSocketTransportRegistration registration) {
        registration.setMessageSizeLimit(64 * 1024) // 64KB
                   .setSendBufferSizeLimit(512 * 1024) // 512KB
                   .setSendTimeLimit(20000); // 20초
    }
}
