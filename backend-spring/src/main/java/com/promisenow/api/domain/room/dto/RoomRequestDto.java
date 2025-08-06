package com.promisenow.api.domain.room.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonPOJOBuilder;
import com.promisenow.api.domain.room.entity.Room;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;

public class RoomRequestDto {

    // 약속 상세정보 수정하기
    @Schema(description = "약속 상세 정보 수정 요청")
    @Getter
    @Builder
    @JsonDeserialize(builder = RoomRequestDto.AppointmentUpdateRequest.AppointmentUpdateRequestBuilder.class)
    public static class AppointmentUpdateRequest {

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

        // Builder 지정
        @JsonPOJOBuilder(withPrefix = "")
        public static class AppointmentUpdateRequestBuilder {}
    }

    // 방 생성하기
    @Schema(description = "방 생성 요청")
    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateRequest {

        @Schema(description = "방 제목", example = "우리 팀 약속방")
        private String roomTitle;

        @Schema(description = "생성하는 사용자 ID", example = "1")
        private Long userId;

        @Schema(description = "참가할 닉네임", example = "홍길동")
        private String nickname;
    }

    // 약속 가능 날짜 범위에 대한 수정
    @Schema(description = "약속 가능 날짜 범위 수정 요청")
    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DateRangeUpdateRequest {

        @Schema(description = "시작 날짜", example = "2025-07-01")
        @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
        private LocalDate startDate;

        @Schema(description = "종료 날짜", example = "2025-07-10")
        @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
        private LocalDate endDate;
    }

    // 방 제목 수정하기
    @Schema(description = "방 제목 수정 요청")
    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TitleUpdateRequest {

        @Schema(description = "변경할 방 제목", example = "새로운 약속방 제목")
        @NotBlank(message = "방 제목은 필수입니다.")
        private String roomTitle;
    }



}
