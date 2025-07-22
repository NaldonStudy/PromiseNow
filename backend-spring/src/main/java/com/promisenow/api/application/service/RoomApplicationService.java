package com.promisenow.api.application.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.promisenow.api.domain.entity.Room;
import com.promisenow.api.domain.entity.User;
import com.promisenow.api.domain.repository.RoomRepository;
import com.promisenow.api.domain.repository.UserRepository;
import com.promisenow.api.domain.service.RoomDomainService;
import com.promisenow.api.infrastructure.service.RedisService;

@Service
@Transactional
public class RoomApplicationService {
    
    @Autowired
    private RoomRepository roomRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private RedisService redisService;
    
    @Autowired
    private RoomDomainService roomDomainService;
    
    /**
     * 방 생성 (mediasoup 데모의 createBroadcaster 참고)
     */
    public Room createRoom(String roomTitle, Long createdBy, String locationName, 
                          Double locationLat, Double locationLng) {
        
        // 사용자 조회
        Optional<User> userOpt = userRepository.findById(createdBy);
        if (userOpt.isEmpty()) {
            throw new RuntimeException("사용자를 찾을 수 없습니다.");
        }
        User user = userOpt.get();
        
        // 도메인 서비스: 방 생성 권한 확인
        if (!roomDomainService.canCreateRoom(user)) {
            throw new RuntimeException("방을 생성할 수 없습니다. 이미 다른 방에 참여 중입니다.");
        }
        
        // 방 ID 생성 (UUID)
        String roomId = UUID.randomUUID().toString();
        
        // 방 생성
        Room room = new Room();
        room.setRoomId(roomId);
        room.setRoomTitle(roomTitle);
        room.setCreatedBy(createdBy);
        room.setRoomState(Room.RoomState.PLANNING);
        room.setLocationName(locationName);
        room.setLocationLat(locationLat);
        room.setLocationLng(locationLng);
        room.setLocationDate(LocalDateTime.now());
        
        // 방 저장
        Room savedRoom = roomRepository.save(room);
        
        // Redis에 방 정보 저장
        redisService.setSessionInfo(roomId, Map.of(
            "roomId", roomId,
            "roomTitle", roomTitle,
            "createdBy", createdBy.toString(),
            "state", "PLANNING",
            "createdAt", System.currentTimeMillis()
        ));
        
        return savedRoom;
    }
    
    /**
     * 방 조회 (mediasoup 데모의 getOrCreateRoom 참고)
     */
    public Optional<Room> getRoom(String roomId) {
        return roomRepository.findById(roomId);
    }
    
    /**
     * 방 참여 (mediasoup 데모의 createBroadcaster 참고)
     */
    public boolean joinRoom(String roomId, Long userId) {
        
        // 방 조회
        Optional<Room> roomOpt = roomRepository.findById(roomId);
        if (roomOpt.isEmpty()) {
            return false;
        }
        
        Room room = roomOpt.get();
        
        // 사용자 조회
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            return false;
        }
        
        User user = userOpt.get();
        
        // 도메인 서비스: 방 참여 가능 여부 확인
        if (!roomDomainService.canUserJoinRoom(user, room)) {
            return false;
        }
        
        // 도메인 서비스: 방 만료 여부 확인
        if (roomDomainService.isRoomExpired(room)) {
            return false;
        }
        
        // 사용자를 방에 참여시킴
        user.setRoomId(roomId);
        userRepository.save(user);
        
        // Redis에 참여자 정보 저장
        redisService.addRoomParticipant(roomId, userId, user.getUserName());
        
        // Redis에 온라인 상태 업데이트
        redisService.updateUserOnline(userId, roomId);
        
        return true;
    }
    
    /**
     * 방 나가기 (mediasoup 데모의 deleteBroadcaster 참고)
     */
    public boolean leaveRoom(String roomId, Long userId) {
        
        // 사용자 조회
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            return false;
        }
        
        User user = userOpt.get();
        
        // 사용자가 해당 방에 있는지 확인
        if (!roomId.equals(user.getRoomId())) {
            return false;
        }
        
        // 사용자를 방에서 제거
        user.setRoomId(null);
        userRepository.save(user);
        
        // Redis에서 참여자 제거
        redisService.removeRoomParticipant(roomId, userId);
        
        return true;
    }
    
    /**
     * 방 상태 변경
     */
    public boolean updateRoomState(String roomId, Room.RoomState newState) {
        
        Optional<Room> roomOpt = roomRepository.findById(roomId);
        if (roomOpt.isEmpty()) {
            return false;
        }
        
        Room room = roomOpt.get();
        room.setRoomState(newState);
        roomRepository.save(room);
        
        // Redis 상태 업데이트
        redisService.setSessionInfo(roomId, Map.of(
            "state", newState.name(),
            "updatedAt", System.currentTimeMillis()
        ));
        
        return true;
    }
    
    /**
     * 사용자가 생성한 방 목록 조회
     */
    public List<Room> getRoomsByCreator(Long createdBy) {
        return roomRepository.findByCreatedBy(createdBy);
    }
    
    /**
     * 활성 방 목록 조회
     */
    public List<Room> getActiveRooms() {
        return roomRepository.findByRoomState(Room.RoomState.ACTIVE);
    }
} 