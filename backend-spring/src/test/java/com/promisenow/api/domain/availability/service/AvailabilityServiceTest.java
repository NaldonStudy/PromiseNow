package com.promisenow.api.domain.availability.service;

import com.promisenow.api.domain.availability.dto.AvailabilityResponseDto;
import com.promisenow.api.domain.availability.entity.Availability;
import com.promisenow.api.domain.availability.repository.AvailabilityRepository;
import com.promisenow.api.domain.room.entity.Room;
import com.promisenow.api.domain.room.entity.RoomUser;
import com.promisenow.api.domain.user.entity.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@Transactional
class AvailabilityServiceTest {
    
    @Autowired
    private AvailabilityService availabilityService;
    
    @Autowired
    private AvailabilityRepository availabilityRepository;
    
    private Room testRoom;
    private User testUser1, testUser2, testUser3;
    private RoomUser roomUser1, roomUser2, roomUser3;
    private LocalDate testDate = LocalDate.of(2025, 1, 15);
    
    @BeforeEach
    void setUp() {
        // 테스트용 Room 생성
        testRoom = Room.builder()
                .roomId(1L)
                .roomTitle("테스트 룸")
                .roomState(Room.RoomState.ACTIVE)
                .inviteCode(12345)
                .build();
        
        // 테스트용 User 생성
        testUser1 = User.builder()
                .userId(1L)
                .username("user1")
                .email("user1@test.com")
                .build();
        
        testUser2 = User.builder()
                .userId(2L)
                .username("user2")
                .email("user2@test.com")
                .build();
        
        testUser3 = User.builder()
                .userId(3L)
                .username("user3")
                .email("user3@test.com")
                .build();
        
        // 테스트용 RoomUser 생성
        roomUser1 = RoomUser.builder()
                .roomUserId(1L)
                .room(testRoom)
                .user(testUser1)
                .nickname("사용자1")
                .profileImage("https://example.com/profile1.jpg")
                .isAgreed(true)
                .build();
        
        roomUser2 = RoomUser.builder()
                .roomUserId(2L)
                .room(testRoom)
                .user(testUser2)
                .nickname("사용자2")
                .profileImage(null)
                .isAgreed(true)
                .build();
        
        roomUser3 = RoomUser.builder()
                .roomUserId(3L)
                .room(testRoom)
                .user(testUser3)
                .nickname("사용자3")
                .profileImage("https://example.com/profile3.jpg")
                .isAgreed(true)
                .build();
    }
    
    @Test
    @DisplayName("특정 슬롯에서 선택한 사용자들을 조회할 수 있다")
    void getSelectedUsers_특정슬롯_선택자조회() {
        // given
        // 슬롯 12에서 선택한 사용자들 설정
        // user1: 슬롯 12에서 선택 (1)
        // user2: 슬롯 12에서 선택 안함 (0)
        // user3: 슬롯 12에서 선택 (1)
        String timeData1 = "000000000000100000000000000000"; // 슬롯 12가 1
        String timeData2 = "000000000000000000000000000000"; // 슬롯 12가 0
        String timeData3 = "000000000000100000000000000000"; // 슬롯 12가 1
        
        Availability availability1 = Availability.builder()
                .roomUser(roomUser1)
                .date(testDate)
                .timeData(timeData1)
                .build();
        
        Availability availability2 = Availability.builder()
                .roomUser(roomUser2)
                .date(testDate)
                .timeData(timeData2)
                .build();
        
        Availability availability3 = Availability.builder()
                .roomUser(roomUser3)
                .date(testDate)
                .timeData(timeData3)
                .build();
        
        availabilityRepository.saveAll(List.of(availability1, availability2, availability3));
        
        // when
        List<AvailabilityResponseDto.ConfirmedUsersResponse.UserInfo> selectedUsers = 
            availabilityService.getSelectedUsers(testRoom.getRoomId(), testDate, 12);
        
        // then
        assertThat(selectedUsers).hasSize(2);
        assertThat(selectedUsers)
                .extracting("nickname")
                .containsExactlyInAnyOrder("사용자1", "사용자3");
        
        assertThat(selectedUsers)
                .extracting("profileImage")
                .containsExactlyInAnyOrder("https://example.com/profile1.jpg", "https://example.com/profile3.jpg");
    }
    
    @Test
    @DisplayName("선택한 사용자가 없으면 빈 리스트를 반환한다")
    void getSelectedUsers_선택자없음_빈리스트반환() {
        // given
        // 모든 사용자가 슬롯 12에서 선택하지 않음
        String timeData = "000000000000000000000000000000"; // 슬롯 12가 0
        
        Availability availability = Availability.builder()
                .roomUser(roomUser1)
                .date(testDate)
                .timeData(timeData)
                .build();
        
        availabilityRepository.save(availability);
        
        // when
        List<AvailabilityResponseDto.ConfirmedUsersResponse.UserInfo> selectedUsers = 
            availabilityService.getSelectedUsers(testRoom.getRoomId(), testDate, 12);
        
        // then
        assertThat(selectedUsers).isEmpty();
    }
    
