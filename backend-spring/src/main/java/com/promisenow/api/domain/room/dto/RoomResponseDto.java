package com.promisenow.api.domain.room.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.promisenow.api.domain.room.entity.Room;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;

public class RoomResponseDto {

    // 약속 상세 정보 보내기
    @Schema(description = "약속 상세 정보 응답")
    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AppointmentResponse {

        @Schema(description = "약속 날짜", example = "2025-01-15")
        @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
        private LocalDate locationDate;

        @Schema(description = "약속 시간", example = "14:30")
        @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "HH:mm")
        private LocalTime locationTime;

        @Schema(description = "약속 장소 이름", example = "강남역 2번 출구")
        private String locationName;

        @Schema(description = "약속 장소 위도", example = "37.4979")
        private Double locationLat;

        @Schema(description = "약속 장소 경도", example = "127.0276")
        private Double locationLng;
    }

    // 방 생성에 대한 응답
    @Schema(description = "방 생성 응답")
    @Getter
    @AllArgsConstructor
    @NoArgsConstructor
    public static class CreateResponse {

        @Schema(description = "생성된 방 제목", example = "우리 모임방")
        private String roomTitle;

        @Schema(description = "초대 코드", example = "AB12CD")
        private String roomCode;
    }

    // 방의 약속 가능 날짜 범위에 대한 설정
    @Schema(description = "방의 약속 가능 날짜 범위 응답")
    @Getter
    @AllArgsConstructor
    public static class DateRangeResponse {

        @Schema(description = "시작 날짜", example = "2025-07-01")
        @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
        private LocalDate startDate;

        @Schema(description = "종료 날짜", example = "2025-07-10")
        @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
        private LocalDate endDate;
    }

    // 내가 참가한 방들의 정보
    @Schema(description = "내가 참가한 방들의 정보 응답")
    @Getter
    @AllArgsConstructor
    public static class RoomListItem {

        @Schema(description = "방 ID", example = "1")
        private Long roomId;

        @Schema(description = "방 제목", example = "토요일 스터디")
        private String roomTitle;

        @Schema(description = "약속 날짜", example = "2025-08-10")
        @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
        private LocalDate locationDate;

        @Schema(description = "약속 시간", example = "14:30")
        @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "HH:mm")
        private LocalTime locationTime;

        @Schema(description = "약속 장소", example = "강남역 2번 출구")
        private String locationName;

        @Schema(description = "참가자 요약 정보", example = "홍길동 외 3명")
        private String participantSummary;
    }

    // 방 상태 조회와 응답
    @Schema(description = "방 상태 조회 응답")
    @Getter
    @AllArgsConstructor
    public static class StateResponse {

        @Schema(description = "현재 방 상태 (예: WAITING, ACTIVE, COMPLETED, CANCELLED)", example = "ACTIVE")
        private Room.RoomState roomState;
    }

    // 방 제목이랑 초대코드 보내주기
    @Schema(description = "방 제목 및 초대 코드 응답")
    @Getter
    @AllArgsConstructor
    public static class TitleCodeResponse {

        @Schema(description = "방 제목", example = "SSAFY 점심약속")
        private String roomTitle;

        @Schema(description = "초대 코드", example = "XY12Z9")
        private String inviteCode;
    }



}
