package com.promisenow.api.domain.roulette.controller;

import com.promisenow.api.common.ApiUtils;
import com.promisenow.api.domain.roulette.dto.RouletteRequestDto;
import com.promisenow.api.domain.roulette.dto.RouletteResponseDto;
import com.promisenow.api.domain.roulette.service.RouletteService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import static com.promisenow.api.common.ApiUtils.success;

@Tag(name = "유저별 룰렛 정보", description = "룸별 유저의 룰렛 항목 생성/조회/수정/삭제 API")
@RestController
@RequestMapping("/api/roulette")
@RequiredArgsConstructor
public class RouletteController {

    private final RouletteService rouletteService;

    @Operation(
            summary = "룰렛 항목 생성",
            description = "roomId와 roomUserId를 기반으로 룰렛 항목을 등록합니다. 같은 사용자(roomUserId)는 해당 roomId에 한 개만 등록 가능합니다.",
            responses = {
                    @ApiResponse(responseCode = "200", description = "생성 성공"),
                    @ApiResponse(responseCode = "400", description = "중복 등록 혹은 유효하지 않은 요청")
            }
    )
    @PostMapping("/create")
    public ResponseEntity<ApiUtils.ApiResponse<Long>> createRouletteContent(@RequestBody
                                       @io.swagger.v3.oas.annotations.parameters.RequestBody(
                                               description = "생성할 룰렛 항목 정보",
                                               required = true,
                                               content = @Content(schema = @Schema(implementation = RouletteRequestDto.class))
                                       )
                                       RouletteRequestDto dto) {
        Long rouletteId = rouletteService.createRouletteContent(dto);
        return success(rouletteId);
    }

    @Operation(
            summary = "해당 방의 룰렛 항목 전체 조회",
            description = "roomId에 해당하는 룸의 모든 룰렛 항목을 조회합니다."
    )
    @GetMapping("/read/{roomId}")
    public ResponseEntity<ApiUtils.ApiResponse<List<RouletteResponseDto>>> getAllContentsByRoomId(
            @Parameter(description = "조회할 룸 ID", example = "123456") @PathVariable Long roomId) {
        return success(rouletteService.getAllContentsByRoomId(roomId));
    }

    @Operation(
            summary = "룰렛 항목 수정",
            description = "rouletteId와 roomId + roomUserId를 기반으로 본인이 쓴 항목을 수정합니다.",
            responses = {
                    @ApiResponse(responseCode = "200", description = "수정 성공"),
                    @ApiResponse(responseCode = "400", description = "권한 없음 또는 유효하지 않은 요청")
            }
    )
    @PutMapping("/update/{rouletteId}")
    public ResponseEntity<ApiUtils.ApiResponse<ApiUtils.Unit>> updateRouletteContent(
            @Parameter(description = "수정할 룰렛 항목 ID", example = "7") @PathVariable Long rouletteId,
            @RequestBody
            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    description = "수정할 룰렛 항목 정보",
                    required = true,
                    content = @Content(schema = @Schema(implementation = RouletteRequestDto.class))
            )
            RouletteRequestDto dto) {
        rouletteService.updateRouletteContent(rouletteId, dto);
        return success();
    }

    @Operation(
            summary = "룰렛 항목 삭제",
            description = "rouletteId, roomId, roomUserId를 함께 제공하면 본인의 룰렛 항목을 삭제합니다.",
            responses = {
                    @ApiResponse(responseCode = "204", description = "삭제 성공"),
                    @ApiResponse(responseCode = "400", description = "권한 없음 또는 유효하지 않은 요청")
            }
    )
    @DeleteMapping("/delete/{rouletteId}")
    public ResponseEntity<ApiUtils.ApiResponse<ApiUtils.Unit>> deleteRouletteContent(
            @Parameter(description = "삭제할 룰렛 항목 ID", example = "7") @PathVariable Long rouletteId,
            @Parameter(description = "해당 룸 ID", example = "123456") @RequestParam Long roomId,
            @Parameter(description = "작성한 유저 ID", example = "706993") @RequestParam Long roomUserId
    ) {
        rouletteService.deleteRouletteContent(rouletteId, roomId, roomUserId);
        return success();
    }
}
