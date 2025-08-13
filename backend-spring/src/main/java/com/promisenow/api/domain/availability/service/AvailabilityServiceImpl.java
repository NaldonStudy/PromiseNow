package com.promisenow.api.domain.availability.service;

import com.promisenow.api.domain.availability.dto.AvailabilityRequestDto;
import com.promisenow.api.domain.availability.dto.AvailabilityResponseDto;
import com.promisenow.api.domain.availability.dto.RecommendationTimeResponseDto;
import com.promisenow.api.domain.availability.entity.Availability;
import com.promisenow.api.domain.availability.processor.AvailabilityProcessor;
import com.promisenow.api.domain.availability.repository.AvailabilityRepository;
import com.promisenow.api.domain.room.entity.RoomUser;
import com.promisenow.api.domain.room.repository.RoomUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AvailabilityServiceImpl implements AvailabilityService {
    
    private final AvailabilityRepository availabilityRepository;
    private final RoomUserRepository roomUserRepository;
    private final AvailabilityProcessor availabilityProcessor;
    private static final int START_HOUR = 8;

    @Override
    public List<Availability> getMyAvailability(Long roomUserId) {
        // 해당 사용자의 모든 일정 데이터 조회
        return availabilityRepository.findByRoomUserRoomUserIdOrderByDate(roomUserId);
    }
    
    @Override
    public List<Availability> getTotalAvailability(Long roomId) {
        // 모든 사용자의 일정 데이터 조회
        return availabilityRepository.findAllByRoomId(roomId);
    }
    
    @Override
    public List<AvailabilityResponseDto.ConfirmedUsersResponse.UserInfo> getSelectedUsers(Long roomId, LocalDate date, int slot) {
        // QueryDSL을 사용하여 DB에서 직접 필터링하고 DTO로 반환
        return availabilityRepository.findConfirmedUsersBySlot(roomId, date, slot);
    }
    
    @Override
    public void saveAvailability(Long roomUserId, LocalDate date, String timeData) {
        // 기존 일정이 있는지 확인
        RoomUser roomUser = roomUserRepository.findById(roomUserId)
                .orElseThrow(() -> new IllegalArgumentException("RoomUser not found: " + roomUserId));
        
        // 해당 날짜의 기존 일정 조회
        List<Availability> existingAvailabilities = availabilityRepository
                .findByRoomUserRoomUserIdAndDate(roomUserId, date);
        
        Availability availability;
        if (!existingAvailabilities.isEmpty()) {
            // 기존 일정 수정
            availability = existingAvailabilities.getFirst();
            availability = Availability.builder()
                    .availabilityId(availability.getAvailabilityId())
                    .roomUser(roomUser)
                    .timeData(timeData)
                    .date(date)
                    .build();
        } else {
            // 새 일정 생성
            availability = Availability.builder()
                    .roomUser(roomUser)
                    .timeData(timeData)
                    .date(date)
                    .build();
        }
        
        availabilityRepository.save(availability);
    }
    
    @Override
    @Transactional
    public void batchUpdateAvailability(AvailabilityRequestDto.BatchUpdateRequest request) {
        Long roomUserId = request.getRoomUserId();
        List<AvailabilityRequestDto.DateAvailabilityData> updatedDataList = request.getUpdatedDataList();
        
        // RoomUser 조회
        RoomUser roomUser = roomUserRepository.findById(roomUserId)
                .orElseThrow(() -> new IllegalArgumentException("RoomUser not found: " + roomUserId));
        
        // 업데이트할 날짜들
        List<LocalDate> updateDates = updatedDataList.stream()
                .map(AvailabilityRequestDto.DateAvailabilityData::getDate)
                .collect(Collectors.toList());
        
        // 기존 일정 데이터 조회 (업데이트할 날짜들만)
        List<Availability> existingAvailabilities = availabilityRepository
                .findByRoomUserRoomUserIdAndDateIn(roomUserId, updateDates);
        
        // 날짜별로 기존 데이터 매핑
        Map<LocalDate, Availability> existingByDate = existingAvailabilities.stream()
                .collect(Collectors.toMap(Availability::getDate, availability -> availability));
        
        // 배치 업데이트할 일정 리스트 생성
        List<Availability> availabilitiesToSave = updatedDataList.stream()
                .map(data -> {
                    LocalDate date = data.getDate();
                    String timeData = data.getTimeData();
                    
                    Availability existing = existingByDate.get(date);
                    
                    if (existing != null) {
                        // 기존 일정 수정
                        return Availability.builder()
                                .availabilityId(existing.getAvailabilityId())
                                .roomUser(roomUser)
                                .timeData(timeData)
                                .date(date)
                                .build();
                    } else {
                        // 새 일정 생성
                        return Availability.builder()
                                .roomUser(roomUser)
                                .timeData(timeData)
                                .date(date)
                                .build();
                    }
                })
                .collect(Collectors.toList());
        
        // 배치 저장
        availabilityRepository.saveAll(availabilitiesToSave);
    }

    @Override
    public List<RecommendationTimeResponseDto.RecommendationData> getRecommendationTime(Long roomId) {

        List<Availability> all = getTotalAvailability(roomId);

        AvailabilityResponseDto.TotalAvailabilityResponse totalResponse =
                availabilityProcessor.processTotalAvailability(all);

        List<RecommendationTimeResponseDto.RecommendationData> result = new ArrayList<>();


        for (AvailabilityResponseDto.TotalAvailabilityResponse.DateTotalData data : totalResponse.getTotalDatas()) {

            int[] counts = data.getTimeData()
                    .chars()
                    .map(c -> c - '0')
                    .toArray();

            result.addAll(mergeContinuous(data.getDate(), counts));
        }

        result.sort(Comparator
                .comparingInt(RecommendationTimeResponseDto.RecommendationData::getCount).reversed()
                .thenComparing(RecommendationTimeResponseDto.RecommendationData::getDate)
                .thenComparing(RecommendationTimeResponseDto.RecommendationData::getTimeStart));

        return result;
    }

    private List<RecommendationTimeResponseDto.RecommendationData> mergeContinuous(LocalDate date, int[] counts) {
        List<RecommendationTimeResponseDto.RecommendationData> merged = new ArrayList<>();
        int start = -1;
        int currentCount = -1;

        for (int slot = 0; slot <= counts.length; slot++) {
            if (slot < counts.length && counts[slot] > 0) {
                if (start == -1) {
                    start = slot;
                    currentCount = counts[slot];
                } else if (counts[slot] != currentCount) {
                    merged.add(buildSlot(date, start, slot, currentCount));
                    start = slot;
                    currentCount = counts[slot];
                }
            } else {
                if (start != -1) {
                    merged.add(buildSlot(date, start, slot, currentCount));
                    start = -1;
                }
            }
        }
        return merged;
    }

    private RecommendationTimeResponseDto.RecommendationData buildSlot(LocalDate date, int startSlot, int endSlot, int count) {
        String timeStart = String.format("%02d:%02d", START_HOUR + (startSlot / 2), (startSlot % 2) * 30);
        String timeEnd = String.format("%02d:%02d", START_HOUR + (endSlot / 2), (endSlot % 2) * 30);

        return RecommendationTimeResponseDto.RecommendationData.builder()
                .date(date)
                .timeStart(timeStart)
                .timeEnd(timeEnd)
                .count(count)
                .build();
    }

    @Override
    public List<AvailabilityResponseDto.ConfirmedUsersResponse.UserInfo> getSelectedUsersByDate(Long roomId, LocalDate date) {
        return availabilityRepository.findConfirmedUsersByDate(roomId, date);
    }
} 