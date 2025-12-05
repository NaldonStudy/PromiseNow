package com.promisenow.api.domain.availability.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;
import com.fasterxml.jackson.annotation.JsonFormat;

public class AvailabilityRequestDto {
    
    // 일정 배치 업데이트 요청
    @Schema(description = "일정 배치 업데이트 요청")
    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BatchUpdateRequest {
        @Schema(description = "룸 사용자 ID", example = "1")
        @NotNull(message = "roomUserId는 필수입니다.")
        private Long roomUserId;
        
        @Schema(description = "업데이트할 날짜별 일정 데이터 목록")
        @NotEmpty(message = "updatedDataList는 비어있을 수 없습니다.")
        @Valid
        private List<DateAvailabilityData> updatedDataList;
    }
    
    // 특정 날짜의 일정 데이터
    @Schema(description = "특정 날짜의 일정 데이터")
    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DateAvailabilityData {
        @Schema(description = "날짜", example = "2025-01-15", required = true)
        @NotNull(message = "date는 필수입니다.")
        @JsonFormat(pattern = "yyyy-MM-dd")
        private LocalDate date;
        
        @Schema(description = "시간대 데이터 (30자리, 0=불가능, 1=가능)", example = "111100001111000011110000111100", required = true)
        @NotBlank(message = "timeData는 필수입니다.")
        @Size(min = 30, max = 30, message = "timeData는 정확히 30자리여야 합니다.")
        @Pattern(regexp = "^[01]{30}$", message = "timeData는 0과 1만 포함할 수 있습니다.")
        private String timeData;
    }
} 