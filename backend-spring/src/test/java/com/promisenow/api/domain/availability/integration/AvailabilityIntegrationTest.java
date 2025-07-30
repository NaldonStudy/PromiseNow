package com.promisenow.api.domain.availability.integration;

import com.promisenow.api.domain.availability.entity.Availability;
import com.promisenow.api.domain.availability.service.AvailabilityService;
import com.promisenow.api.domain.room.entity.Room;
import com.promisenow.api.domain.room.entity.RoomUser;
import com.promisenow.api.domain.room.repository.RoomUserRepository;
import com.promisenow.api.domain.user.entity.User;
import com.promisenow.api.domain.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class AvailabilityIntegrationTest {
    
    @Autowired
    private AvailabilityService availabilityService;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private RoomUserRepository roomUserRepository;
    
    private Long roomUserId1;
    private Long roomUserId2;
    private Long roomId;
    
    @BeforeEach
    void setUp() {
        // 테스트용 데이터는 schema.sql에서 자동으로 로드됨
        // roomUserId 1, 2는 schema.sql에서 생성된 데이터 사용
        roomUserId1 = 1L;
        roomUserId2 = 2L;
        roomId = 1L;
    }
    
    @Test
    @DisplayName("내 일정 조회 통합 테스트")
    void getMyAvailability_ShouldReturnUserAvailability() {
        // when
        List<Availability> availabilities = availabilityService.getMyAvailability(roomUserId1);
        
        // then
        assertThat(availabilities).isNotEmpty();
        assertThat(availabilities).hasSize(5); // schema.sql에서 5일치 데이터 생성
        
        // 첫 번째 일정 확인
        Availability firstAvailability = availabilities.get(0);
        assertThat(firstAvailability.getDate()).isEqualTo(LocalDate.of(2025, 1, 15));
        assertThat(firstAvailability.getTimeData()).isEqualTo("111100001111000011110000111100");
        assertThat(firstAvailability.getRoomUser().getNickname()).isEqualTo("푸른호랑이32");
    }
    
    @Test
    @DisplayName("전체 누적 데이터 계산 통합 테스트")
    void getTotalAvailability_ShouldCalculateCorrectTotals() {
        // when
        List<Availability> availabilities = availabilityService.getTotalAvailability(roomId);
        
        // then
        assertThat(availabilities).isNotEmpty();
        
        // 2025-01-15 날짜의 데이터 확인
        List<Availability> date20250115 = availabilities.stream()
                .filter(a -> a.getDate().equals(LocalDate.of(2025, 1, 15)))
                .toList();
        
        assertThat(date20250115).hasSize(5); // 5명의 사용자
        
        // 각 사용자의 timeData 확인
        assertThat(date20250115.stream()
                .map(Availability::getTimeData)
                .toList())
                .containsExactlyInAnyOrder(
                        "111100001111000011110000111100", // 사용자 1
                        "000011110000111100001111000011", // 사용자 2
                        "111111111111111111111111111111", // 사용자 3
                        "000000000000000000000000000000", // 사용자 4
                        "101010101010101010101010101010"  // 사용자 5
                );
    }
    
    @Test
    @DisplayName("특정 시간대 선택자 조회 통합 테스트")
    void getSelectedUsers_ShouldReturnUsersForSpecificSlot() {
        // given
        LocalDate date = LocalDate.of(2025, 1, 15);
        int slot = 0; // 첫 번째 슬롯 (6:00-6:30)
        
        // when
        List<Availability> selectedUsers = availabilityService.getSelectedUsers(roomId, date, slot);
        
        // then
        // slot 0에서 1을 선택한 사용자들: 사용자 1, 3, 5
        assertThat(selectedUsers).hasSize(3);
        
        List<String> nicknames = selectedUsers.stream()
                .map(availability -> availability.getRoomUser().getNickname())
                .toList();
        
        assertThat(nicknames).containsExactlyInAnyOrder(
                "푸른호랑이32", // 사용자 1: "111100001111000011110000111100"
                "빠른토끼15",   // 사용자 3: "111111111111111111111111111111"
                "용감한사자44"  // 사용자 5: "101010101010101010101010101010"
        );
    }
    
    @Test
    @DisplayName("룸 사용자 ID 목록 조회 통합 테스트")
    void getRoomUserIds_ShouldReturnAllRoomUserIds() {
        // when
        List<Long> roomUserIds = availabilityService.getRoomUserIds(roomId);
        
        // then
        assertThat(roomUserIds).hasSize(5); // 룸 1에 5명 참여
        assertThat(roomUserIds).containsExactlyInAnyOrder(1L, 2L, 3L, 4L, 5L);
    }
    
    @Test
    @DisplayName("일정 저장 및 수정 통합 테스트")
    void saveAndUpdateAvailability_ShouldWorkCorrectly() {
        // given
        LocalDate newDate = LocalDate.of(2025, 1, 25);
        String newTimeData = "111111111111111111111111111111";
        
        // when - 새 일정 저장
        availabilityService.saveAvailability(roomUserId1, newDate, newTimeData);
        
        // then - 저장된 일정 확인
        List<Availability> availabilities = availabilityService.getMyAvailability(roomUserId1);
        Availability savedAvailability = availabilities.stream()
                .filter(a -> a.getDate().equals(newDate))
                .findFirst()
                .orElse(null);
        
        assertThat(savedAvailability).isNotNull();
        assertThat(savedAvailability.getTimeData()).isEqualTo(newTimeData);
        
        // when - 기존 일정 수정
        String updatedTimeData = "000000000000000000000000000000";
        availabilityService.saveAvailability(roomUserId1, newDate, updatedTimeData);
        
        // then - 수정된 일정 확인
        availabilities = availabilityService.getMyAvailability(roomUserId1);
        Availability updatedAvailability = availabilities.stream()
                .filter(a -> a.getDate().equals(newDate))
                .findFirst()
                .orElse(null);
        
        assertThat(updatedAvailability).isNotNull();
        assertThat(updatedAvailability.getTimeData()).isEqualTo(updatedTimeData);
    }
    
    @Test
    @DisplayName("다른 룸의 데이터는 조회되지 않음 테스트")
    void getTotalAvailability_ShouldNotIncludeOtherRoomData() {
        // given - 룸 2의 데이터도 존재함 (schema.sql에서 생성)
        Long room2Id = 2L;
        
        // when
        List<Availability> room1Availabilities = availabilityService.getTotalAvailability(roomId);
        List<Availability> room2Availabilities = availabilityService.getTotalAvailability(room2Id);
        
        // then
        assertThat(room1Availabilities).hasSize(25); // 룸 1: 5명 × 5일
        assertThat(room2Availabilities).hasSize(6);  // 룸 2: 3명 × 2일
        
        // 룸 1의 데이터는 룸 2에 포함되지 않음
        assertThat(room1Availabilities.stream()
                .map(Availability::getRoomUser)
                .map(RoomUser::getRoom)
                .map(Room::getRoomId)
                .distinct())
                .containsOnly(roomId);
        
        assertThat(room2Availabilities.stream()
                .map(Availability::getRoomUser)
                .map(RoomUser::getRoom)
                .map(Room::getRoomId)
                .distinct())
                .containsOnly(room2Id);
    }
} 