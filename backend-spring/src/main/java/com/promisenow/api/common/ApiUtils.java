package com.promisenow.api.common;

import lombok.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

/**
 * API 공통 응답 유틸리티
 */
public class ApiUtils {
    
    // 성공: 데이터 있는 경우
    public static <T> ResponseEntity<ApiResponse<T>> success(T data) {
        return ResponseEntity.ok(new ApiResponse<>(true, data, null));
    }
    
    // 성공: 데이터 없는 경우 (Unit)
    public static ResponseEntity<ApiResponse<Unit>> success() {
        return ResponseEntity.ok(new ApiResponse<>(true, Unit.INSTANCE, null));
    }
    
    // 에러: 메시지 포함
    public static ResponseEntity<ApiResponse<Void>> error(String message) {
        return ResponseEntity.badRequest().body(new ApiResponse<>(false, null, message));
    }
    
    // 에러: 상태 코드와 메시지 포함
    public static ResponseEntity<ApiResponse<Void>> error(HttpStatus status, String message) {
        return ResponseEntity.status(status).body(new ApiResponse<>(false, null, message));
    }
    
    /**
     * API 응답 DTO
     */
    @Getter
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class ApiResponse<T> {
        private boolean success;
        private T data;
        private String message;
    }
    
    /**
     * 명시적 "빈" 응답을 표현하는 단일 인스턴스 클래스
     */
    public static final class Unit {
        public static final Unit INSTANCE = new Unit();
        private Unit() {}
    }
}
