package com.promisenow.api.domain.chat.controller;

import com.promisenow.api.domain.chat.dto.MessageRequestDto;
import com.promisenow.api.domain.chat.service.ChatService;
import com.promisenow.api.domain.chat.dto.MessageResponseDto;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.util.List;

@Controller
@RequiredArgsConstructor
public class ChatWebSocketController {
    //[클라이언트] → "/app/chat" → [서버 @MessageMapping] → "/topic/chat" → [구독 중인 클라이언트들]
    private final ChatService chatService;
    private final SimpMessagingTemplate messagingTemplate;
    // /app이 생략 실제는 /app/chat
    //@MessageMapping("/chat") //스프링에서 먼저 받는 주소(메세지 처리)


    @MessageMapping("/chat")
    public void sendChatMessage(MessageRequestDto request) {
        List<MessageResponseDto> messages = chatService.saveMessagePair(request);
        Long roomId=request.getRoomId();

        for (MessageResponseDto dto : messages) {
            messagingTemplate.convertAndSend("/topic/chat/"+roomId, dto);
        }
    }
}
