package com.promisenow.api.domain.leaderboard.dto;

import lombok.*;

import java.util.HashMap;
import java.util.Map;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@ToString
@EqualsAndHashCode
public class UserPositionDto {
    
    // 기본 위치 정보
    private Double lat;
    private Double lng;
    private Long timestamp;
    
    // 시작 위치 (최초 위치)
    private Double startLat;
    private Double startLng;
    
    // 이동 정보
    private Double velocity; // km/h
    private Double progress; // 0.0 ~ 1.0
    private Boolean arrived;
    
    // 온라인 상태
    private Boolean online;
    
    /**
     * Redis에서 가져온 Map 데이터로부터 DTO 생성
     */
    public static UserPositionDto fromRedisMap(Map<Object, Object> redisData) {
        return UserPositionDto.builder()
                .lat(safeParseDouble(redisData.get("lat")))
                .lng(safeParseDouble(redisData.get("lng")))
                .timestamp(safeParseLong(redisData.get("time")))
                .startLat(safeParseDouble(redisData.get("startLat")))
                .startLng(safeParseDouble(redisData.get("startLng")))
                .velocity(safeParseDouble(redisData.get("velocity")))
                .progress(safeParseDouble(redisData.get("progress")))
                .arrived(safeParseBoolean(redisData.get("arrived")))
                .build();
    }
    
    /**
     * DTO를 Redis에 저장할 Map으로 변환
     */
    public Map<String, Object> toRedisMap() {
        Map<String, Object> map = new HashMap<>();
        
        if (lat != null) map.put("lat", lat);
        if (lng != null) map.put("lng", lng);
        if (timestamp != null) map.put("time", timestamp);
        if (startLat != null) map.put("startLat", startLat);
        if (startLng != null) map.put("startLng", startLng);
        if (velocity != null) map.put("velocity", velocity);
        if (progress != null) map.put("progress", progress);
        if (arrived != null) map.put("arrived", arrived);
        
        return map;
    }
    
    /**
     * 새로운 위치 정보로 업데이트된 DTO 생성
     */
    public UserPositionDto withPosition(Double lat, Double lng, Long timestamp) {
        return UserPositionDto.builder()
                .lat(lat)
                .lng(lng)
                .timestamp(timestamp)
                .startLat(this.startLat)
                .startLng(this.startLng)
                .velocity(this.velocity)
                .progress(this.progress)
                .arrived(this.arrived)
                .online(this.online)
                .build();
    }
    
    /**
     * 시작 위치가 설정된 새로운 DTO 생성
     */
    public UserPositionDto withStartPosition(Double startLat, Double startLng) {
        return UserPositionDto.builder()
                .lat(this.lat)
                .lng(this.lng)
                .timestamp(this.timestamp)
                .startLat(startLat)
                .startLng(startLng)
                .velocity(this.velocity)
                .progress(this.progress)
                .arrived(this.arrived)
                .online(this.online)
                .build();
    }
    
    /**
     * 도착 상태가 설정된 새로운 DTO 생성
     */
    public UserPositionDto withArrived(boolean arrived) {
        return UserPositionDto.builder()
                .lat(this.lat)
                .lng(this.lng)
                .timestamp(this.timestamp)
                .startLat(this.startLat)
                .startLng(this.startLng)
                .velocity(arrived ? 0.0 : this.velocity)
                .progress(arrived ? 1.0 : this.progress)
                .arrived(arrived)
                .online(this.online)
                .build();
    }
    
    /**
     * 속도가 설정된 새로운 DTO 생성
     */
    public UserPositionDto withVelocity(Double velocity) {
        return UserPositionDto.builder()
                .lat(this.lat)
                .lng(this.lng)
                .timestamp(this.timestamp)
                .startLat(this.startLat)
                .startLng(this.startLng)
                .velocity(velocity)
                .progress(this.progress)
                .arrived(this.arrived)
                .online(this.online)
                .build();
    }
    
    /**
     * 진행률이 계산된 새로운 DTO 생성
     */
    public UserPositionDto withCalculatedProgress(double totalDistance, double distanceLeft) {
        double progress = totalDistance > 0 ? (totalDistance - distanceLeft) / totalDistance : 0.0;
        
        return UserPositionDto.builder()
                .lat(this.lat)
                .lng(this.lng)
                .timestamp(this.timestamp)
                .startLat(this.startLat)
                .startLng(this.startLng)
                .velocity(this.velocity)
                .progress(progress)
                .arrived(this.arrived)
                .online(this.online)
                .build();
    }
    
    /**
     * 빈 DTO 생성 (새로운 사용자용)
     */
    public static UserPositionDto empty() {
        return UserPositionDto.builder().build();
    }
    
    /**
     * 안전한 Double 파싱
     */
    private static Double safeParseDouble(Object value) {
        if (value == null) return null;
        try {
            if (value instanceof Number) {
                return ((Number) value).doubleValue();
            }
            return Double.parseDouble(value.toString());
        } catch (NumberFormatException e) {
            return null;
        }
    }
    
    /**
     * 안전한 Long 파싱
     */
    private static Long safeParseLong(Object value) {
        if (value == null) return null;
        try {
            if (value instanceof Number) {
                return ((Number) value).longValue();
            }
            return Long.parseLong(value.toString());
        } catch (NumberFormatException e) {
            return null;
        }
    }
    
    /**
     * 안전한 Boolean 파싱
     */
    private static Boolean safeParseBoolean(Object value) {
        if (value == null) return null;
        if (value instanceof Boolean) {
            return (Boolean) value;
        }
        return Boolean.parseBoolean(value.toString());
    }
}
