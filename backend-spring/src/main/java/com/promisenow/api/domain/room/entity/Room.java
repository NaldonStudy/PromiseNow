package com.promisenow.api.domain.room.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "Room")
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Room {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "room_id")
    private Long roomId;
    
    @Column(name = "room_title", nullable = false)
    private String roomTitle;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "room_state", nullable = false)
    private RoomState roomState;
    
    @Column(name = "invite_code", nullable = false)
    private Integer inviteCode;
    
    @Column(name = "location_date")
    private LocalDateTime locationDate;
    
    @Column(name = "location_name")
    private String locationName;
    
    @Column(name = "location_lat")
    private Double locationLat;
    
    @Column(name = "location_lng")
    private Double locationLng;
    
    @Column(name = "start_date")
    private LocalDate startDate;
    
    @Column(name = "end_date")
    private LocalDate endDate;
    
    public enum RoomState {
        WAITING,    // 대기중
        ACTIVE,     // 활성화
        COMPLETED,  // 완료
        CANCELLED   // 취소
    }
} 