    @Test
    @DisplayName("다른 날짜의 데이터는 조회되지 않는다")
    void getSelectedUsers_다른날짜_조회안됨() {
        // given
        LocalDate otherDate = LocalDate.of(2025, 1, 16);
        String timeData = "000000000000100000000000000000"; // 슬롯 12가 1
        
        Availability availability = Availability.builder()
                .roomUser(roomUser1)
                .date(otherDate) // 다른 날짜
                .timeData(timeData)
                .build();
        
        availabilityRepository.save(availability);
        
        // when
        List<AvailabilityResponseDto.ConfirmedUsersResponse.UserInfo> selectedUsers = 
            availabilityService.getSelectedUsers(testRoom.getRoomId(), testDate, 12);
        
        // then
        assertThat(selectedUsers).isEmpty();
    }
    
    @Test
    @DisplayName("다른 룸의 데이터는 조회되지 않는다")
    void getSelectedUsers_다른룸_조회안됨() {
        // given
        Room otherRoom = Room.builder()
                .roomId(999L)
                .roomTitle("다른 룸")
                .roomState(Room.RoomState.ACTIVE)
                .inviteCode(54321)
                .build();
        
        RoomUser otherRoomUser = RoomUser.builder()
                .roomUserId(999L)
                .room(otherRoom)
                .user(testUser1)
                .nickname("다른룸사용자")
                .isAgreed(true)
                .build();
        
        String timeData = "000000000000100000000000000000"; // 슬롯 12가 1
        
        Availability availability = Availability.builder()
                .roomUser(otherRoomUser) // 다른 룸
                .date(testDate)
                .timeData(timeData)
                .build();
        
        availabilityRepository.save(availability);
        
        // when
        List<AvailabilityResponseDto.ConfirmedUsersResponse.UserInfo> selectedUsers = 
            availabilityService.getSelectedUsers(testRoom.getRoomId(), testDate, 12);
        
        // then
        assertThat(selectedUsers).isEmpty();
    }
    
    @Test
    @DisplayName("모든 슬롯에서 선택한 사용자들을 조회할 수 있다")
    void getSelectedUsers_모든슬롯_테스트() {
        // given
        // 각 사용자가 다른 슬롯에서 선택
        String timeData1 = "100000000000000000000000000000"; // 슬롯 0에서 선택
        String timeData2 = "000000000000100000000000000000"; // 슬롯 12에서 선택
        String timeData3 = "000000000000000000000000000001"; // 슬롯 29에서 선택
        
        Availability availability1 = Availability.builder()
                .roomUser(roomUser1)
                .date(testDate)
                .timeData(timeData1)
                .build();
        
        Availability availability2 = Availability.builder()
                .roomUser(roomUser2)
                .date(testDate)
                .timeData(timeData2)
                .build();
        
        Availability availability3 = Availability.builder()
                .roomUser(roomUser3)
                .date(testDate)
                .timeData(timeData3)
                .build();
        
        availabilityRepository.saveAll(List.of(availability1, availability2, availability3));
        
        // when & then
        // 슬롯 0에서 선택한 사용자
        List<AvailabilityResponseDto.ConfirmedUsersResponse.UserInfo> slot0Users = 
            availabilityService.getSelectedUsers(testRoom.getRoomId(), testDate, 0);
        assertThat(slot0Users).hasSize(1);
        assertThat(slot0Users.get(0).getNickname()).isEqualTo("사용자1");
        
        // 슬롯 12에서 선택한 사용자
        List<AvailabilityResponseDto.ConfirmedUsersResponse.UserInfo> slot12Users = 
            availabilityService.getSelectedUsers(testRoom.getRoomId(), testDate, 12);
        assertThat(slot12Users).hasSize(1);
        assertThat(slot12Users.get(0).getNickname()).isEqualTo("사용자2");
        
        // 슬롯 29에서 선택한 사용자
        List<AvailabilityResponseDto.ConfirmedUsersResponse.UserInfo> slot29Users = 
            availabilityService.getSelectedUsers(testRoom.getRoomId(), testDate, 29);
        assertThat(slot29Users).hasSize(1);
        assertThat(slot29Users.get(0).getNickname()).isEqualTo("사용자3");
    }
    
    @Test
    @DisplayName("프로필 이미지가 null인 사용자도 정상적으로 조회된다")
    void getSelectedUsers_프로필이미지null_정상조회() {
        // given
        String timeData = "000000000000100000000000000000"; // 슬롯 12가 1
        
        Availability availability = Availability.builder()
                .roomUser(roomUser2) // profileImage가 null인 사용자
                .date(testDate)
                .timeData(timeData)
                .build();
        
        availabilityRepository.save(availability);
        
        // when
        List<AvailabilityResponseDto.ConfirmedUsersResponse.UserInfo> selectedUsers = 
            availabilityService.getSelectedUsers(testRoom.getRoomId(), testDate, 12);
        
        // then
        assertThat(selectedUsers).hasSize(1);
        assertThat(selectedUsers.get(0).getNickname()).isEqualTo("사용자2");
        assertThat(selectedUsers.get(0).getProfileImage()).isNull();
    }
} 