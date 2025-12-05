package com.promisenow.api.domain.availability.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;
import com.fasterxml.jackson.annotation.JsonFormat;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecommendationTimeResponseDto {

    private List<RecommendationData> times;

    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RecommendationData {
        @JsonFormat(pattern = "yyyy-MM-dd")
        private LocalDate date;
        private String timeStart;
        private String timeEnd;
        private int count;
    }
}
