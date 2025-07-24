package com.promisenow.api.domain.redis.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserRedis {
    
    // Redis Hash 구조: start_location
    private LocationData startLocation;
    
    // Redis Hash 구조: location
    private LocationData location;
    
    // Redis String with TTL: online
    private String online;
    
    // Redis Integer: current_velocity
    private Integer currentVelocity;
    
    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LocationData {
        private Double lat;
        private Double lng;
        private LocalDateTime timestamp;
    }
} 