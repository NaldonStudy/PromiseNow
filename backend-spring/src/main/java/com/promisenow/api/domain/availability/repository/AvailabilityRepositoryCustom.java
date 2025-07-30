package com.promisenow.api.domain.availability.repository;

import com.promisenow.api.domain.availability.dto.AvailabilityResponseDto;

import java.time.LocalDate;
import java.util.List;

public interface AvailabilityRepositoryCustom {
    
    /**
     * 특정 날짜, 룸, 슬롯에서 선택한 사용자들의 정보를 DB에서 직접 필터링하여 조회
     * @param roomId 룸 ID
     * @param date 날짜
     * @param slot 시간대 슬롯 (0-29, 30분 단위)
     * @return 선택한 사용자들의 정보 DTO 리스트
     */
    List<AvailabilityResponseDto.ConfirmedUsersResponse.UserInfo> findConfirmedUsersBySlot(Long roomId, LocalDate date, int slot);
} 