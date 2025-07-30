package com.promisenow.api.domain.availability.controller;

import io.restassured.RestAssured;
import io.restassured.http.ContentType;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.*;

import com.promisenow.api.config.TestSecurityConfig;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
@Import(TestSecurityConfig.class)
@TestPropertySource(properties = {
    "spring.jpa.hibernate.ddl-auto=create-drop",
    "spring.jpa.defer-datasource-initialization=true",
    "spring.sql.init.mode=always",
    "spring.sql.init.data-locations=classpath:schema.sql"
})
class AvailabilityControllerIntegrationTest {

    @LocalServerPort
    private int port;

    @BeforeEach
    void setUp() {
        RestAssured.port = port;
        RestAssured.enableLoggingOfRequestAndResponseIfValidationFails();
    }

    @Test
    @DisplayName("내 일정 조회 API 통합 테스트")
    void getMyAvailability_ShouldReturnUserAvailability() {
        given()
                .contentType(ContentType.JSON)
                .param("roomUserId", 1L)
        .when()
                .get("/api/availability/me")
        .then()
                .statusCode(200)
                .body("success", equalTo(true))
                .body("data.availabilities", notNullValue())
                .body("data.availabilities", hasSize(greaterThanOrEqualTo(0)));
    }

    @Test
    @DisplayName("전체 누적 데이터 조회 API 통합 테스트")
    void getTotalAvailability_ShouldReturnAccumulatedData() {
        given()
                .contentType(ContentType.JSON)
                .param("roomId", 1L)
        .when()
                .get("/api/availability/total")
        .then()
                .statusCode(200)
                .body("success", equalTo(true))
                .body("data.totalDatas", notNullValue())
                .body("data.totalDatas", hasSize(greaterThanOrEqualTo(0)))
                .body("data.totalDatas[0].date", notNullValue())
                .body("data.totalDatas[0].timeData", notNullValue());
    }

    @Test
    @DisplayName("특정 시간대 선택자 조회 API 통합 테스트")
    void getConfirmedUsers_ShouldReturnSelectedUsers() {
        given()
                .contentType(ContentType.JSON)
                .param("roomId", 1L)
                .param("date", "2025-01-15")
                .param("slot", 12)
        .when()
                .get("/api/availability/confirmed-users")
        .then()
                .statusCode(200)
                .body("success", equalTo(true))
                .body("data.confirmedUserList", notNullValue());
    }

    @Test
    @DisplayName("룸 사용자 ID 목록 조회 API 통합 테스트")
    void getRoomUserIds_ShouldReturnRoomUserIds() {
        given()
                .contentType(ContentType.JSON)
                .param("roomId", 1L)
        .when()
                .get("/api/availability/room-users")
        .then()
                .statusCode(200)
                .body("success", equalTo(true))
                .body("data.roomUserIds", notNullValue());
    }

    @Test
    @DisplayName("일정 저장 API 통합 테스트")
    void saveAvailability_ShouldSaveSuccessfully() {
        given()
                .contentType(ContentType.URLENC)
                .param("roomUserId", 1L)
                .param("date", "2025-01-15")
                .param("timeData", "111100001111000011110000111100")
        .when()
                .post("/api/availability/save")
        .then()
                .statusCode(200)
                .body("success", equalTo(true))
                .body("message", equalTo("일정이 성공적으로 저장되었습니다."))
                .body("data.message", equalTo("일정이 성공적으로 저장되었습니다."));
    }

    @Test
    @DisplayName("잘못된 파라미터로 API 호출 시 400 에러 테스트")
    void invalidParameters_ShouldReturnBadRequest() {
        given()
                .contentType(ContentType.JSON)
        .when()
                .get("/api/availability/me")
        .then()
                .statusCode(400);
    }

    @Test
    @DisplayName("API 응답 구조 검증 테스트")
    void apiResponseStructure_ShouldBeConsistent() {
        given()
                .contentType(ContentType.JSON)
                .param("roomUserId", 1L)
        .when()
                .get("/api/availability/me")
        .then()
                .statusCode(200)
                .body("success", notNullValue())
                .body("data", notNullValue())
                .body("message", anyOf(nullValue(), notNullValue())); // message는 optional
    }
    
    @Test
    @DisplayName("전체 누적 데이터 - 특정 룸 ID 검증 테스트")
    void getTotalAvailability_WithSpecificRoomId_ShouldReturnCorrectData() {
        given()
                .contentType(ContentType.JSON)
                .param("roomId", 2L) // 룸 2 테스트
        .when()
                .get("/api/availability/total")
        .then()
                .statusCode(200)
                .body("success", equalTo(true))
                .body("data.totalDatas", notNullValue());
    }
    
    @Test
    @DisplayName("전체 누적 데이터 - 존재하지 않는 룸 ID 테스트")
    void getTotalAvailability_WithNonExistentRoomId_ShouldReturnEmptyData() {
        given()
                .contentType(ContentType.JSON)
                .param("roomId", 999L) // 존재하지 않는 룸 ID
        .when()
                .get("/api/availability/total")
        .then()
                .statusCode(200)
                .body("success", equalTo(true))
                .body("data.totalDatas", hasSize(0)); // 빈 배열 반환
    }
    
    @Test
    @DisplayName("일정 배치 업데이트 API 통합 테스트")
    void batchUpdateAvailability_ShouldUpdateMultipleDates() {
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
                        },
                        {
                            "date": "2025-01-17",
                            "timeData": "111111111111111111111111111111"
                        }
                    ]
                }
                """;
        
        // when & then
        given()
                .contentType(ContentType.JSON)
                .body(requestBody)
        .when()
                .put("/api/availability/batch-update")
        .then()
                .statusCode(200)
                .body("success", equalTo(true));
    }
    
    @Test
    @DisplayName("일정 배치 업데이트 - 잘못된 요청 테스트")
    void batchUpdateAvailability_WithInvalidRequest_ShouldReturnBadRequest() {
        // given - 잘못된 요청 (roomUserId 누락)
        String invalidRequestBody = """
                {
                    "updatedDataList": [
                        {
                            "date": "2025-01-15",
                            "timeData": "111100001111000011110000111100"
                        }
                    ]
                }
                """;
        
        // when & then
        given()
                .contentType(ContentType.JSON)
                .body(invalidRequestBody) 
        .when()
                .put("/api/availability/batch-update")
        .then()
                .statusCode(400);
    }
} 