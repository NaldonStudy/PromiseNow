package com.promisenow.api.domain.availability.processor;

import com.promisenow.api.domain.availability.dto.AvailabilityRequestDto;
import com.promisenow.api.domain.availability.dto.AvailabilityResponseDto;
import com.promisenow.api.domain.availability.entity.Availability;
import com.promisenow.api.domain.room.entity.RoomUser;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class AvailabilityProcessorTest {
    
    private AvailabilityProcessor availabilityProcessor;
    
    @BeforeEach
    void setUp() {
        availabilityProcessor = new AvailabilityProcessorImpl();
    }
    
    @Test
    @DisplayName("내 일정 처리 테스트")
    void processMyAvailability_ShouldReturnCorrectResponse() {
        // given
        List<Availability> availabilities = Arrays.asList(
                createAvailability(LocalDate.of(2025, 1, 15), "111100001111000011110000111100"),
                createAvailability(LocalDate.of(2025, 1, 16), "000011110000111100001111000011")
        );
        
        // when
        AvailabilityResponseDto.MyAvailabilityResponse response =
                availabilityProcessor.processMyAvailability(availabilities);
        
        // then
        assertThat(response.getAvailabilities()).hasSize(2);
        assertThat(response.getAvailabilities().get(0).getDate()).isEqualTo(LocalDate.of(2025, 1, 15));
        assertThat(response.getAvailabilities().get(0).getTimeData()).isEqualTo("111100001111000011110000111100");
    }
    
    @Test
    @DisplayName("전체 누적 데이터 처리 테스트")
    void processTotalAvailability_ShouldCalculateCorrectTotals() {
        // given - 같은 날짜에 여러 사용자의 일정
        List<Availability> availabilities = Arrays.asList(
                createAvailability(LocalDate.of(2025, 1, 15), "111100001111000011110000111100"),
                createAvailability(LocalDate.of(2025, 1, 15), "000011110000111100001111000011"),
                createAvailability(LocalDate.of(2025, 1, 16), "111111111111111111111111111111")
        );
        
        // when
        AvailabilityResponseDto.TotalAvailabilityResponse response =
                availabilityProcessor.processTotalAvailability(availabilities);
        
        // then
        assertThat(response.getTotalDatas()).hasSize(2);
        
        // 2025-01-15: 첫 번째 슬롯은 1+0=1, 두 번째 슬롯은 1+0=1, ...
        String expectedTimeData1 = "111111111111111111111111111111"; // 모든 슬롯이 1
        assertThat(response.getTotalDatas().get(0).getTimeData()).isEqualTo(expectedTimeData1);
        
        // 2025-01-16: 모든 슬롯이 1
        String expectedTimeData2 = "111111111111111111111111111111";
        assertThat(response.getTotalDatas().get(1).getTimeData()).isEqualTo(expectedTimeData2);
    }
    
    @Test
    @DisplayName("선택한 사용자 목록 처리 테스트")
    void processSelectedUsers_ShouldReturnUserInfo() {
        // given
        RoomUser roomUser1 = RoomUser.builder()
                .roomUserId(1L)
                .nickname("푸른호랑이32")
                .profileImage("https://example.com/profile1.jpg")
                .build();
        
        RoomUser roomUser2 = RoomUser.builder()
                .roomUserId(2L)
                .nickname("조용한고래78")
                .profileImage(null)
                .build();
        
        List<Availability> availabilities = Arrays.asList(
                createAvailabilityWithRoomUser(LocalDate.of(2025, 1, 15), "111100001111000011110000111100", roomUser1),
                createAvailabilityWithRoomUser(LocalDate.of(2025, 1, 15), "000011110000111100001111000011", roomUser2)
        );
        
        // when
        AvailabilityResponseDto.ConfirmedUsersResponse response =
                availabilityProcessor.processSelectedUsers(availabilities);
        
        // then
        assertThat(response.getConfirmedUserList()).hasSize(2);
        assertThat(response.getConfirmedUserList().get(0).getNickname()).isEqualTo("푸른호랑이32");
        assertThat(response.getConfirmedUserList().get(0).getProfileImage()).isEqualTo("https://example.com/profile1.jpg");
        assertThat(response.getConfirmedUserList().get(1).getNickname()).isEqualTo("조용한고래78");
        assertThat(response.getConfirmedUserList().get(1).getProfileImage()).isNull();
    }
    
    @Test
    @DisplayName("룸 사용자 ID 목록 처리 테스트")
    void processRoomUserIds_ShouldReturnCorrectIds() {
        // given
        List<Long> roomUserIds = Arrays.asList(1L, 2L, 3L, 4L);
        
        // when
        AvailabilityResponseDto.RoomUserIdsResponse response =
                availabilityProcessor.processRoomUserIds(roomUserIds);
        
        // then
        assertThat(response.getRoomUserIds()).hasSize(4);
        assertThat(response.getRoomUserIds()).containsExactly(1L, 2L, 3L, 4L);
    }
    
    private Availability createAvailability(LocalDate date, String timeData) {
        return Availability.builder()
                .date(date)
                .timeData(timeData)
                .build();
    }
    
    private Availability createAvailabilityWithRoomUser(LocalDate date, String timeData, RoomUser roomUser) {
        return Availability.builder()
                .date(date)
                .timeData(timeData)
                .roomUser(roomUser)
                .build();
    }
}