package com.promisenow.api.domain.chat.entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.promisenow.api.domain.room.entity.RoomUser;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "chat")
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Chat {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "message_id", nullable = false)
    private Long messageId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_user_id", nullable = false)
    private RoomUser roomUser;


    @Column(name = "content", columnDefinition = "TEXT", nullable = false)
    private String content;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false)
    private ChatType type;

    @Column(name = "sent_date", nullable = false)
    private LocalDateTime sentDate;

    @JsonFormat(shape = JsonFormat.Shape.STRING)
    public enum ChatType {
        TEXT,
        IMAGE,
        PINO,
        // enum 안에 실제 사용하는 값들로 변경하세요
    }
}