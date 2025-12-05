package com.promisenow.api.domain.roulette.dto;

import lombok.*;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RouletteRequestDto {
    private Long roomId;
    private Long roomUserId;
    private String content;
}
