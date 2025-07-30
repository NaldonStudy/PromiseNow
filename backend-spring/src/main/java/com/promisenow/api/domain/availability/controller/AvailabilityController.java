package com.promisenow.api.domain.availability.controller;

import com.promisenow.api.common.ApiUtils;
import com.promisenow.api.domain.availability.dto.AvailabilityRequestDto;
import com.promisenow.api.domain.availability.dto.AvailabilityResponseDto;
import com.promisenow.api.domain.availability.entity.Availability;
import com.promisenow.api.domain.availability.processor.AvailabilityProcessor;
import com.promisenow.api.domain.availability.service.AvailabilityService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@Tag(name = "일정 관리", description = "When2meet 스타일의 일정 조율 API")
@RestController
@RequestMapping("/api/availability")
@RequiredArgsConstructor
@Validated
public class AvailabilityController {
    
    private final AvailabilityService availabilityService;
    private final AvailabilityProcessor availabilityProcessor;
    
    @Operation(
        summary = "내 일정 조회",
        description = "특정 사용자의 일정 데이터를 날짜별로 조회합니다."
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "200",
            description = "일정 조회 성공",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = AvailabilityResponseDto.MyAvailabilityResponse.class),
                examples = @ExampleObject(
                    name = "성공 응답 예시",
                    value = """
                        {
                            "success": true,
                            "data": {
                                "availabilities": [
                                    {
                                        "date": "2025-01-15",
                                        "timeData": "111100001111000011110000111100"
                                    },
                                    {
                                        "date": "2025-01-16",
                                        "timeData": "000011110000111100001111000011"
                                    }
                                ]
                            },
                            "message": null
                        }
                        """
                )
            )
        ),
        @ApiResponse(responseCode = "400", description = "잘못된 요청"),
        @ApiResponse(responseCode = "404", description = "사용자를 찾을 수 없음")
    })
    @GetMapping("/me")
    public ResponseEntity<ApiUtils.ApiResponse<AvailabilityResponseDto.MyAvailabilityResponse>> getMyAvailability(
            @Parameter(description = "룸 사용자 ID", example = "1", required = true)
            @NotNull(message = "roomUserId는 필수입니다.")
            @RequestParam Long roomUserId) {
        
        List<Availability> availabilities = availabilityService.getMyAvailability(roomUserId);
        return ApiUtils.success(availabilityProcessor.processMyAvailability(availabilities));
    }
    
    @Operation(
        summary = "전체 누적 데이터 조회",
        description = "룸의 모든 사용자 일정을 누적하여 시각화용 데이터를 제공합니다."
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "200",
            description = "누적 데이터 조회 성공",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = AvailabilityResponseDto.TotalAvailabilityResponse.class),
                examples = @ExampleObject(
                    name = "성공 응답 예시",
                    value = """
                        {
                            "success": true,
                            "data": {
                                "totalDatas": [
                                    {
                                        "date": "2025-01-15",
                                        "timeData": "222211112222111122221111222211"
                                    },
                                    {
                                        "date": "2025-01-16",
                                        "timeData": "111122221111222211112222111122"
                                    }
                                ]
                            },
                            "message": null
                        }
                        """
                )
            )
        ),
        @ApiResponse(responseCode = "400", description = "잘못된 요청"),
        @ApiResponse(responseCode = "404", description = "룸을 찾을 수 없음")
    })
    @GetMapping("/total")
    public ResponseEntity<ApiUtils.ApiResponse<AvailabilityResponseDto.TotalAvailabilityResponse>> getTotalAvailability(
            @Parameter(description = "룸 ID", example = "456", required = true)
            @NotNull(message = "roomId는 필수입니다.")
            @RequestParam Long roomId) {
        
        List<Availability> availabilities = availabilityService.getTotalAvailability(roomId);
        return ApiUtils.success(availabilityProcessor.processTotalAvailability(availabilities));
    }
    
    @Operation(
        summary = "특정 시간대 선택자 조회",
        description = "특정 날짜와 시간대에 일정을 선택한 사용자 목록을 조회합니다."
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "200",
            description = "선택자 목록 조회 성공",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = AvailabilityResponseDto.ConfirmedUsersResponse.class),
                examples = @ExampleObject(
                    name = "성공 응답 예시",
                    value = """
                        {
                            "success": true,
                            "data": {
                                "confirmedUserList": [
                                    {
                                        "nickname": "푸른호랑이32",
                                        "profileImage": "https://example.com/profile1.jpg"
                                    },
                                    {
                                        "nickname": "조용한고래78",
                                        "profileImage": null
                                    }
                                ]
                            },
                            "message": null
                        }
                        """
                )
            )
        ),
        @ApiResponse(responseCode = "400", description = "잘못된 요청"),
        @ApiResponse(responseCode = "404", description = "룸을 찾을 수 없음")
    })
    @GetMapping("/confirmed-users")
    public ResponseEntity<ApiUtils.ApiResponse<AvailabilityResponseDto.ConfirmedUsersResponse>> getConfirmedUsers(
            @Parameter(description = "룸 ID", example = "1", required = true)
            @NotNull(message = "roomId는 필수입니다.")
            @RequestParam Long roomId,
            @Parameter(description = "조회할 날짜 (YYYY-MM-DD)", example = "2025-01-15", required = true)
            @NotNull(message = "date는 필수입니다.")
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @Parameter(description = "시간대 슬롯 (0-29, 30분 단위)", example = "12", required = true)
            @NotNull(message = "slot은 필수입니다.")
            @RequestParam int slot) {
        
        // QueryDSL을 사용하여 DB에서 직접 필터링하고 DTO로 반환
        List<AvailabilityResponseDto.ConfirmedUsersResponse.UserInfo> confirmedUsers = availabilityService.getSelectedUsers(roomId, date, slot);
        AvailabilityResponseDto.ConfirmedUsersResponse response = AvailabilityResponseDto.ConfirmedUsersResponse.builder()
                .confirmedUserList(confirmedUsers)
                .build();
        return ApiUtils.success(response);
    }
    
    @Operation(
        summary = "일정 저장/수정 (단일)",
        description = "특정 날짜의 일정을 저장하거나 수정합니다."
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "200",
            description = "일정 저장 성공",
            content = @Content(
                mediaType = "application/json",
                examples = @ExampleObject(
                    name = "성공 응답 예시",
                    value = """
                        {
                            "success": true,
                            "data": null,
                            "message": null
                        }
                        """
                )
            )
        ),
        @ApiResponse(responseCode = "400", description = "잘못된 요청"),
        @ApiResponse(responseCode = "404", description = "사용자를 찾을 수 없음")
    })
    @PostMapping("/save")
    public ResponseEntity<ApiUtils.ApiResponse<ApiUtils.Unit>> saveAvailability(
            @Parameter(description = "룸 사용자 ID", example = "1", required = true)
            @NotNull(message = "roomUserId는 필수입니다.")
            @RequestParam Long roomUserId,
            @Parameter(description = "일정 날짜 (YYYY-MM-DD)", example = "2025-01-15", required = true)
            @NotNull(message = "date는 필수입니다.")
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @Parameter(description = "시간대 데이터 (30자리, 0=불가능, 1=가능)", example = "111100001111000011110000111100", required = true)
            @NotBlank(message = "timeData는 필수입니다.")
            @Size(min = 30, max = 30, message = "timeData는 정확히 30자리여야 합니다.")
            @Pattern(regexp = "^[01]{30}$", message = "timeData는 0과 1만 포함할 수 있습니다.")
            @RequestParam String timeData) {
        
        availabilityService.saveAvailability(roomUserId, date, timeData);
        return ApiUtils.success();
    }
    
    @Operation(
        summary = "일정 배치 업데이트",
        description = "여러 날짜의 일정을 한 번에 업데이트합니다. 변경된 날짜만 전송하면 됩니다."
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "200",
            description = "배치 업데이트 성공",
            content = @Content(
                mediaType = "application/json",
                examples = @ExampleObject(
                    name = "성공 응답 예시",
                    value = """
                        {
                            "success": true,
                            "data": null,
                            "message": null
                        }
                        """
                )
            )
        ),
        @ApiResponse(responseCode = "400", description = "잘못된 요청 데이터"),
        @ApiResponse(responseCode = "404", description = "사용자를 찾을 수 없음")
    })
    @PutMapping("/batch-update")
    public ResponseEntity<ApiUtils.ApiResponse<ApiUtils.Unit>> batchUpdateAvailability(
            @Parameter(
                description = "배치 업데이트 요청",
                required = true,
                content = @Content(
                    schema = @Schema(implementation = AvailabilityRequestDto.BatchUpdateRequest.class),
                    examples = @ExampleObject(
                        name = "요청 예시",
                        value = """
                            {
                                "roomUserId": 1,
                                "updatedDataList": [
                                    {
                                        "date": "2025-01-15",
                                        "timeData": "111100001111000011110000111100"
                                    },
                                    {
                                        "date": "2025-01-16",
                                        "timeData": "000011110000111100001111000011"
                                    }
                                ]
                            }
                            """
                    )
                )
            )
            @Valid @RequestBody AvailabilityRequestDto.BatchUpdateRequest request) {
        
        // 비즈니스 로직 실행
        availabilityService.batchUpdateAvailability(request);
        return ApiUtils.success();
    }
} 