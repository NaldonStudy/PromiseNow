package com.promisenow.api.domain.room.controller;

import com.promisenow.api.common.ApiUtils;
import com.promisenow.api.infrastructure.file.dto.FileUploadResponse;
import com.promisenow.api.global.annotation.RequireRoomMember;
import com.promisenow.api.global.security.OAuth2UserDetails;
import com.promisenow.api.domain.room.dto.RoomRequestDto.*;
import com.promisenow.api.domain.room.dto.RoomResponseDto.*;
import com.promisenow.api.domain.room.dto.RoomUserRequestDto.*;
import com.promisenow.api.domain.room.dto.RoomUserResponseDto.*;
import com.promisenow.api.domain.room.service.RoomService;
import com.promisenow.api.domain.room.service.RoomUserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.*;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;


@Tag(name = "Room 컨트롤러", description = "방과 그 사용자에 대한 API")
@RestController
@RequestMapping("/api/rooms")
@RequiredArgsConstructor
@Validated
public class RoomController {

    private final RoomService roomService;
    private final RoomUserService roomUserService;

    // 방 생성하기
    @PostMapping
    @Operation(
            summary = "방 생성하기",
            description = "방 제목과 사용자 정보를 입력하여 새 약속 방을 생성하고 참가합니다.",
            requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    description = "방 생성 + 방장 입장",
                    required = true,
                    content = @Content(
                            mediaType = "application/json",
                            schema = @Schema(implementation = CreateRequest.class),
                            examples = @ExampleObject(
                                    name = "요청 예시",
                                    value = """
                {
                    "roomTitle": "우리 팀 약속방",
                    "userId": 1,
                    "nickname": "홍길동"
                }
                """
                            )
                    )
            ),
            responses = {
                    @ApiResponse(
                            responseCode = "200",
                            description = "방 생성 + 방장 입장 성공",
                            content = @Content(
                                    mediaType = "application/json",
                                    schema = @Schema(implementation = CreateResponse.class),
                                    examples = @ExampleObject(
                                            name = "성공 응답 예시",
                                            value = """
                    {
                        "success": true,
                        "data": {
                            "roomId": 101,
                            "roomUserId": 8,
                            "roomTitle": "우리 팀 약속방",
                            "roomCode": "Ab12Cd",
                            "nickname": "홍길동"
                        },
                        "message": null
                    }
                    """
                                    )
                            )
                    ),
                    @ApiResponse(responseCode = "400", description = "방 생성 실패")
            }
    )
    public ResponseEntity<?> createRoom(@RequestBody CreateRequest request) {
        CreateResponse response = roomService.createRoomWithUser(request);
        return ApiUtils.success(response);
    }



    // 방 삭제하기
    @DeleteMapping("/{roomId}")
    @Operation(
            summary = "방 삭제하기",
            description = "방 ID를 입력하여 해당 방을 삭제합니다. 해당 방에는 1명만 존재해야 합니다.",
            parameters = {
                    @Parameter(
                            name = "roomId",
                            description = "삭제할 방의 ID",
                            example = "42",
                            required = true
                    )
            },
            responses = {
                    @ApiResponse(
                            responseCode = "200",
                            description = "방 삭제 성공",
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
                    @ApiResponse(responseCode = "400", description = "존재하지 않는 방 ID")
            }
    )
    public ResponseEntity<?> deleteRoom(@PathVariable Long roomId) {
        roomService.deleteRoom(roomId);
        return ApiUtils.success();
    }


    // 방에 최초(초대코드)로 참가
    @PostMapping("/join")
    @Operation(
            summary = "초대코드로 방 참가",
            description = "사용자가 초대코드를 입력하여 방에 참가하고, 닉네임을 설정합니다.",
            requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    description = "초대 코드와 사용자 정보",
                    required = true,
                    content = @Content(
                            schema = @Schema(implementation = JoinRequest.class),
                            examples = @ExampleObject(
                                    name = "요청 예시",
                                    value = """
                    {
                        "inviteCode": "AB12CD",
                        "userId": 1,
                        "nickname": "홍길동"
                    }
                    """
                            )
                    )
            ),
            responses = {
                    @ApiResponse(
                            responseCode = "200",
                            description = "방 참가 성공",
                            content = @Content(
                                    mediaType = "application/json",
                                    schema = @Schema(implementation = JoinInfoResponse.class),
                                    examples = @ExampleObject(
                                            name = "성공 응답 예시",
                                            value = """
                        {
                            "success": true,
                            "data": {
                                "roomId": 123,
                                "roomUserId": 8,
                                "roomTitle": "약속방 A",
                                "nickname": "홍길동"
                            },
                            "message": null
                        }
                        """
                                    )
                            )
                    ),
                    @ApiResponse(responseCode = "400", description = "유효하지 않은 초대코드 또는 중복 참가 시도"),
                    @ApiResponse(responseCode = "404", description = "사용자 또는 방을 찾을 수 없음")
            }
    )
    public ResponseEntity<?> joinRoomByInviteCode(@RequestBody JoinRequest request) {
        JoinInfoResponse response = roomUserService.joinRoomByInviteCode(request);
        return ApiUtils.success(response);
    }

    // 방에서의 roomUserId, nickname, profileImage 조회
    @GetMapping("/{roomId}/me")
    @RequireRoomMember(roomIdParam = "roomId")
    @Operation(
            summary = "내 roomUserId, 닉네임, 프로필 이미지 조회",
            description = "특정 방(`roomId`)에서 현재 인증된 사용자의 참가 정보(roomUserId, nickname, profileImage)를 조회합니다.",
            parameters = {
                    @Parameter(
                            name = "roomId",
                            description = "조회할 방의 ID",
                            example = "101",
                            required = true
                    )
            },
            responses = {
                    @ApiResponse(
                            responseCode = "200",
                            description = "조회 성공",
                            content = @Content(
                                    mediaType = "application/json",
                                    schema = @Schema(implementation = RoomUserMyInfoResponseDto.class),
                                    examples = @ExampleObject(
                                            name = "성공 응답 예시",
                                            value = """
                    {
                        "success": true,
                        "data": {
                            "roomUserId": 61,
                            "nickname": "손빵재",
                            "profileImage": "https://example.com/SYJprofile.jpg"
                        },
                        "message": null
                    }
                    """
                                    )
                            )
                    ),
                    @ApiResponse(responseCode = "400", description = "유효하지 않은 요청"),
                    @ApiResponse(responseCode = "404", description = "해당 방 또는 사용자를 찾을 수 없음")
            }
    )
    public ResponseEntity<?> getMyRoomUserInfo(@PathVariable Long roomId, @AuthenticationPrincipal OAuth2UserDetails oAuth2UserDetails) {
        RoomUserMyInfoResponseDto response = roomUserService.getMyRoomUserInfo(roomId, oAuth2UserDetails.getUserId());
        return ApiUtils.success(response);
    }

    // 방제목 방참여코드 조회하는 Api
    @GetMapping("/{roomId}/title-code")
    @Operation(
            summary = "방 제목 및 초대코드 조회",
            description = "방 ID를 통해 해당 방의 제목과 초대코드를 조회합니다.",
            parameters = {
                    @Parameter(
                            name = "roomId",
                            description = "조회할 방의 ID",
                            example = "101",
                            required = true
                    )
            },
            responses = {
                    @ApiResponse(
                            responseCode = "200",
                            description = "조회 성공",
                            content = @Content(
                                    mediaType = "application/json",
                                    schema = @Schema(implementation = TitleCodeResponse.class),
                                    examples = @ExampleObject(
                                            name = "성공 응답 예시",
                                            value = """
                        {
                            "success": true,
                            "data": {
                                "roomTitle": "약속방 A",
                                "inviteCode": "XY12Z9"
                            },
                            "message": null
                        }
                        """
                                    )
                            )
                    ),
                    @ApiResponse(responseCode = "400", description = "유효하지 않은 요청"),
                    @ApiResponse(responseCode = "404", description = "해당 방을 찾을 수 없음")
            }
    )
    public ResponseEntity<?> getRoomTitleAndCode(@PathVariable Long roomId) {
        TitleCodeResponse response = roomService.getRoomTitleAndCode(roomId);
        return ApiUtils.success(response);
    }


    // 방 상태 조회하는 Api
    @GetMapping("/{roomId}/status")
    @Operation(
            summary = "방 상태 조회",
            description = "방 ID를 통해 현재 방의 상태를 조회합니다. 상태는 WAITING, ACTIVE, COMPLETED, CANCELLED 중 하나입니다.",
            parameters = {
                    @Parameter(
                            name = "roomId",
                            description = "조회할 방의 ID",
                            example = "101",
                            required = true
                    )
            },
            responses = {
                    @ApiResponse(
                            responseCode = "200",
                            description = "방 상태 조회 성공",
                            content = @Content(
                                    mediaType = "application/json",
                                    schema = @Schema(implementation = StateResponse.class),
                                    examples = @ExampleObject(
                                            name = "성공 응답 예시",
                                            value = """
                        {
                            "success": true,
                            "data": {
                                "roomState": "ACTIVE"
                            },
                            "message": null
                        }
                        """
                                    )
                            )
                    ),
                    @ApiResponse(responseCode = "400", description = "유효하지 않은 요청"),
                    @ApiResponse(responseCode = "404", description = "방을 찾을 수 없음")
            }
    )
    public ResponseEntity<?> getRoomStatus(@PathVariable Long roomId) {
        StateResponse response = roomService.getRoomStatus(roomId);
        return ApiUtils.success(response);
    }


    // 방 약속가능 범위를 조회하는 Api
    @GetMapping("/{roomId}/date-range")
    @Operation(
            summary = "약속 가능 기간 조회",
            description = "방 ID를 통해 해당 방에서 설정한 약속 가능 시작일과 종료일을 조회합니다.",
            parameters = {
                    @Parameter(
                            name = "roomId",
                            description = "조회할 방의 ID",
                            example = "101",
                            required = true
                    )
            },
            responses = {
                    @ApiResponse(
                            responseCode = "200",
                            description = "기간 조회 성공",
                            content = @Content(
                                    mediaType = "application/json",
                                    schema = @Schema(implementation = DateRangeResponse.class),
                                    examples = @ExampleObject(
                                            name = "성공 응답 예시",
                                            value = """
                        {
                            "success": true,
                            "data": {
                                "startDate": "2025-07-01",
                                "endDate": "2025-07-10"
                            },
                            "message": null
                        }
                        """
                                    )
                            )
                    ),
                    @ApiResponse(responseCode = "400", description = "요청 파라미터 오류"),
                    @ApiResponse(responseCode = "404", description = "해당 방을 찾을 수 없음")
            }
    )
    public ResponseEntity<?> getRoomDateRange(@PathVariable Long roomId) {
        try {
            DateRangeResponse response = roomService.getRoomDateRange(roomId);
            return ApiUtils.success(response);
        } catch (IllegalArgumentException e) {
            return ApiUtils.error(e.getMessage());
        }
    }



    // 방 세부약속(일자, 장소, 위도, 경도)을 조회하는 Api
    @GetMapping("/{roomId}/appointment")
    @Operation(
            summary = "방 세부 약속 조회",
            description = "방 ID를 이용해 설정된 약속 일자, 시간, 장소, 좌표 정보를 조회합니다.",
            parameters = {
                    @Parameter(
                            name = "roomId",
                            description = "조회할 방의 ID",
                            example = "101",
                            required = true
                    )
            },
            responses = {
                    @ApiResponse(
                            responseCode = "200",
                            description = "세부 약속 조회 성공",
                            content = @Content(
                                    mediaType = "application/json",
                                    schema = @Schema(implementation = AppointmentResponse.class),
                                    examples = @ExampleObject(
                                            name = "성공 응답 예시",
                                            value = """
                        {
                            "success": true,
                            "data": {
                                "locationDate": "2025-08-10",
                                "locationTime": "13:30",
                                "locationName": "강남역 2번 출구",
                                "locationLat": 37.4979,
                                "locationLng": 127.0276
                            },
                            "message": null
                        }
                        """
                                    )
                            )
                    ),
                    @ApiResponse(responseCode = "400", description = "잘못된 요청"),
                    @ApiResponse(responseCode = "404", description = "해당 방이 존재하지 않음")
            }
    )
    public ResponseEntity<?> getAppointment(@PathVariable Long roomId) {
        AppointmentResponse response = roomService.getRoomAppointment(roomId);
        return ApiUtils.success(response);
    }


    // 본인이 속한 방 목록 확인
    @GetMapping("/{userId}")
    @Operation(
            summary = "내가 참가한 방 목록 조회",
            description = "사용자 ID를 이용해 사용자가 참가 중인 모든 방의 정보를 조회합니다.",
            parameters = {
                    @Parameter(
                            name = "userId",
                            description = "참가한 방 목록을 조회할 사용자 ID",
                            example = "1",
                            required = true
                    )
            },
            responses = {
                    @ApiResponse(
                            responseCode = "200",
                            description = "방 목록 조회 성공",
                            content = @Content(
                                    mediaType = "application/json",
                                    array = @ArraySchema(schema = @Schema(implementation = RoomListItem.class)),
                                    examples = @ExampleObject(
                                            name = "성공 응답 예시",
                                            value = """
                        {
                            "success": true,
                            "data": [
                                {
                                    "roomId": 13,
                                    "roomTitle": "스터디 약속방",
                                    "locationDate": "2025-08-10",
                                    "locationTime": "14:30",
                                    "locationName": "강남역 2번 출구",
                                    "participantSummary": "홍길동 외 3명",
                                    "roomState": "WAITING"
                                },
                                {
                                    "roomId": 14,
                                    "roomTitle": "회식 일정 방",
                                    "locationDate": "2025-08-20",
                                    "locationTime": "18:00",
                                    "locationName": "을지로입구역",
                                    "participantSummary": "김싸피 외 2명",
                                    "roomState": "ACTIVE"
                                }
                            ],
                            "message": null
                        }
                        """
                                    )
                            )
                    ),
                    @ApiResponse(responseCode = "400", description = "잘못된 사용자 ID"),
                    @ApiResponse(responseCode = "404", description = "해당 사용자를 찾을 수 없음")
            }
    )
    public ResponseEntity<?> getJoinedRooms(@PathVariable Long userId) {
        List<RoomListItem> rooms = roomService.getRoomsByUserId(userId);
        return ApiUtils.success(rooms);
    }


    // 방에 있는 사람들의 닉네임, 프로필 확인
    @GetMapping("/{roomId}/users")
    @Operation(
            summary = "방 참가자 목록 조회",
            description = "해당 방에 속한 모든 사용자의 닉네임과 프로필 이미지를 반환합니다.",
            parameters = {
                    @Parameter(
                            name = "roomId",
                            description = "참가자 목록을 조회할 방의 ID",
                            example = "123",
                            required = true
                    )
            },
            responses = {
                    @ApiResponse(
                            responseCode = "200",
                            description = "참가자 목록 조회 성공",
                            content = @Content(
                                    mediaType = "application/json",
                                    array = @ArraySchema(schema = @Schema(implementation = SimpleInfoResponse.class)),
                                    examples = @ExampleObject(
                                            name = "성공 응답 예시",
                                            value = """
                        {
                            "success": true,
                            "data": [
                                {
                                    "nickname": "홍길동",
                                    "profileImage": "https://example.com/profile.jpg"
                                },
                                {
                                    "nickname": "김싸피",
                                    "profileImage": null
                                }
                            ],
                            "message": null
                        }
                        """
                                    )
                            )
                    ),
                    @ApiResponse(responseCode = "400", description = "유효하지 않은 요청"),
                    @ApiResponse(responseCode = "404", description = "방을 찾을 수 없음")
            }
    )
    public ResponseEntity<?> getUsersInRoom(@PathVariable Long roomId) {
        List<SimpleInfoResponse> userList = roomUserService.getRoomUsers(roomId);
        return ApiUtils.success(userList);
    }


    // 유저가 방을 나간다 ~
    @DeleteMapping("/{roomId}/users/{userId}")
    @Operation(
            summary = "유저 방 나가기",
            description = "지정한 사용자 ID가 해당 방에서 나가도록 처리합니다. 방과의 연결 정보가 삭제됩니다.",
            parameters = {
                    @Parameter(
                            name = "roomId",
                            description = "방 ID",
                            required = true,
                            example = "123"
                    ),
                    @Parameter(
                            name = "userId",
                            description = "방에서 나갈 사용자 ID",
                            required = true,
                            example = "1"
                    )
            },
            responses = {
                    @ApiResponse(
                            responseCode = "200",
                            description = "방 나가기 성공",
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
                    @ApiResponse(responseCode = "400", description = "사용자가 해당 방에 속해 있지 않음"),
                    @ApiResponse(responseCode = "404", description = "해당 방 또는 사용자 정보 없음")
            }
    )
    public ResponseEntity<?> quitRoom(@PathVariable Long roomId, @PathVariable Long userId) {
        roomUserService.quitRoom(roomId, userId);
        return ApiUtils.success();
    }


    // 방 제목을 변경하는거
    @PatchMapping("/{roomId}/title")
    @Operation(
            summary = "방 제목 변경",
            description = "방 ID를 통해 해당 방의 제목을 새로 설정합니다.",
            parameters = {
                    @Parameter(
                            name = "roomId",
                            description = "제목을 변경할 방의 ID",
                            required = true,
                            example = "123"
                    )
            },
            requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    description = "새로운 방 제목",
                    required = true,
                    content = @Content(
                            schema = @Schema(implementation = TitleUpdateRequest.class),
                            examples = @ExampleObject(
                                    name = "요청 예시",
                                    value = """
                    {
                        "roomTitle": "새로운 약속방 제목"
                    }
                    """
                            )
                    )
            ),
            responses = {
                    @ApiResponse(
                            responseCode = "200",
                            description = "방 제목 변경 성공",
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
                    @ApiResponse(responseCode = "404", description = "방을 찾을 수 없음")
            }
    )
    public ResponseEntity<?> updateRoomTitle(@PathVariable Long roomId, @RequestBody TitleUpdateRequest request) {
        roomService.updateRoomTitle(roomId, request.getRoomTitle());
        return ApiUtils.success();
    }


    // 가능 날짜 기간에 대한 설정
    @PatchMapping("/{roomId}/date-range")
    @Operation(
            summary = "약속 가능 기간 설정",
            description = "방 ID에 대해 시작일과 종료일을 설정합니다. 이 범위 내에서 약속을 선택할 수 있습니다.",
            parameters = {
                    @Parameter(
                            name = "roomId",
                            description = "기간을 설정할 방 ID",
                            required = true,
                            example = "123"
                    )
            },
            requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    description = "약속 가능 시작일과 종료일",
                    required = true,
                    content = @Content(
                            schema = @Schema(implementation = DateRangeUpdateRequest.class),
                            examples = @ExampleObject(
                                    name = "요청 예시",
                                    value = """
                    {
                        "startDate": "2025-07-01",
                        "endDate": "2025-07-10"
                    }
                    """
                            )
                    )
            ),
            responses = {
                    @ApiResponse(
                            responseCode = "200",
                            description = "기간 설정 성공",
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
                    @ApiResponse(responseCode = "400", description = "요청 형식 오류 또는 날짜 범위 유효성 실패"),
                    @ApiResponse(responseCode = "404", description = "해당 방을 찾을 수 없음")
            }
    )
    public ResponseEntity<?> updateRoomDateRange(@PathVariable Long roomId, @RequestBody DateRangeUpdateRequest request) {
        roomService.updateRoomDateRange(roomId, request);
        return ApiUtils.success();
    }


    // 약속일자, 약속장소, 위도, 경도 설정
    @PatchMapping("/{roomId}/appointment")
    @Operation(
            summary = "세부 약속 정보 설정",
            description = "방 ID에 대해 약속 날짜, 시간, 장소 이름 및 좌표(위도, 경도)를 설정합니다.",
            parameters = {
                    @Parameter(
                            name = "roomId",
                            description = "약속 정보를 설정할 방 ID",
                            required = true,
                            example = "123"
                    )
            },
            requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    description = "약속 세부 정보 (날짜, 시간, 장소, 좌표)",
                    required = true,
                    content = @Content(
                            schema = @Schema(implementation = AppointmentUpdateRequest.class),
                            examples = @ExampleObject(
                                    name = "요청 예시",
                                    value = """
                    {
                        "locationDate": "2025-08-10",
                        "locationTime": "13:30",
                        "locationName": "강남역 2번 출구",
                        "locationLat": 37.4979,
                        "locationLng": 127.0276
                    }
                    """
                            )
                    )
            ),
            responses = {
                    @ApiResponse(
                            responseCode = "200",
                            description = "약속 정보 설정 성공",
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
                    @ApiResponse(responseCode = "400", description = "요청 형식 오류 또는 좌표값 오류"),
                    @ApiResponse(responseCode = "404", description = "방이 존재하지 않음")
            }
    )
    public ResponseEntity<?> updateAppointment (@PathVariable Long roomId, @RequestBody AppointmentUpdateRequest request) {
        roomService.updateRoomAppointment(roomId, request);
        return ApiUtils.success();
    }


    // 유저 알람 설정
    @PatchMapping("/{roomId}/users/{userId}/alarm")
    @Operation(
            summary = "개인 알람 설정 변경",
            description = "사용자가 특정 방에서 알람 수신 여부를 설정합니다.",
            parameters = {
                    @Parameter(
                            name = "roomId",
                            description = "알람을 설정할 방 ID",
                            required = true,
                            example = "101"
                    ),
                    @Parameter(
                            name = "userId",
                            description = "알람을 설정할 사용자 ID",
                            required = true,
                            example = "1"
                    )
            },
            requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    description = "알람 수신 동의 여부",
                    required = true,
                    content = @Content(
                            schema = @Schema(implementation = AlarmUpdateRequest.class),
                            examples = @ExampleObject(
                                    name = "요청 예시",
                                    value = """
                    {
                        "isAgreed": true
                    }
                    """
                            )
                    )
            ),
            responses = {
                    @ApiResponse(
                            responseCode = "200",
                            description = "알람 설정 변경 성공",
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
                    @ApiResponse(responseCode = "404", description = "방 또는 사용자 정보를 찾을 수 없음")
            }
    )
    public ResponseEntity<?> updateAlarmSetting(@PathVariable Long roomId, @PathVariable Long userId, @RequestBody AlarmUpdateRequest request) {
        roomUserService.updateAlarm(roomId, userId, request.isAgreed());
        return ApiUtils.success();
    }

    // 유저 알람 정보 GET
    @GetMapping("/{roomId}/users/{userId}/alarm")
    @Operation(
            summary = "개인 알람 설정 조회",
            description = "사용자가 특정 방에서 알람 수신 여부를 확인합니다.",
            parameters = {
                    @Parameter(
                            name = "roomId",
                            description = "알람 정보를 확인할 방 ID",
                            required = true,
                            example = "101"
                    ),
                    @Parameter(
                            name = "userId",
                            description = "알람 정보를 확인할 사용자 ID",
                            required = true,
                            example = "1"
                    )
            },
            responses = {
                    @ApiResponse(
                            responseCode = "200",
                            description = "알람 설정 조회 성공",
                            content = @Content(
                                    mediaType = "application/json",
                                    schema = @Schema(implementation = AlarmCheckResponse.class),
                                    examples = @ExampleObject(
                                            name = "성공 응답 예시",
                                            value = """
                    {
                        "success": true,
                        "data": {
                            "isAgreed": true
                        },
                        "message": null
                    }
                    """
                                    )
                            )
                    ),
                    @ApiResponse(
                            responseCode = "404",
                            description = "방 또는 사용자 정보를 찾을 수 없음"
                    )
            }
    )
    public ResponseEntity<?> getAlarmSetting(@PathVariable Long roomId, @PathVariable Long userId) {
        boolean isAgreed = roomUserService.getAlarmAgreement(roomId, userId);
        return ApiUtils.success(new AlarmCheckResponse(isAgreed));
    }

    // 방에서 유저 닉네임 변경
    @PatchMapping("/{roomId}/nickname/{userId}")
    @Operation(
            summary = "방 안에서 닉네임 변경",
            description = "사용자가 특정 방에서 사용하는 닉네임을 수정합니다.",
            parameters = {
                    @Parameter(
                            name = "roomId",
                            description = "닉네임을 변경할 방 ID",
                            required = true,
                            example = "101"
                    ),
                    @Parameter(
                            name = "userId",
                            description = "닉네임을 변경할 사용자 ID",
                            required = true,
                            example = "3"
                    )
            },
            requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    description = "변경할 닉네임 정보",
                    required = true,
                    content = @Content(
                            mediaType = "application/json",
                            schema = @Schema(implementation = UpdateNicknameRequest.class),
                            examples = @ExampleObject(
                                    name = "요청 예시",
                                    value = """
                {
                    "nickname": "짱구"
                }
                """
                            )
                    )
            ),
            responses = {
                    @ApiResponse(
                            responseCode = "200",
                            description = "닉네임 변경 성공",
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
                    @ApiResponse(
                            responseCode = "404",
                            description = "해당 RoomUser를 찾을 수 없음"
                    )
            }
    )
    public ResponseEntity<?> updateNickname (@PathVariable Long roomId, @PathVariable Long userId, @RequestBody UpdateNicknameRequest request) {
        roomUserService.updateNickname(roomId, userId, request.getNickname());
        return ApiUtils.success();
    }

    // 방에서 프로필 이미지 설정
    @PatchMapping(
            value = "/{roomId}/profile-image/{userId}",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE
    )
    @Operation(
            summary = "프로필 이미지 변경",
            description = "사용자가 방에서 사용하는 프로필 이미지를 업로드합니다.",
            parameters = {
                    @Parameter(name = "roomId", description = "방 ID", required = true),
                    @Parameter(name = "userId", description = "사용자 ID", required = true)
            },
            responses = {
                    @ApiResponse(responseCode = "200", description = "업로드 성공",
                            content = @Content(mediaType = "application/json",
                                    schema = @Schema(implementation = ImageUploadResponse.class))),
                    @ApiResponse(responseCode = "400", description = "잘못된 요청"),
                    @ApiResponse(responseCode = "500", description = "서버 오류")
            }
    )
    public ResponseEntity<ApiUtils.ApiResponse<FileUploadResponse>> updateProfileImage(
            @PathVariable Long roomId,
            @PathVariable Long userId,
            @RequestParam("file") MultipartFile file
    ) {
        String imageUrl = roomUserService.updateProfileImage(roomId, userId, file);
        return ApiUtils.success(new FileUploadResponse(imageUrl));
    }


} 