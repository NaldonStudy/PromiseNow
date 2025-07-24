package com.promisenow.api.domain.chat.entity;

import com.promisenow.api.domain.room.entity.Room;
import com.promisenow.api.domain.room.entity.RoomUser;
import com.promisenow.api.domain.user.entity.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "Chat")
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Chat {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "message_id")
    private Long messageId;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_user_id", nullable = false)
    private RoomUser roomUser;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id", nullable = false)
    private Room room;
    
    @Column(name = "content", nullable = false, columnDefinition = "TEXT")
    private String content;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false)
    private ChatType type;
    
    public enum ChatType {
        TEXT,       // 텍스트 메시지
        IMAGE,      // 이미지
        LOCATION,   // 위치 정보
        SYSTEM      // 시스템 메시지
    }
} 