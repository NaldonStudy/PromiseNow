package com.promisenow.api.domain.leaderboard.service;

import com.promisenow.api.domain.leaderboard.entity.Leaderboard;
import com.promisenow.api.domain.leaderboard.repository.LeaderboardRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
@RequiredArgsConstructor
public class LeaderboardServiceImpl implements LeaderboardService {
    
    private final LeaderboardRepository leaderboardRepository;
} 