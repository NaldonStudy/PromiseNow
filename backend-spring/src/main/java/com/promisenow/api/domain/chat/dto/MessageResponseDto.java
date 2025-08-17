package com.promisenow.api.domain.chat.dto;

import com.promisenow.api.domain.chat.entity.Chat;
import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class MessageResponseDto {
    private String content;
    private Long roomUserId;
    private Long userId;
    private String nickname;
    private LocalDateTime sentDate;
    private Chat.ChatType type;
    private String imageUrl;
}