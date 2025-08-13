package com.promisenow.api.domain.availability.service;

import com.promisenow.api.domain.availability.dto.AvailabilityRequestDto;
import com.promisenow.api.domain.availability.dto.AvailabilityResponseDto;
import com.promisenow.api.domain.availability.dto.RecommendationTimeResponseDto;
import com.promisenow.api.domain.availability.entity.Availability;

import java.time.LocalDate;
import java.util.List;

public interface AvailabilityService {
    
    // 내 일정 조회 - 도메인 객체 반환
    List<Availability> getMyAvailability(Long roomUserId);
    
    // 전체 누적 데이터 조회 - 도메인 객체 반환
    List<Availability> getTotalAvailability(Long roomId);
    
    // 특정 시간대 선택자 조회 - DTO 직접 반환 (QueryDSL 최적화)
    List<AvailabilityResponseDto.ConfirmedUsersResponse.UserInfo> getSelectedUsers(Long roomId, LocalDate date, int slot);
    
    // 일정 저장/수정 (단일)
    void saveAvailability(Long roomUserId, LocalDate date, String timeData);
    
    // 일정 배치 업데이트 (여러 날짜)
    void batchUpdateAvailability(AvailabilityRequestDto.BatchUpdateRequest request);

    // 사용자 정보 DTO
    record UserInfo(String nickname, String profileImage) {}

    // 추천 날짜 조회
    List<RecommendationTimeResponseDto.RecommendationData> getRecommendationTime(Long roomId);

    // 특정 날짜 선택자 조회
    List<AvailabilityResponseDto.ConfirmedUsersResponse.UserInfo> getSelectedUsersByDate(Long roomId, LocalDate date);
} 