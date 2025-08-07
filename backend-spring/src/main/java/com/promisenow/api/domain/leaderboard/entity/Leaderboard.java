package com.promisenow.api.domain.leaderboard.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.redis.core.RedisHash;


@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@RedisHash(value = "user-location")

public class Leaderboard {
    private Long roomUserId;
    private double lat;
    private double lng;
    private boolean online;
    private double velocity;
    private double distance; // Goal까지 남은 거리
    private double progress; // 출발-도착 대비 진행률
}