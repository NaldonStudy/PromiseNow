package com.promisenow.api.domain.room.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

public class RoomUserRequestDto {

    // 알람 설정하기
    @Schema(description = "알람 설정 요청")
    @Getter
    @NoArgsConstructor
    public static class AlarmUpdateRequest {
        @Schema(description = "알람 수신 동의 여부", example = "true")
        private boolean isAgreed;
    }

    // 초대코드로 방 참가하기
    @Schema(description = "초대 코드로 방 참가 요청")
    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class JoinRequest {

        @Schema(description = "초대 코드", example = "AB12CD")
        @NotBlank(message = "초대코드는 필수입니다.")
        private String inviteCode;

        @Schema(description = "사용자 ID", example = "1")
        @NotNull(message = "userId는 필수입니다.")
        private Long userId;

        @Schema(description = "사용자 닉네임", example = "홍길동")
        @NotBlank(message = "닉네임은 필수입니다.")
        private String nickname;
    }

    // 닉네임 변경
    @Schema(description = "닉네임 변경")
    @Getter
    @NoArgsConstructor
    public static class UpdateNicknameRequest {

        @Schema(description = "변경할 닉네임", example = "새로운닉네임")
        private String nickname;
    }



}
