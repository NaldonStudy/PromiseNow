package com.promisenow.api.domain.room.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

public class RoomUserResponseDto {

    // 방 참가 할 때 정보
    @Schema(description = "방 참가 시 응답 정보")
    @Getter
    @AllArgsConstructor
    @Builder
    public static class JoinInfoResponse {

        @Schema(description = "방 ID", example = "1")
        private Long roomId;

        @Schema(description = "방 제목", example = "스터디 약속방")
        private String roomTitle;

        @Schema(description = "사용자 닉네임", example = "홍길동")
        private String nickname;
    }

    // 방 참가시 응답 정보
    @Schema(description = "참가자 요약 정보 응답")
    @Getter
    @AllArgsConstructor
    public static class SimpleInfoResponse {

        @Schema(description = "사용자 닉네임", example = "홍길동")
        private String nickname;

        @Schema(description = "사용자 프로필 이미지 URL", example = "https://example.com/profile.jpg")
        private String profileImage;
    }

}
