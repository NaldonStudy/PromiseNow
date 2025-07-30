package com.promisenow.api.domain.redis.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LeaderboardRedis {
    
    // Redis Key: roomId (UUID)
    private UUID roomId;
    
    // Redis Fields
    private String field1;
    private String field2;
    private String field3;
} 