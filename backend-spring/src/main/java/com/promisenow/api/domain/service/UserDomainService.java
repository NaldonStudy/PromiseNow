package com.promisenow.api.domain.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.regex.Pattern;

import org.springframework.stereotype.Service;

import com.promisenow.api.domain.entity.User;

@Service
public class UserDomainService {
    
    private static final Pattern USERNAME_PATTERN = Pattern.compile("^[a-zA-Z0-9가-힣]{2,20}$");
    private static final Pattern PASSWORD_PATTERN = Pattern.compile("^(?=.*[A-Za-z])(?=.*\\d)[A-Za-z\\d@$!%*?&]{8,}$");
    
    /**
     * 사용자명 유효성 검사
     */
    public boolean isValidUsername(String username) {
        if (username == null || username.trim().isEmpty()) {
            return false;
        }
        
        return USERNAME_PATTERN.matcher(username).matches();
    }
    
    /**
     * 비밀번호 유효성 검사
     */
    public boolean isValidPassword(String password) {
        if (password == null || password.length() < 6) {
            return false;
        }
        
        return PASSWORD_PATTERN.matcher(password).matches();
    }
    
    /**
     * 사용자가 온라인인지 확인
     */
    public boolean isUserOnline(User user, long lastSeenThreshold) {
        // 실제로는 Redis에서 온라인 상태를 확인해야 함
        // 여기서는 간단한 예시
        return true;
    }
    
    /**
     * 사용자가 방에 참여 중인지 확인
     */
    public boolean isUserInRoom(User user, String roomId) {
        return roomId.equals(user.getRoomId());
    }
    
    /**
     * 사용자가 다른 방에 참여 중인지 확인
     */
    public boolean isUserInOtherRoom(User user, String currentRoomId) {
        return user.getRoomId() != null && !user.getRoomId().equals(currentRoomId);
    }
    
    /**
     * 사용자 프로필 이미지 유효성 검사
     */
    public boolean isValidProfileImage(String profileImageUrl) {
        if (profileImageUrl == null || profileImageUrl.trim().isEmpty()) {
            return true; // 프로필 이미지는 선택사항
        }
        
        // URL 형식 검사 (간단한 예시)
        return profileImageUrl.startsWith("http://") || 
               profileImageUrl.startsWith("https://") ||
               profileImageUrl.startsWith("data:image/");
    }
    
    /**
     * 사용자 권한 확인
     */
    public boolean hasPermission(User user, String permission) {
        // 기본적으로 모든 사용자는 USER 권한을 가짐
        return "USER".equals(permission);
    }
    
    /**
     * 사용자 활동 상태 확인
     */
    public UserActivityStatus getUserActivityStatus(User user, LocalDateTime lastActivity) {
        if (lastActivity == null) {
            return UserActivityStatus.INACTIVE;
        }
        
        LocalDateTime now = LocalDateTime.now();
        long minutesSinceLastActivity = java.time.Duration.between(lastActivity, now).toMinutes();
        
        if (minutesSinceLastActivity < 5) {
            return UserActivityStatus.ACTIVE;
        } else if (minutesSinceLastActivity < 30) {
            return UserActivityStatus.AWAY;
        } else {
            return UserActivityStatus.INACTIVE;
        }
    }
    
    /**
     * 사용자 활동 상태 열거형
     */
    public enum UserActivityStatus {
        ACTIVE,    // 활성 (5분 이내 활동)
        AWAY,      // 자리비움 (5-30분)
        INACTIVE   // 비활성 (30분 이상)
    }
    
    /**
     * 사용자 통계 계산
     */
    public UserStats calculateUserStats(User user, List<RoomParticipation> participations) {
        int totalRooms = participations.size();
        int completedRooms = (int) participations.stream()
            .filter(p -> p.status == ParticipationStatus.COMPLETED)
            .count();
        
        int onTimeArrivals = (int) participations.stream()
            .filter(p -> p.arrivalRank == 1)
            .count();
        
        double onTimeRate = totalRooms > 0 ? (double) onTimeArrivals / totalRooms : 0.0;
        
        return new UserStats(totalRooms, completedRooms, onTimeArrivals, onTimeRate);
    }
    
    /**
     * 사용자 통계 클래스
     */
    public static class UserStats {
        public final int totalRooms;
        public final int completedRooms;
        public final int onTimeArrivals;
        public final double onTimeRate;
        
        public UserStats(int totalRooms, int completedRooms, int onTimeArrivals, double onTimeRate) {
            this.totalRooms = totalRooms;
            this.completedRooms = completedRooms;
            this.onTimeArrivals = onTimeArrivals;
            this.onTimeRate = onTimeRate;
        }
    }
    
    /**
     * 방 참여 정보 클래스
     */
    public static class RoomParticipation {
        public final String roomId;
        public final ParticipationStatus status;
        public final int arrivalRank;
        public final LocalDateTime joinedAt;
        public final LocalDateTime arrivedAt;
        
        public RoomParticipation(String roomId, ParticipationStatus status, 
                               int arrivalRank, LocalDateTime joinedAt, LocalDateTime arrivedAt) {
            this.roomId = roomId;
            this.status = status;
            this.arrivalRank = arrivalRank;
            this.joinedAt = joinedAt;
            this.arrivedAt = arrivedAt;
        }
    }
    
    /**
     * 참여 상태 열거형
     */
    public enum ParticipationStatus {
        JOINED,     // 참여 중
        COMPLETED,  // 완료
        CANCELLED   // 취소
    }
} 