package com.promisenow.api.domain.leaderboard.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "Leaderboard")
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Leaderboard {
    
    @Id
    @Column(name = "leaderboard_id", nullable = false)
    private String leaderboardId;
    
    @Column(name = "user_nickname", nullable = false, length = 30)
    private String userNickname;
    
    @Column(name = "ranking_order", nullable = false)
    private Integer rankingOrder;
} 