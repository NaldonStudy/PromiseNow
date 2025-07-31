package com.promisenow.api.domain.chat.service;


import com.promisenow.api.domain.chat.dto.MessageRequestDto;
import com.promisenow.api.domain.chat.dto.MessageResponseDto;

import java.util.List;

public interface ChatService {
    MessageResponseDto saveMessage(MessageRequestDto messageRequestDto);
    List<MessageResponseDto> getMessages(Long roomId);
//    MessageResponseDto handlePinoCommand(MessageRequestDto messageRequestDto);
}

