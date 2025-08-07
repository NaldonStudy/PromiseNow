package com.promisenow.api.domain.roulette.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RouletteResponseDto {
    private Long rouletteId;
    private Long roomId;
    private Long roomUserId;
    private String content;
}
