package com.promisenow.api.domain.availability.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

public class AvailabilityResponseDto {
    
    // 내 일정 조회 응답
    @Schema(description = "내 일정 조회 응답")
    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MyAvailabilityResponse {
        @Schema(description = "날짜별 일정 목록")
        private List<DateAvailability> availabilities;
        
        @Schema(description = "특정 날짜의 일정 정보")
        @Getter
        @Builder
        @NoArgsConstructor
        @AllArgsConstructor
        public static class DateAvailability {
            @Schema(description = "날짜", example = "2025-01-15")
            private LocalDate date;
            
            @Schema(description = "시간대 데이터 (30자리, 0=불가능, 1=가능)", example = "111100001111000011110000111100")
            private String timeData;
        }
    }
    
    // 전체 누적 데이터 응답
    @Schema(description = "전체 누적 데이터 응답")
    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TotalAvailabilityResponse {
        @Schema(description = "날짜별 누적 데이터 목록")
        private List<DateTotalData> totalDatas;
        
        @Schema(description = "특정 날짜의 누적 데이터")
        @Getter
        @Builder
        @NoArgsConstructor
        @AllArgsConstructor
        public static class DateTotalData {
            @Schema(description = "날짜", example = "2025-01-15")
            private LocalDate date;
            
            @Schema(description = "누적된 시간대 데이터 (각 숫자는 해당 시간대를 선택한 사용자 수)", example = "222211112222111122221111222211")
            private String timeData;
        }
    }
    
    // 선택한 사용자 목록
    @Schema(description = "선택한 사용자 목록 응답")
    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ConfirmedUsersResponse {
        @Schema(description = "선택한 사용자 목록")
        private List<UserInfo> confirmedUserList;
        
        @Schema(description = "사용자 정보")
        @Getter
        @Builder
        @NoArgsConstructor
        @AllArgsConstructor
        public static class UserInfo {
            @Schema(description = "사용자 닉네임", example = "푸른호랑이32")
            private String nickname;
            
            @Schema(description = "프로필 이미지 URL", example = "https://example.com/profile1.jpg")
            private String profileImage;
        }
    }
} 