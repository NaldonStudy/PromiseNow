package com.promisenow.api.application.controller;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.promisenow.api.application.service.RoomApplicationService;
import com.promisenow.api.domain.entity.Room;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("/api/rooms")
@CrossOrigin(origins = {"http://localhost:5555", "http://localhost:3000"})
@Tag(name = "방 관리", description = "약속방 생성 및 관리 API")
public class RoomController {
    
    @Autowired
    private RoomApplicationService roomApplicationService;
    
    /**
     * 방 생성 (mediasoup 데모의 POST /rooms/:roomId/broadcasters 참고)
     */
    @PostMapping
    @Operation(summary = "방 생성", description = "새로운 약속방을 생성합니다.")
    public ResponseEntity<?> createRoom(@RequestBody Map<String, Object> request) {
        try {
            String roomTitle = (String) request.get("roomTitle");
            Long createdBy = Long.valueOf(request.get("createdBy").toString());
            String locationName = (String) request.get("locationName");
            Double locationLat = Double.valueOf(request.get("locationLat").toString());
            Double locationLng = Double.valueOf(request.get("locationLng").toString());
            
            Room room = roomApplicationService.createRoom(roomTitle, createdBy, locationName, locationLat, locationLng);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "roomId", room.getRoomId(),
                "roomTitle", room.getRoomTitle(),
                "message", "방이 성공적으로 생성되었습니다."
            ));
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "방 생성에 실패했습니다: " + e.getMessage()
            ));
        }
    }
    
    /**
     * 방 조회 (mediasoup 데모의 GET /rooms/:roomId 참고)
     */
    @GetMapping("/{roomId}")
    @Operation(summary = "방 조회", description = "특정 방의 정보를 조회합니다.")
    public ResponseEntity<?> getRoom(@PathVariable String roomId) {
        try {
            Optional<Room> roomOpt = roomApplicationService.getRoom(roomId);
            
            if (roomOpt.isPresent()) {
                Room room = roomOpt.get();
                return ResponseEntity.ok(Map.of(
                    "success", true,
                    "room", Map.of(
                        "roomId", room.getRoomId(),
                        "roomTitle", room.getRoomTitle(),
                        "createdBy", room.getCreatedBy(),
                        "roomState", room.getRoomState(),
                        "locationName", room.getLocationName(),
                        "locationLat", room.getLocationLat(),
                        "locationLng", room.getLocationLng(),
                        "createdAt", room.getCreatedAt()
                    )
                ));
            } else {
                return ResponseEntity.notFound().build();
            }
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "방 조회에 실패했습니다: " + e.getMessage()
            ));
        }
    }
    
    /**
     * 방 참여 (mediasoup 데모의 POST /rooms/:roomId/broadcasters 참고)
     */
    @PostMapping("/{roomId}/join")
    @Operation(summary = "방 참여", description = "사용자가 특정 방에 참여합니다.")
    public ResponseEntity<?> joinRoom(@PathVariable String roomId, @RequestBody Map<String, Object> request) {
        try {
            Long userId = Long.valueOf(request.get("userId").toString());
            
            boolean success = roomApplicationService.joinRoom(roomId, userId);
            
            if (success) {
                return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "방에 성공적으로 참여했습니다."
                ));
            } else {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "방 참여에 실패했습니다."
                ));
            }
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "방 참여에 실패했습니다: " + e.getMessage()
            ));
        }
    }
    
    /**
     * 방 나가기 (mediasoup 데모의 DELETE /rooms/:roomId/broadcasters/:broadcasterId 참고)
     */
    @PostMapping("/{roomId}/leave")
    @Operation(summary = "방 나가기", description = "사용자가 방에서 나갑니다.")
    public ResponseEntity<?> leaveRoom(@PathVariable String roomId, @RequestBody Map<String, Object> request) {
        try {
            Long userId = Long.valueOf(request.get("userId").toString());
            
            boolean success = roomApplicationService.leaveRoom(roomId, userId);
            
            if (success) {
                return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "방에서 성공적으로 나갔습니다."
                ));
            } else {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "방 나가기에 실패했습니다."
                ));
            }
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "방 나가기에 실패했습니다: " + e.getMessage()
            ));
        }
    }
    
    /**
     * 방 상태 변경
     */
    @PutMapping("/{roomId}/state")
    @Operation(summary = "방 상태 업데이트", description = "방의 상태를 업데이트합니다.")
    public ResponseEntity<?> updateRoomState(@PathVariable String roomId, @RequestBody Map<String, Object> request) {
        try {
            String stateStr = (String) request.get("state");
            Room.RoomState newState = Room.RoomState.valueOf(stateStr.toUpperCase());
            
            boolean success = roomApplicationService.updateRoomState(roomId, newState);
            
            if (success) {
                return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "방 상태가 성공적으로 변경되었습니다."
                ));
            } else {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "방 상태 변경에 실패했습니다."
                ));
            }
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "방 상태 변경에 실패했습니다: " + e.getMessage()
            ));
        }
    }
    
    /**
     * 사용자가 생성한 방 목록 조회
     */
    @GetMapping("/creator/{createdBy}")
    @Operation(summary = "생성자별 방 목록", description = "특정 사용자가 생성한 방 목록을 조회합니다.")
    public ResponseEntity<?> getRoomsByCreator(@PathVariable Long createdBy) {
        try {
            List<Room> rooms = roomApplicationService.getRoomsByCreator(createdBy);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "rooms", rooms.stream().map(room -> Map.of(
                    "roomId", room.getRoomId(),
                    "roomTitle", room.getRoomTitle(),
                    "roomState", room.getRoomState(),
                    "locationName", room.getLocationName(),
                    "createdAt", room.getCreatedAt()
                )).toList()
            ));
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "방 목록 조회에 실패했습니다: " + e.getMessage()
            ));
        }
    }
    
    /**
     * 활성 방 목록 조회
     */
    @GetMapping("/active")
    @Operation(summary = "활성 방 목록", description = "현재 활성화된 모든 방 목록을 조회합니다.")
    public ResponseEntity<?> getActiveRooms() {
        try {
            List<Room> rooms = roomApplicationService.getActiveRooms();
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "rooms", rooms.stream().map(room -> Map.of(
                    "roomId", room.getRoomId(),
                    "roomTitle", room.getRoomTitle(),
                    "locationName", room.getLocationName(),
                    "createdAt", room.getCreatedAt()
                )).toList()
            ));
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "활성 방 목록 조회에 실패했습니다: " + e.getMessage()
            ));
        }
    }
} 