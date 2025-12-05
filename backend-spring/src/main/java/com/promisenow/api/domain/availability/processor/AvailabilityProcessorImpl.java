package com.promisenow.api.domain.availability.processor;

import com.promisenow.api.domain.availability.dto.AvailabilityRequestDto;
import com.promisenow.api.domain.availability.dto.AvailabilityResponseDto;
import com.promisenow.api.domain.availability.entity.Availability;
import com.promisenow.api.domain.room.entity.RoomUser;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;
import java.util.stream.Collectors;

/**
 * Availability 프로세서 구현체
 * 도메인 객체와 DTO 간의 변환 로직을 담당
 */
@Component
public class AvailabilityProcessorImpl implements AvailabilityProcessor {
    
    @Override
    public AvailabilityResponseDto.MyAvailabilityResponse processMyAvailability(List<Availability> availabilities) {
        List<AvailabilityResponseDto.MyAvailabilityResponse.DateAvailability> dateAvailabilities = 
                availabilities.stream()
                        .map(availability -> AvailabilityResponseDto.MyAvailabilityResponse.DateAvailability.builder()
                                .date(availability.getDate())
                                .timeData(availability.getTimeData())
                                .build())
                        .collect(Collectors.toList());
        
        return AvailabilityResponseDto.MyAvailabilityResponse.builder()
                .availabilities(dateAvailabilities)
                .build();
    }
    
    @Override
    public AvailabilityResponseDto.TotalAvailabilityResponse processTotalAvailability(List<Availability> availabilities) {
        // 날짜별로 그룹화
        Map<LocalDate, List<Availability>> availabilitiesByDate = availabilities.stream()
                .collect(Collectors.groupingBy(
                    Availability::getDate,
                    TreeMap::new,
                    Collectors.toList()
                ));
        
        // 누적 데이터 계산
        List<AvailabilityResponseDto.TotalAvailabilityResponse.DateTotalData> totalDatas = 
                availabilitiesByDate.entrySet().stream()
                        .map(this::calculateTotalDataForDate)
                        .toList();
        
        return AvailabilityResponseDto.TotalAvailabilityResponse.builder()
                .totalDatas(totalDatas)
                .build();
    }
    
    @Override
    public AvailabilityResponseDto.ConfirmedUsersResponse processSelectedUsers(List<Availability> availabilities) {
        List<AvailabilityResponseDto.ConfirmedUsersResponse.UserInfo> confirmedUserList = 
                availabilities.stream()
                        .map(availability -> {
                            RoomUser roomUser = availability.getRoomUser();
                            return AvailabilityResponseDto.ConfirmedUsersResponse.UserInfo.builder()
                                    .nickname(roomUser.getNickname())
                                    .profileImage(roomUser.getProfileImage())
                                    .build();
                        })
                        .collect(Collectors.toList());
        
        return AvailabilityResponseDto.ConfirmedUsersResponse.builder()
                .confirmedUserList(confirmedUserList)
                .build();
    }
    
    /**
     * 특정 날짜의 누적 데이터 계산
     */
    private AvailabilityResponseDto.TotalAvailabilityResponse.DateTotalData calculateTotalDataForDate(
            Map.Entry<LocalDate, List<Availability>> entry) {
        
        LocalDate date = entry.getKey();
        List<Availability> dateAvailabilities = entry.getValue();
        
        // 30개 슬롯에 대한 누적 데이터 계산
        int[] totalSlots = new int[30];
        
        for (Availability availability : dateAvailabilities) {
            String timeData = availability.getTimeData();
            for (int i = 0; i < Math.min(timeData.length(), 30); i++) {
                totalSlots[i] += timeData.charAt(i) == '1' ? 1 : 0;
            }
        }
        
        // 결과를 문자열로 변환
        String timeData = Arrays.stream(totalSlots)
            .mapToObj(String::valueOf)
            .collect(Collectors.joining());
        
        return AvailabilityResponseDto.TotalAvailabilityResponse.DateTotalData.builder()
                .date(date)
                .timeData(timeData)
                .build();
    }
} 