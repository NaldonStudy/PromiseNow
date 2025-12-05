package com.promisenow.api.domain.leaderboard.repository;

import com.promisenow.api.domain.leaderboard.dto.UserPositionDto;
import java.util.Set;

public interface LeaderboardRepository {
    
    /**
     * 사용자 위치 정보 저장
     */
    void saveUserPosition(String userKey, UserPositionDto userPosition);
    
    /**
     * 사용자 위치 정보 조회
     */
    UserPositionDto getUserPosition(String userKey);
    
    /**
     * 온라인 상태 설정
     */
    void setOnlineStatus(String onlineKey, boolean online, long ttlSeconds);
    
    /**
     * 온라인 상태 확인
     */
    boolean isOnline(String onlineKey);
    
    /**
     * 리더보드에 사용자 추가/업데이트
     */
    void addToLeaderboard(String leaderboardKey, String roomUserId, double score);
    
    /**
     * 도착 순서에 사용자 추가
     */
    void addToArrivalOrder(String arrivalOrderKey, String roomUserId, long timestamp);
    
    /**
     * 리더보드 상위 N명 조회
     */
    Set<Object> getTopUsers(String leaderboardKey, int topN);
    
    /**
     * 리더보드 크기 조회
     */
    Long getLeaderboardSize(String leaderboardKey);
    
    /**
     * 연결 테스트
     */
    boolean testConnection();
}
