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

        @Schema(description = "생성된 방에서의 내 RoomUserId", example = "8")
        private Long roomUserId;

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

    // 방에서 내 roomUserId, nickname GET
    @Schema(description = "roomUserId, nickname 응답")
    @Getter
    @AllArgsConstructor
    public static class RoomUserMyInfoResponseDto {

        @Schema(description = "사용자 roomUserId", example = "61")
        private Long roomUserId;

        @Schema(description = "사용자 nickname", example = "손빵재")
        private String nickname;
    }

    // 프로필 이미지 수정 정보
    @Schema(description = "수정된 프로필 이미지 정보 응답")
    @Getter
    @AllArgsConstructor
    public static class ImageUploadResponse {

        @Schema(description = "업로드된 이미지의 URL", example = "http://localhost:8080/uploaded-images/profile/1691429381785_profile.jpg")
        private String imageUrl;
    }
}
