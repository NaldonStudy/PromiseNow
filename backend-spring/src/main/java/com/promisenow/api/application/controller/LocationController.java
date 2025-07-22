package com.promisenow.api.application.controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.promisenow.api.application.service.LocationApplicationService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("/api/location")
@CrossOrigin(origins = {"http://localhost:5555", "http://localhost:3000"})
@Tag(name = "위치 관리", description = "실시간 위치 추적 및 관리 API")
public class LocationController {
    
    @Autowired
    private LocationApplicationService locationApplicationService;
    
    /**
     * 실시간 위치 업데이트 (Redis 최적화)
     */
    @PostMapping("/update")
    @Operation(summary = "위치 업데이트", description = "사용자의 실시간 위치를 업데이트합니다.")
    public ResponseEntity<?> updateLocation(@RequestBody Map<String, Object> request) {
        try {
            Long userId = Long.valueOf(request.get("userId").toString());
            Double latitude = Double.valueOf(request.get("latitude").toString());
            Double longitude = Double.valueOf(request.get("longitude").toString());
            
            // 비동기로 위치 업데이트 (성능 최적화)
            locationApplicationService.updateUserLocation(userId, latitude, longitude);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "위치가 업데이트되었습니다."
            ));
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "위치 업데이트에 실패했습니다: " + e.getMessage()
            ));
        }
    }
    
    /**
     * 방 내 모든 참여자 위치 조회 (Redis 최적화)
     */
    @GetMapping("/room/{roomId}")
    @Operation(summary = "방 내 위치 조회", description = "특정 방의 모든 참여자 위치 정보를 조회합니다.")
    public ResponseEntity<?> getRoomLocations(@PathVariable String roomId) {
        try {
            Map<String, Object> result = locationApplicationService.getRoomLocations(roomId);
            
            if ((Boolean) result.get("success")) {
                return ResponseEntity.ok(result);
            } else {
                return ResponseEntity.badRequest().body(result);
            }
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "위치 정보 조회에 실패했습니다: " + e.getMessage()
            ));
        }
    }
    
    /**
     * 예상 도착 시간 계산
     */
    @GetMapping("/eta/{roomId}/{userId}")
    @Operation(summary = "도착 시간 계산", description = "사용자의 예상 도착 시간을 계산합니다.")
    public ResponseEntity<?> calculateETA(@PathVariable String roomId, @PathVariable Long userId) {
        try {
            Map<String, Object> result = locationApplicationService.calculateETA(roomId, userId);
            
            if ((Boolean) result.get("success")) {
                return ResponseEntity.ok(result);
            } else {
                return ResponseEntity.badRequest().body(result);
            }
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "ETA 계산에 실패했습니다: " + e.getMessage()
            ));
        }
    }
    
    /**
     * 방 내 도착 순위 조회 (Redis ZSet 최적화)
     */
    @GetMapping("/ranking/{roomId}")
    @Operation(summary = "도착 순위 조회", description = "방 내 참여자들의 도착 순위를 조회합니다.")
    public ResponseEntity<?> getArrivalRanking(@PathVariable String roomId) {
        try {
            Map<String, Object> result = locationApplicationService.getArrivalRanking(roomId);
            
            if ((Boolean) result.get("success")) {
                return ResponseEntity.ok(result);
            } else {
                return ResponseEntity.badRequest().body(result);
            }
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "도착 순위 조회에 실패했습니다: " + e.getMessage()
            ));
        }
    }
    
    /**
     * 배치 위치 업데이트 (성능 최적화)
     */
    @PostMapping("/batch-update")
    @Operation(summary = "배치 위치 업데이트", description = "여러 사용자의 위치를 한 번에 업데이트합니다.")
    public ResponseEntity<?> batchUpdateLocations(@RequestBody Map<String, Object> request) {
        try {
            @SuppressWarnings("unchecked")
            var locations = (java.util.List<Map<String, Object>>) request.get("locations");
            
            // 비동기로 배치 처리
            locations.parallelStream().forEach(location -> {
                try {
                    Long userId = Long.valueOf(location.get("userId").toString());
                    Double latitude = Double.valueOf(location.get("latitude").toString());
                    Double longitude = Double.valueOf(location.get("longitude").toString());
                    
                    locationApplicationService.updateUserLocation(userId, latitude, longitude);
                } catch (Exception e) {
                    // 개별 실패는 로그만 남기고 계속 진행
                    System.err.println("개별 위치 업데이트 실패: " + e.getMessage());
                }
            });
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "배치 위치 업데이트가 완료되었습니다.",
                "processedCount", locations.size()
            ));
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "배치 위치 업데이트에 실패했습니다: " + e.getMessage()
            ));
        }
    }
} 