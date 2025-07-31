package com.promisenow.api.domain.room.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "room")
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
    private String inviteCode;
    
    @Column(name = "location_date")
    private LocalDate locationDate;

    @Column(name = "location_time")
    private LocalTime locationTime;
    
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

    @OneToMany(mappedBy = "room", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<RoomUser> roomUsers = new ArrayList<>();

    public enum RoomState {
        WAITING,    // 대기중
        ACTIVE,     // 활성화
        COMPLETED,  // 완료
        CANCELLED   // 취소
    }

    // 방 제목 변경을 위한
    public void updateTitle(String newTitle) {
        this.roomTitle = newTitle;
    }

    // 약속 기간 설정을 위한
    public void upadteDateRange(LocalDate startDate, LocalDate endDate) {
        this.startDate = startDate;
        this.endDate = endDate;
    }

    // 약속 세부내용 설정을 위한
    public void updateAppointment(LocalDate locationDate, LocalTime locationTime, String locationName, Double locationLat, Double locationLng) {
        this.locationDate = locationDate;
        this.locationTime = locationTime;
        this.locationName = locationName;
        this.locationLat = locationLat;
        this.locationLng = locationLat;
    }

    // 방 상태변경을 위한
    public void changeRoomState(RoomState newState) {
        this.roomState = newState;
    }


} 