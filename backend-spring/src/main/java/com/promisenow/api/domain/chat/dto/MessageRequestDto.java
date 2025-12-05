package com.promisenow.api.domain.chat.dto;

import com.promisenow.api.domain.chat.entity.Chat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;


@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MessageRequestDto {
    private Long messageId;
    private Long roomUserId;
    private Long roomId;
    private Long userId;
    private String content;
    private Chat.ChatType type;
    private String imageUrl;
    private double lat;
    private double lng;
}
