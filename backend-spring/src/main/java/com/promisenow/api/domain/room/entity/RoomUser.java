package com.promisenow.api.domain.room.entity;

import com.promisenow.api.domain.user.entity.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "room_user")
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoomUser {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "room_user_id")
    private Long roomUserId;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id", nullable = false)
    private Room room;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @Column(name = "profile_image")
    private String profileImage;
    
    @Column(name = "nickname", nullable = false)
    private String nickname;
    
    @Column(name = "is_agreed", nullable = false)
    private Boolean isAgreed;
    
    @Column(name = "sort_order", nullable = true)
    private int sortOrder;

    public void updateAlarm(boolean isAgreed) {
        this.isAgreed = isAgreed;
    }

    public void updateNickname(String nickname) {
        this.nickname = nickname;
    }
}
