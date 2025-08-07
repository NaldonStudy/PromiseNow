package com.promisenow.api.domain.leaderboard.dto;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PositionRequestDto {
    private Long roomId;
    private Long roomUserId;
    private double lat;
    private double lng;
    private boolean online;
}
