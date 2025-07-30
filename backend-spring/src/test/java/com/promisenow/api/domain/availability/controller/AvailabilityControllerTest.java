package com.promisenow.api.domain.availability.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.promisenow.api.domain.availability.entity.Availability;
import com.promisenow.api.domain.availability.service.AvailabilityService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.hamcrest.Matchers.containsString;

@WebMvcTest(AvailabilityController.class)
@TestPropertySource(properties = {
    "spring.autoconfigure.exclude=org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration"
})
class AvailabilityControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private AvailabilityService availabilityService;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @DisplayName("내 일정 조회 API 테스트")
    void getMyAvailability_ShouldReturnUserAvailability() throws Exception {
        // given
        Long roomUserId = 1L;
        List<Availability> availabilities = Arrays.asList(
                Availability.builder()
                        .date(LocalDate.of(2025, 1, 15))
                        .timeData("111100001111000011110000111100")
                        .build(),
                Availability.builder()
                        .date(LocalDate.of(2025, 1, 16))
                        .timeData("000011110000111100001111000011")
                        .build()
        );
        
        when(availabilityService.getMyAvailability(roomUserId)).thenReturn(availabilities);

        // when & then
        mockMvc.perform(get("/api/availability/me")
                        .param("roomUserId", roomUserId.toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.availabilities").exists())
                .andExpect(jsonPath("$.data.availabilities", hasSize(2)));
    }

    @Test
    @DisplayName("전체 누적 데이터 조회 API 테스트")
    void getTotalAvailability_ShouldReturnAccumulatedData() throws Exception {
        // given
        Long roomId = 1L;
        List<Availability> availabilities = Arrays.asList(
                Availability.builder()
                        .date(LocalDate.of(2025, 1, 15))
                        .timeData("111100001111000011110000111100")
                        .build(),
                Availability.builder()
                        .date(LocalDate.of(2025, 1, 16))
                        .timeData("000011110000111100001111000011")
                        .build()
        );
        
        when(availabilityService.getTotalAvailability(roomId)).thenReturn(availabilities);

        // when & then
        mockMvc.perform(get("/api/availability/total")
                        .param("roomId", roomId.toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.totalDatas").exists());
    }

    @Test
    @DisplayName("특정 시간대 선택자 조회 API 테스트")
    void getConfirmedUsers_ShouldReturnSelectedUsers() throws Exception {
        // given
        Long roomId = 1L;
        LocalDate date = LocalDate.of(2025, 1, 15);
        int slot = 12;
        
        List<Availability> availabilities = Arrays.asList(
                Availability.builder()
                        .date(date)
                        .timeData("111100001111000011110000111100")
                        .build()
        );
        
        when(availabilityService.getSelectedUsers(eq(roomId), eq(date), eq(slot)))
                .thenReturn(availabilities);

        // when & then
        mockMvc.perform(get("/api/availability/confirmed-users")
                        .param("roomId", roomId.toString())
                        .param("date", "2025-01-15")
                        .param("slot", String.valueOf(slot)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.confirmedUserList").exists());
    }

    @Test
    @DisplayName("룸 사용자 ID 목록 조회 API 테스트")
    void getRoomUserIds_ShouldReturnRoomUserIds() throws Exception {
        // given
        Long roomId = 1L;
        List<Long> roomUserIds = Arrays.asList(1L, 2L, 3L, 4L);
        
        when(availabilityService.getRoomUserIds(roomId)).thenReturn(roomUserIds);

        // when & then
        mockMvc.perform(get("/api/availability/room-users")
                        .param("roomId", roomId.toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.roomUserIds").exists())
                .andExpect(jsonPath("$.data.roomUserIds").isArray())
                .andExpect(jsonPath("$.data.roomUserIds[0]").value(1))
                .andExpect(jsonPath("$.data.roomUserIds[1]").value(2))
                .andExpect(jsonPath("$.data.roomUserIds[2]").value(3))
                .andExpect(jsonPath("$.data.roomUserIds[3]").value(4));
    }

    @Test
    @DisplayName("일정 저장 API 테스트")
    void saveAvailability_ShouldSaveSuccessfully() throws Exception {
        // given
        Long roomUserId = 1L;
        String date = "2025-01-15";
        String timeData = "111100001111000011110000111100";

        // when & then
        mockMvc.perform(post("/api/availability/save")
                        .param("roomUserId", roomUserId.toString())
                        .param("date", date)
                        .param("timeData", timeData))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @DisplayName("잘못된 파라미터로 API 호출 시 400 에러 테스트")
    void invalidParameters_ShouldReturnBadRequest() throws Exception {
        // when & then
        mockMvc.perform(get("/api/availability/me"))
                .andExpect(status().isBadRequest());
    }
    
    @Test
    @DisplayName("일정 배치 업데이트 API 테스트")
    void batchUpdateAvailability_ShouldUpdateMultipleDates() throws Exception {
        // given
        String requestBody = """
                {
                    "roomUserId": 1,
                    "updatedDataList": [
                        {
                            "date": "2025-01-15",
                            "timeData": "111100001111000011110000111100"
                        },
                        {
                            "date": "2025-01-16",
                            "timeData": "000011110000111100001111000011"
                        }
                    ]
                }
                """;
        
        // when & then
        mockMvc.perform(put("/api/availability/batch-update")
                        .contentType("application/json")
                        .content(requestBody))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }
    
    @Test
    @DisplayName("timeData 30자리 검증 테스트")
    void timeDataValidation_ShouldFailWithInvalidLength() throws Exception {
        // given - 29자리 timeData (30자리가 아님)
        String requestBody = """
                {
                    "roomUserId": 1,
                    "updatedDataList": [
                        {
                            "date": "2025-01-15",
                            "timeData": "11110000111100001111000011110"
                        }
                    ]
                }
                """;
        
        // when & then
        mockMvc.perform(put("/api/availability/batch-update")
                        .contentType("application/json")
                        .content(requestBody))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value(containsString("timeData는 정확히 30자리여야 합니다")));
    }
    
    @Test
    @DisplayName("timeData 0과 1만 허용 검증 테스트")
    void timeDataValidation_ShouldFailWithInvalidCharacters() throws Exception {
        // given - 2가 포함된 timeData
        String requestBody = """
                {
                    "roomUserId": 1,
                    "updatedDataList": [
                        {
                            "date": "2025-01-15",
                            "timeData": "111100001111000011110000111102"
                        }
                    ]
                }
                """;
        
        // when & then
        mockMvc.perform(put("/api/availability/batch-update")
                        .contentType("application/json")
                        .content(requestBody))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value(containsString("timeData는 0과 1만 포함할 수 있습니다")));
    }
    
    @Test
    @DisplayName("필수 파라미터 검증 테스트")
    void requiredParameterValidation_ShouldFailWithMissingParameters() throws Exception {
        // when & then - roomUserId 누락
        mockMvc.perform(get("/api/availability/me"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value(containsString("roomUserId는 필수입니다")));
    }
    
    @Test
    @DisplayName("단일 일정 저장 timeData 검증 테스트")
    void saveAvailabilityTimeDataValidation_ShouldFailWithInvalidData() throws Exception {
        // when & then - 29자리 timeData
        mockMvc.perform(post("/api/availability/save")
                        .param("roomUserId", "1")
                        .param("date", "2025-01-15")
                        .param("timeData", "11110000111100001111000011110"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value(containsString("timeData는 정확히 30자리여야 합니다")));
    }
} 