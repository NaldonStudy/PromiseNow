package com.promisenow.api.domain.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import com.promisenow.api.domain.entity.Room;
import com.promisenow.api.domain.entity.User;

@Service
public class RoomDomainService {
    
    /**
     * 사용자가 방에 참여할 수 있는지 확인
     */
    public boolean canUserJoinRoom(User user, Room room) {
        // 사용자가 이미 다른 방에 있는지 확인
        if (user.getRoomId() != null && !user.getRoomId().equals(room.getRoomId())) {
            return false;
        }
        
        // 방이 활성 상태인지 확인
        if (room.getRoomState() != Room.RoomState.ACTIVE && 
            room.getRoomState() != Room.RoomState.PLANNING) {
            return false;
        }
        
        return true;
    }
    
    /**
     * 방이 만료되었는지 확인
     */
    public boolean isRoomExpired(Room room) {
        if (room.getLocationDate() == null) {
            return false;
        }
        
        // 약속 시간으로부터 2시간 후 만료
        LocalDateTime expiryTime = room.getLocationDate().plusHours(2);
        return LocalDateTime.now().isAfter(expiryTime);
    }
    
    /**
     * 방 상태를 자동으로 업데이트
     */
    public Room.RoomState determineRoomState(Room room) {
        if (room.getLocationDate() == null) {
            return Room.RoomState.PLANNING;
        }
        
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime appointmentTime = room.getLocationDate();
        
        // 약속 시간 30분 전부터 ACTIVE
        if (now.isAfter(appointmentTime.minusMinutes(30)) && 
            now.isBefore(appointmentTime.plusHours(2))) {
            return Room.RoomState.ACTIVE;
        }
        
        // 약속 시간 2시간 후부터 FINISHED
        if (now.isAfter(appointmentTime.plusHours(2))) {
            return Room.RoomState.FINISHED;
        }
        
        return Room.RoomState.PLANNING;
    }
    
    /**
     * 방 참여자 수 제한 확인
     */
    public boolean isRoomFull(Room room, int currentParticipantCount) {
        // 기본 제한: 20명
        int maxParticipants = 20;
        return currentParticipantCount >= maxParticipants;
    }
    
    /**
     * 방 생성 권한 확인
     */
    public boolean canCreateRoom(User user) {
        // 사용자가 이미 방에 참여 중인지 확인
        if (user.getRoomId() != null) {
            return false;
        }
        
        return true;
    }
    
    /**
     * 방 삭제 권한 확인
     */
    public boolean canDeleteRoom(User user, Room room) {
        // 방 생성자만 삭제 가능
        return user.getUserId().equals(room.getCreatedBy());
    }
    
    /**
     * 방 정보 수정 권한 확인
     */
    public boolean canModifyRoom(User user, Room room) {
        // 방 생성자만 수정 가능
        return user.getUserId().equals(room.getCreatedBy());
    }
    
    /**
     * 방 링크 생성
     */
    public String generateRoomLink(String roomId, String baseUrl) {
        return baseUrl + "/room/" + roomId;
    }
    
    /**
     * 방 참여자 순위 계산
     */
    public int calculateArrivalRank(List<ParticipantInfo> participants, LocalDateTime arrivalTime) {
        return (int) participants.stream()
            .filter(p -> p.arrivedAt != null && p.arrivedAt.isBefore(arrivalTime))
            .count() + 1;
    }
    
    /**
     * 참여자 정보 클래스
     */
    public static class ParticipantInfo {
        public final Long userId;
        public final String displayName;
        public final LocalDateTime joinedAt;
        public final LocalDateTime arrivedAt;
        
        public ParticipantInfo(Long userId, String displayName, 
                             LocalDateTime joinedAt, LocalDateTime arrivedAt) {
            this.userId = userId;
            this.displayName = displayName;
            this.joinedAt = joinedAt;
            this.arrivedAt = arrivedAt;
        }
    }
} 