package com.promisenow.api.domain.chat.service;

import com.promisenow.api.domain.chat.dto.MessageRequestDto;
import com.promisenow.api.domain.chat.dto.MessageResponseDto;
import com.promisenow.api.domain.chat.entity.Chat;
import com.promisenow.api.domain.chat.entity.Image;
import com.promisenow.api.domain.chat.repository.ChatRepository;
import com.promisenow.api.domain.chat.repository.ImageRepository;
import com.promisenow.api.domain.room.entity.RoomUser;
import com.promisenow.api.domain.room.repository.RoomUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ChatServiceImpl implements ChatService {

    private final ChatRepository chatRepository;
    private final ImageRepository imageRepository;
    private final RoomUserRepository roomUserRepository;


    @Override
    public MessageResponseDto saveMessage(MessageRequestDto messageRequestDto) {
        Optional<RoomUser> roomUser = roomUserRepository.findById(messageRequestDto.getRoomUserId());
        if (roomUser.isPresent()) {
            Chat chat = Chat.builder()
                    .messageId(messageRequestDto.getMessageId())
                    .roomUser(roomUser.get())
                    .content(messageRequestDto.getContent())
                    .type(messageRequestDto.getType())
                    .sentDate(LocalDateTime.now())
                    .build();
            chatRepository.save(chat);
            String imageUrl = null;
            // 2. 이미지 메시지면 Image 테이블에도 저장
            if (chat.getType() == Chat.ChatType.IMAGE && messageRequestDto.getImageUrl() != null) {
                imageUrl = messageRequestDto.getImageUrl();
                Image image = Image.builder()
                        .chat(chat) // FK 연관설정 (chat의 message_id 들어감)
                        .imageUrl(messageRequestDto.getImageUrl())
                        .build();
                imageRepository.save(image);
            }
            System.out.println("chatMessageDto.getType() = " + messageRequestDto.getType());
            System.out.println("chat.getType() = " + chat.getType());
            System.out.println("chatMessageDto.getImageUrl() = " + messageRequestDto.getImageUrl());
            System.out.println("chatMessageDto.getImageUrl() = " + chat.getRoomUser().getNickname());
            // WebSocket 응답 DTO 반환
            return new MessageResponseDto(
                    chat.getContent(),
                    messageRequestDto.getUserId(),
                    chat.getRoomUser().getNickname(),
                    chat.getSentDate(),
                    chat.getType() != null ? chat.getType() : null,  // Enum을 문자열로 변환,
                    imageUrl
            );
        } else {
            throw new NullPointerException("Room User Not Found");
        }
    }

    @Override
    public List<MessageResponseDto> getMessages(Long roomId) {
        List<Chat> chats = chatRepository.findByRoomUser_Room_RoomIdOrderBySentDateAsc(roomId);
        return chats.stream().map(
                chat -> {
                    String imageUrl = null;
                    if (chat.getType() == Chat.ChatType.IMAGE) {
                        Image image = imageRepository.findByChat_MessageId(chat.getMessageId());
                        if (image != null) {
                            imageUrl = image.getImageUrl();
                        }
                    }
                    return new MessageResponseDto(
                            chat.getContent(),
                            chat.getRoomUser().getUser().getUserId(),
                            chat.getRoomUser().getNickname(),
                            chat.getSentDate(),
                            chat.getType(),
                            imageUrl

                    );
                }).toList();

    }
//    private final OpenAiChatClient openAiChatClient;
//    @Override
//    public MessageResponseDto handlePinoCommand(MessageRequestDto messageRequestDto) {
//
//
//
//        return null;
//    }
}
