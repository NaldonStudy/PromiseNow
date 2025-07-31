package com.promisenow.api.domain.chat.controller;

import com.promisenow.api.domain.chat.dto.MessageRequestDto;
import com.promisenow.api.domain.chat.service.ChatService;
import com.promisenow.api.domain.chat.dto.MessageResponseDto;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
public class WebSocketController {
    //[클라이언트] → "/app/chat" → [서버 @MessageMapping] → "/topic/chat" → [구독 중인 클라이언트들]
    private final ChatService chatService;
    // /app이 생략 실제는 /app/chat
    @MessageMapping("/chat") //스프링에서 먼저 받는 주소(메세지 처리)
    @SendTo("/topic/chat") //실행 결과를 /topic/chat으로 전송
    public MessageResponseDto sendChatMessage(MessageRequestDto messageRequestDto) {

//        System.out.println("세션 ID : "+accessor.getSessionId());
        System.out.println("서버에서 메시지 수신 : "+ messageRequestDto.getContent());
        System.out.println("서버에서 메시지 수신 : "+ messageRequestDto.getContent());
        System.out.println("서버에서 메시지 수신 : "+ messageRequestDto.getContent());

        chatService.saveMessage(messageRequestDto);
        return chatService.saveMessage(messageRequestDto);
    }

}
