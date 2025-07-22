package com.promisenow.api.domain.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

@Service
public class LocationDomainService {
    
    /**
     * 두 지점 간의 거리 계산 (Haversine 공식)
     */
    public double calculateDistance(double lat1, double lng1, double lat2, double lng2) {
        final int R = 6371; // 지구의 반지름 (km)
        
        double latDistance = Math.toRadians(lat2 - lat1);
        double lngDistance = Math.toRadians(lng2 - lng1);
        
        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(lngDistance / 2) * Math.sin(lngDistance / 2);
        
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        
        return R * c * 1000; // 미터 단위로 반환
    }
    
    /**
     * 도착 여부 판정
     */
    public boolean isArrived(double userLat, double userLng, 
                           double destinationLat, double destinationLng, 
                           double radius) {
        double distance = calculateDistance(userLat, userLng, destinationLat, destinationLng);
        return distance <= radius;
    }
    
    /**
     * 예상 도착 시간 계산 (평균 속도 기반)
     */
    public LocalDateTime calculateETA(double userLat, double userLng,
                                    double destinationLat, double destinationLng,
                                    double averageSpeed) { // km/h
        
        double distance = calculateDistance(userLat, userLng, destinationLat, destinationLng);
        double timeInHours = distance / 1000 / averageSpeed; // 시간 단위
        
        return LocalDateTime.now().plusSeconds((long) (timeInHours * 3600));
    }
    
    /**
     * 지각 확률 계산 (간단한 예시)
     */
    public double calculateLateProbability(LocalDateTime appointmentTime, 
                                         LocalDateTime estimatedArrivalTime) {
        
        if (estimatedArrivalTime.isBefore(appointmentTime)) {
            return 0.0; // 정시 도착
        }
        
        long delayMinutes = java.time.Duration.between(appointmentTime, estimatedArrivalTime).toMinutes();
        
        // 지각 시간에 따른 확률 계산 (예시)
        if (delayMinutes <= 5) return 0.1;
        if (delayMinutes <= 10) return 0.3;
        if (delayMinutes <= 15) return 0.5;
        if (delayMinutes <= 30) return 0.7;
        return 0.9; // 30분 이상 지각
    }
    
    /**
     * 평균 속도 계산
     */
    public double calculateAverageSpeed(List<LocationPoint> locationHistory) {
        if (locationHistory.size() < 2) {
            return 0.0;
        }
        
        double totalDistance = 0.0;
        long totalTime = 0;
        
        for (int i = 1; i < locationHistory.size(); i++) {
            LocationPoint prev = locationHistory.get(i - 1);
            LocationPoint curr = locationHistory.get(i);
            
            totalDistance += calculateDistance(prev.latitude, prev.longitude, 
                                            curr.latitude, curr.longitude);
            totalTime += curr.timestamp - prev.timestamp;
        }
        
        if (totalTime == 0) return 0.0;
        
        // m/s를 km/h로 변환
        return (totalDistance / totalTime) * 3.6;
    }
    
    /**
     * 위치 포인트 클래스
     */
    public static class LocationPoint {
        public final double latitude;
        public final double longitude;
        public final long timestamp;
        
        public LocationPoint(double latitude, double longitude, long timestamp) {
            this.latitude = latitude;
            this.longitude = longitude;
            this.timestamp = timestamp;
        }
    }
} 