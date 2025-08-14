package com.promisenow.api.domain.leaderboard.dto;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PositionResponseDto {
    private Long roomUserId;
    private double lat;
    private double lng;
    private boolean online;
    private double velocity;
    private double distance;
    private double progress;
    private boolean arrived;
}
