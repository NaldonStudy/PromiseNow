package com.promisenow.api.domain.availability.service;

import com.promisenow.api.domain.availability.dto.AvailabilityResponseDto;
import com.promisenow.api.domain.availability.entity.Availability;
import com.promisenow.api.domain.availability.processor.AvailabilityProcessor;
import com.promisenow.api.domain.room.entity.Room;
import com.promisenow.api.domain.room.entity.RoomUser;
import com.promisenow.api.domain.user.entity.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
class AvailabilityServicePerformanceTest {
    
    @Autowired
    private AvailabilityService availabilityService;
    
    @Autowired
    private AvailabilityProcessor availabilityProcessor;
    
    private Long roomId = 1L;
    private LocalDate testDate = LocalDate.of(2025, 1, 15);
    private int testSlot = 12;
    
    @BeforeEach
    void setUp() {
        // 테스트 데이터는 실제 DB에서 생성되어야 하므로
        // 실제 환경에서 테스트를 실행해야 합니다.
    }
    
    @Test
    void 성능_비교_테스트() {
        // 기존 방식: 전체 조회 후 Java에서 필터링
        long startTime = System.currentTimeMillis();
        List<Availability> availabilities = availabilityService.getSelectedUsers(roomId, testDate, testSlot);
        AvailabilityResponseDto.ConfirmedUsersResponse oldResult = availabilityProcessor.processSelectedUsers(availabilities);
        long oldTime = System.currentTimeMillis() - startTime;
        
        // QueryDSL 방식: DB에서 직접 필터링
        startTime = System.currentTimeMillis();
        List<AvailabilityResponseDto.ConfirmedUsersResponse.UserInfo> confirmedUsers = availabilityService.getConfirmedUsersBySlot(roomId, testDate, testSlot);
        AvailabilityResponseDto.ConfirmedUsersResponse newResult = AvailabilityResponseDto.ConfirmedUsersResponse.builder()
                .confirmedUserList(confirmedUsers)
                .build();
        long newTime = System.currentTimeMillis() - startTime;
        
        // 결과가 동일한지 확인
        assertEquals(oldResult.getConfirmedUserList().size(), newResult.getConfirmedUserList().size());
        
        // 성능 로그 출력
        System.out.println("=== 성능 비교 결과 ===");
        System.out.println("기존 방식 (Java 필터링): " + oldTime + "ms");
        System.out.println("QueryDSL 방식 (DB 필터링): " + newTime + "ms");
        System.out.println("성능 개선률: " + String.format("%.2f", (double) oldTime / newTime) + "배");
        
        // QueryDSL 방식이 더 빠를 것으로 예상
        assertTrue(newTime <= oldTime, "QueryDSL 방식이 기존 방식보다 빠르거나 같아야 합니다.");
    }
    
    @Test
    void 결과_일치성_테스트() {
        // 두 방식의 결과가 정확히 일치하는지 확인
        List<Availability> availabilities = availabilityService.getSelectedUsers(roomId, testDate, testSlot);
        AvailabilityResponseDto.ConfirmedUsersResponse oldResult = availabilityProcessor.processSelectedUsers(availabilities);
        
        List<AvailabilityResponseDto.ConfirmedUsersResponse.UserInfo> confirmedUsers = availabilityService.getConfirmedUsersBySlot(roomId, testDate, testSlot);
        AvailabilityResponseDto.ConfirmedUsersResponse newResult = AvailabilityResponseDto.ConfirmedUsersResponse.builder()
                .confirmedUserList(confirmedUsers)
                .build();
        
        // 사용자 수가 동일한지 확인
        assertEquals(oldResult.getConfirmedUserList().size(), newResult.getConfirmedUserList().size());
        
        // 각 사용자의 정보가 동일한지 확인
        for (int i = 0; i < oldResult.getConfirmedUserList().size(); i++) {
            AvailabilityResponseDto.ConfirmedUsersResponse.UserInfo oldUser = oldResult.getConfirmedUserList().get(i);
            AvailabilityResponseDto.ConfirmedUsersResponse.UserInfo newUser = newResult.getConfirmedUserList().get(i);
            
            assertEquals(oldUser.getNickname(), newUser.getNickname());
            assertEquals(oldUser.getProfileImage(), newUser.getProfileImage());
        }
    }
} 