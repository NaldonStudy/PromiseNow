package com.promisenow.api.domain.leaderboard.controller;

import com.promisenow.api.domain.leaderboard.service.LeaderboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/leaderboards")
@RequiredArgsConstructor
public class LeaderboardController {
    
    private final LeaderboardService leaderboardService;
    

} 