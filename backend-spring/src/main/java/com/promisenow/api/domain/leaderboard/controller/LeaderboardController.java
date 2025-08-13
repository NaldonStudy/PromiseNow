package com.promisenow.api.domain.leaderboard.controller;

import com.promisenow.api.common.ApiUtils;
import com.promisenow.api.domain.leaderboard.dto.PositionResponseDto;
import com.promisenow.api.domain.leaderboard.service.LeaderboardService;
import com.promisenow.api.domain.room.entity.Room;
import com.promisenow.api.domain.room.repository.RoomRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import static com.promisenow.api.common.ApiUtils.success;

@Slf4j
@Tag(name = "리더보드", description = "도착 순위 관련 API")
@RestController
@RequestMapping("/api/leaderboard")
@RequiredArgsConstructor
public class LeaderboardController {

    private final LeaderboardService leaderboardService;
    private final RoomRepository roomRepository;

    @Operation(
            summary = "리더보드 초기 데이터 조회",
            description = "방의 현재 리더보드 데이터를 조회합니다. 웹소켓 연결 전 초기 데이터 로드용입니다.",
            parameters = {
                    @Parameter(
                            name = "roomId",
                            description = "조회할 방의 ID",
                            example = "123",
                            required = true
                    )
            },
            responses = {
                    @ApiResponse(
                            responseCode = "200",
                            description = "리더보드 조회 성공",
                            content = @Content(
                                    mediaType = "application/json",
                                    schema = @Schema(implementation = PositionResponseDto.class),
                                    examples = @ExampleObject(
                                            name = "성공 응답 예시",
                                            value = """
                                                    {
                                                        "success": true,
                                                        "data": [
                                                            {
                                                                "roomUserId": 1,
                                                                "lat": 37.4979,
                                                                "lng": 127.0276,
                                                                "online": true,
                                                                "velocity": 5.2,
                                                                "distance": 0.8,
                                                                "progress": 0.6,
                                                                "arrived": false,
                                                                "estimatedArrivalMinutes": 15
                                                            }
                                                        ],
                                                        "message": null
                                                    }
                                                    """
                                    )
                            )
                    ),
                    @ApiResponse(responseCode = "400", description = "잘못된 요청"),
                    @ApiResponse(responseCode = "404", description = "방이 존재하지 않음")
            }
    )
    @GetMapping("/{roomId}")
    public ResponseEntity<?> getLeaderboard(@PathVariable Long roomId) {
        try {
            log.info("리더보드 초기 데이터 조회: roomId={}", roomId);

            Room room = roomRepository.findById(roomId)
                    .orElseThrow(() -> new IllegalArgumentException("방이 존재하지 않습니다"));

            // 방의 목적지 위치 정보가 없는 경우 처리
            if (room.getLocationLat() == null || room.getLocationLng() == null) {
                log.warn("방의 목적지 위치 정보가 설정되지 않음: roomId={}", room.getRoomId());
                return success(List.of()); // 빈 배열 반환
            }

            // 리더보드 데이터 조회 (최대 20명)
            List<PositionResponseDto> leaderboard = leaderboardService.getLeaderboard(
                    roomId,
                    room.getLocationLat(),
                    room.getLocationLng(),
                    20
            );

            log.info("리더보드 초기 데이터 조회 완료: 사용자 수={}", leaderboard.size());
            return success(leaderboard);

        } catch (IllegalArgumentException e) {
            return ApiUtils.error(e.getMessage());
        } catch (Exception e) {
            log.error("리더보드 초기 데이터 조회 중 오류 발생", e);
            return ApiUtils.error("리더보드 조회 실패: " + e.getMessage());
        }
    }
} 