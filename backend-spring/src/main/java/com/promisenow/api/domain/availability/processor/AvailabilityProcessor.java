package com.promisenow.api.domain.availability.processor;

import com.promisenow.api.domain.availability.dto.AvailabilityRequestDto;
import com.promisenow.api.domain.availability.dto.AvailabilityResponseDto;
import com.promisenow.api.domain.availability.entity.Availability;

import java.time.LocalDate;
import java.util.List;

/**
 * Availability 도메인 데이터 처리 및 변환을 담당하는 프로세서
 * 도메인 객체 ↔ DTO 변환 로직을 캡슐화
 */
public interface AvailabilityProcessor {
    
    /**
     * 내 일정 조회 - 도메인 객체를 응답 DTO로 변환
     */
    AvailabilityResponseDto.MyAvailabilityResponse processMyAvailability(List<Availability> availabilities);
    
    /**
     * 전체 누적 데이터 조회 - 도메인 객체를 응답 DTO로 변환
     */
    AvailabilityResponseDto.TotalAvailabilityResponse processTotalAvailability(List<Availability> availabilities);
    
    /**
     * 선택한 사용자 목록 - 도메인 객체를 응답 DTO로 변환
     */
    AvailabilityResponseDto.ConfirmedUsersResponse processSelectedUsers(List<Availability> availabilities);
}