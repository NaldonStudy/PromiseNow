package com.promisenow.api.domain.leaderboard.service;

import com.promisenow.api.domain.leaderboard.dto.PositionResponseDto;

import java.util.List;

public interface LeaderboardService {
    double updateLeaderboard(long roomId, long roomUserId,
                             double lat, double lng, boolean online,
                             double goalLat, double goalLng);
    List<PositionResponseDto> getLeaderboard(long roomId, double goalLat, double goalLng, int topN);

    Long getLeaderboardSize(String leaderboardKey);
}