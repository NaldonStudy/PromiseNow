package com.promisenow.api.common;

import com.promisenow.api.domain.chat.exception.FileStorageException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;

/**
 * 전역 예외 처리기
 * Validation 예외와 기타 예외를 일관된 형식으로 처리
 */
@Slf4j
@RestControllerAdvice
public class    GlobalExceptionHandler {
    
    /**
     * @Valid 어노테이션으로 검증된 객체의 예외 처리
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiUtils.ApiResponse<Void>> handleValidationExceptions(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });
        
        String errorMessage = "입력 데이터 검증 실패: " + errors.toString();
        log.warn("Validation failed: {}", errorMessage);
        
        return ApiUtils.error(HttpStatus.BAD_REQUEST, errorMessage);
    }
    
    /**
     * @Validated 어노테이션으로 검증된 파라미터의 예외 처리
     */
    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ApiUtils.ApiResponse<Void>> handleConstraintViolation(ConstraintViolationException ex) {
        Set<ConstraintViolation<?>> violations = ex.getConstraintViolations();
        Map<String, String> errors = new HashMap<>();
        
        for (ConstraintViolation<?> violation : violations) {
            String fieldName = violation.getPropertyPath().toString();
            String errorMessage = violation.getMessage();
            errors.put(fieldName, errorMessage);
        }
        
        String errorMessage = "파라미터 검증 실패: " + errors.toString();
        log.warn("Constraint violation: {}", errorMessage);
        
        return ApiUtils.error(HttpStatus.BAD_REQUEST, errorMessage);
    }
    
    /**
     * 타입 변환 실패 예외 처리 (예: String -> Long)
     */
    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ApiUtils.ApiResponse<Void>> handleTypeMismatch(MethodArgumentTypeMismatchException ex) {
        String errorMessage = String.format("파라미터 타입 오류: %s는 %s 타입이어야 합니다.", 
                ex.getName(), ex.getRequiredType().getSimpleName());
        log.warn("Type mismatch: {}", errorMessage);
        
        return ApiUtils.error(HttpStatus.BAD_REQUEST, errorMessage);
    }
    
    /**
     * IllegalArgumentException 처리
     */
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiUtils.ApiResponse<Void>> handleIllegalArgumentException(IllegalArgumentException ex) {
        log.warn("Illegal argument: {}", ex.getMessage());
        return ApiUtils.error(HttpStatus.BAD_REQUEST, ex.getMessage());
    }
    
    /**
     * 기타 예외 처리
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiUtils.ApiResponse<Void>> handleGenericException(Exception ex) {
        log.error("Unexpected error occurred", ex);
        return ApiUtils.error(HttpStatus.INTERNAL_SERVER_ERROR, "서버 내부 오류가 발생했습니다.");
    }
    /**
     * 이미지 저장 오류
     */
    @ExceptionHandler(FileStorageException.class)
    public ResponseEntity<ApiUtils.ApiResponse<Void>>handleFileStorageException(FileStorageException ex) {
        log.warn("File storage error: {}", ex.getMessage());
        return ApiUtils.error(HttpStatus.BAD_REQUEST, ex.getMessage());
    }

} 