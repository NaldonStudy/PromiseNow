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
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ChatServiceImpl implements ChatService {

    private final ChatRepository chatRepository;
    private final ImageRepository imageRepository;
    private final RoomUserRepository roomUserRepository;
    private final NanoGptService nanoGptService; // 새로 추가!

    @Override
    public List<MessageResponseDto> saveMessagePair(MessageRequestDto req) {
        List<MessageResponseDto> result = new ArrayList<>();
        LocalDateTime now = LocalDateTime.now(); // 한 번만 호출
        Optional<RoomUser> roomUserOpt = roomUserRepository.findById(req.getRoomUserId());
        if (roomUserOpt.isEmpty()) {
            throw new NullPointerException("Room User Not Found");
        }
        RoomUser roomUser = roomUserOpt.get();

        // @PINO 명령어 처리
        if (req.getContent() != null && req.getContent().startsWith("@피노")) {
            // 1. 사용자 명령 메시지 DB 저장 및 DTO 생성
            Chat userChat = chatRepository.save(Chat.builder()
                    .roomUser(roomUser)
                    .content(req.getContent())
                    .type(Chat.ChatType.TEXT) // 명령 메시지는 일반 TEXT
                    .sentDate(now)
                    .build());
            result.add(new MessageResponseDto(
                    userChat.getContent(),
                    roomUser.getUser().getUserId(),
                    roomUser.getNickname(),
                    userChat.getSentDate(),
                    Chat.ChatType.TEXT,
                    null
            ));

            // 2. AI(PINO) 응답 생성 및 저장/DTO 생성
            String prompt = req.getContent().replaceFirst("@피노", "").trim();
            String gptReply;
            try {
                gptReply = nanoGptService.generateGptReply(prompt);
            } catch (Exception e) {
                gptReply = "AI 서버 오류: 잠시 후 다시 시도해 주세요.";
            }

            // PINO RoomUser(PK -1L 등) 가져오기
            RoomUser pinoUser = roomUserRepository.findById(-1L)
                    .orElseThrow(() -> new IllegalStateException("PINO 챗봇(RoomUser) 정보가 없음"));

            Chat aiChat = chatRepository.save(Chat.builder()
                    .roomUser(pinoUser)
                    .content(gptReply)
                    .type(Chat.ChatType.PINO)
                    .sentDate(now)
                    .build());
            result.add(new MessageResponseDto(
                    gptReply,
                    pinoUser.getUser().getUserId(),
                    pinoUser.getNickname(),
                    aiChat.getSentDate(),
                    Chat.ChatType.PINO,
                    null
            ));
            return result;
        }

        // 일반 메시지(이미지 포함)에 대한 처리
        Chat.ChatType msgType = req.getType() != null ? req.getType() : Chat.ChatType.TEXT;
        Chat chat = chatRepository.save(Chat.builder()
                .roomUser(roomUser)
                .content(req.getContent())
                .type(msgType)
                .sentDate(now)
                .build());

        String imageUrl = null;
        if (msgType == Chat.ChatType.IMAGE && req.getImageUrl() != null) {
            imageUrl = req.getImageUrl();

            // Image 엔티티에 위치 정보 직접 필드로 저장
            Image image = Image.builder()
                    .chat(chat)
                    .imageUrl(imageUrl)
                    .lat(req.getLat())
                    .lng(req.getLng())
                    .sentDate(now) // timestamp 타입이 LocalDateTime 일 경우
                    .build();
            imageRepository.save(image);
        }
        result.add(new MessageResponseDto(
                chat.getContent(),
                roomUser.getUser().getUserId(),
                roomUser.getNickname(),
                chat.getSentDate(),
                msgType,
                imageUrl
        ));
        return result;
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
}
