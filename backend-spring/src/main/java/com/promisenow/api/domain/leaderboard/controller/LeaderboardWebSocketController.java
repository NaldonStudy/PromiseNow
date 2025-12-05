package com.promisenow.api.domain.leaderboard.controller;

import com.promisenow.api.domain.leaderboard.dto.PositionRequestDto;
import com.promisenow.api.domain.leaderboard.dto.PositionResponseDto;
import com.promisenow.api.domain.leaderboard.service.LeaderboardService;
import com.promisenow.api.domain.room.entity.Room;
import com.promisenow.api.domain.room.repository.RoomRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import java.util.List;
import java.util.Map;
import java.util.HashMap;


@Slf4j
@Controller
@RequiredArgsConstructor
public class LeaderboardWebSocketController {

    private final LeaderboardService leaderboardService;
    private final SimpMessagingTemplate messagingTemplate;
    private final RoomRepository roomRepository;

    @MessageMapping("/leaderboard/update")
    public void updateLeaderboard(PositionRequestDto message) {
        log.info("위치 업데이트 수신: roomId={}, roomUserId={}, lat={}, lng={}", 
                message.getRoomId(), message.getRoomUserId(), message.getLat(), message.getLng());
        
        try {
            Room room = roomRepository.findById(message.getRoomId())
                    .orElseThrow(() -> new IllegalArgumentException("방이 존재하지 않습니다"));

            // 방의 목적지 위치 정보가 없는 경우 처리
            if (room.getLocationLat() == null || room.getLocationLng() == null) {
                log.warn("방의 목적지 위치 정보가 설정되지 않음: roomId={}", room.getRoomId());
                return; // 위치 정보가 없으면 리더보드 업데이트를 건너뜀
            }

            // 리더보드 갱신 (속도 반환값 사용 안 하면 생략 가능)
            double velocity = leaderboardService.updateLeaderboard(
                    message.getRoomId(),
                    message.getRoomUserId(),
                    message.getLat(),
                    message.getLng(),
                    message.isOnline(),
                    room.getLocationLat(),
                    room.getLocationLng()
            );
            
            // Redis 저장 확인을 위한 추가 로그
            String userKey = "room:" + message.getRoomId() + ":user:" + message.getRoomUserId();
            String leaderboardKeyForCheck = "room:" + message.getRoomId() + ":leaderboard";
            
            // 사용자 데이터 확인
            Map<Object, Object> userData = roomRepository.findById(message.getRoomId())
                    .map(foundRoom -> {
                        try {
                            // Redis에서 직접 데이터 조회
                            return new HashMap<>(); // 임시로 빈 맵 반환
                        } catch (Exception e) {
                            log.error("Redis 데이터 조회 실패: {}", e.getMessage());
                            return new HashMap<>();
                        }
                    })
                    .orElse(new HashMap<>());
            
            Long totalUsers = leaderboardService.getLeaderboardSize(leaderboardKeyForCheck);
            
            // 최신 리더보드(온라인 유저만) 조회
            List<PositionResponseDto> board = leaderboardService.getLeaderboard(
                    message.getRoomId(),
                    room.getLocationLat(),
                    room.getLocationLng(),
                    totalUsers.intValue()
            );
            
            // 그대로 push (불필요한 변환 삭제)
            messagingTemplate.convertAndSend("/topic/leaderboard/" + message.getRoomId(), board);
            
        } catch (Exception e) {
            log.error("위치 업데이트 처리 중 오류 발생", e);
        }
    }
}