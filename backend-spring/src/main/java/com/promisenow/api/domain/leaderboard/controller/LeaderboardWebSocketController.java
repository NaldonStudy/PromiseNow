package com.promisenow.api.domain.leaderboard.controller;

import com.promisenow.api.domain.leaderboard.dto.PositionRequestDto;
import com.promisenow.api.domain.leaderboard.dto.PositionResponseDto;
import com.promisenow.api.domain.leaderboard.service.LeaderboardService;
import com.promisenow.api.domain.room.entity.Room;
import com.promisenow.api.domain.room.repository.RoomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import java.util.List;


@Controller
@RequiredArgsConstructor
public class LeaderboardWebSocketController {

    private final LeaderboardService leaderboardService;
    private final SimpMessagingTemplate messagingTemplate;
    private final RoomRepository roomRepository;

    @MessageMapping("/leaderboard/update")
    public void updateLeaderboard(PositionRequestDto message) {
        Room room = roomRepository.findById(message.getRoomId())
                .orElseThrow(() -> new IllegalArgumentException("방이 존재하지 않습니다"));

        // 리더보드 갱신 (속도 반환값 사용 안 하면 생략 가능)
        leaderboardService.updateLeaderboard(
                message.getRoomId(),
                message.getRoomUserId(),
                message.getLat(),
                message.getLng(),
                message.isOnline(),
                room.getLocationLat(),
                room.getLocationLng()
        );
        String leaderboardKey = "room:" + message.getRoomId() + ":leaderboard";
        Long totalUsers = leaderboardService.getLeaderboardSize(leaderboardKey);
        // 최신 리더보드(온라인 유저만) 조회
        List<PositionResponseDto> board = leaderboardService.getLeaderboard(
                message.getRoomId(),
                room.getLocationLat(),
                room.getLocationLng(),
                totalUsers.intValue()
        );
        // 그대로 push (불필요한 변환 삭제)
        messagingTemplate.convertAndSend("/topic/leaderboard/" + message.getRoomId(), board);
    }
}