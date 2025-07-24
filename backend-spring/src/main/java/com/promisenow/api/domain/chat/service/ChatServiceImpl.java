package com.promisenow.api.domain.chat.service;

import com.promisenow.api.domain.chat.entity.Chat;
import com.promisenow.api.domain.chat.repository.ChatRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
@RequiredArgsConstructor
public class ChatServiceImpl implements ChatService {
    
    private final ChatRepository chatRepository;
} 