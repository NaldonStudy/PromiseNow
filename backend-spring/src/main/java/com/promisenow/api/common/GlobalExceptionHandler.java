package com.promisenow.api.common;

import com.promisenow.api.infrastructure.file.exception.FileUploadException;
import com.promisenow.api.domain.chat.exception.FileStorageException;
import com.promisenow.api.infrastructure.webhook.WebhookService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import jakarta.servlet.http.HttpServletRequest;
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
@RequiredArgsConstructor
public class GlobalExceptionHandler {
    
    private final WebhookService webhookService;
    
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
        
        // 핸들링된 예외 웹훅 전송
        sendHandledExceptionWebhook("MethodArgumentNotValidException", errorMessage);
        
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
        
        // 핸들링된 예외 웹훅 전송
        sendHandledExceptionWebhook("ConstraintViolationException", errorMessage);
        
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
        
        // 핸들링된 예외 웹훅 전송
        sendHandledExceptionWebhook("MethodArgumentTypeMismatchException", errorMessage);
        
        return ApiUtils.error(HttpStatus.BAD_REQUEST, errorMessage);
    }
    
    /**
     * IllegalArgumentException 처리
     */
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiUtils.ApiResponse<Void>> handleIllegalArgumentException(IllegalArgumentException ex) {
        log.warn("Illegal argument: {}", ex.getMessage());
        
        // 핸들링된 예외 웹훅 전송
        sendHandledExceptionWebhook("IllegalArgumentException", ex.getMessage());
        
        return ApiUtils.error(HttpStatus.BAD_REQUEST, ex.getMessage());
    }
    
    /**
     * 데이터베이스 제약조건 위반 예외 처리
     */
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ApiUtils.ApiResponse<Void>> handleDataIntegrityViolation(DataIntegrityViolationException ex) {
        log.error("Data integrity violation: {}", ex.getMessage());
        
        // 웹훅 알림 전송 (데이터베이스 오류는 별도 처리)
        try {
            String errorMessage = ex.getMessage();
            String sqlStatement = extractSqlStatement(ex);
            String constraintInfo = extractConstraintInfo(ex);
            
            webhookService.sendDatabaseConstraintError(errorMessage, sqlStatement, constraintInfo);
        } catch (Exception webhookEx) {
            log.error("웹훅 전송 실패: {}", webhookEx.getMessage());
        }
        
        return ApiUtils.error(HttpStatus.CONFLICT, "데이터 무결성 제약조건 위반");
    }
    
    /**
     * 기타 예외 처리 (핸들링되지 않은 예외)
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiUtils.ApiResponse<Void>> handleGenericException(Exception ex) {
        log.error("Unexpected error occurred", ex);
        
        // 핸들링되지 않은 예외 웹훅 전송
        try {
            webhookService.sendUnhandledExceptionNotification(
                ex.getClass().getSimpleName(), 
                ex.getMessage(), 
                getStackTrace(ex)
            );
        } catch (Exception webhookEx) {
            log.error("웹훅 전송 실패: {}", webhookEx.getMessage());
        }
        
        return ApiUtils.error(HttpStatus.INTERNAL_SERVER_ERROR, "서버 내부 오류가 발생했습니다.");
    }
    
    /**
     * 파일 업로드 오류
     */
    @ExceptionHandler(FileUploadException.class)
    public ResponseEntity<ApiUtils.ApiResponse<Void>> handleFileUploadException(FileUploadException ex) {
        log.warn("File upload error: {}", ex.getMessage());
        
        // 핸들링된 예외 웹훅 전송
        sendHandledExceptionWebhook("FileUploadException", ex.getMessage());
        
        return ApiUtils.error(HttpStatus.valueOf(ex.getStatusCode()), ex.getMessage());
    }
    
    /**
     * 이미지 저장 오류
     */
    @ExceptionHandler(FileStorageException.class)
    public ResponseEntity<ApiUtils.ApiResponse<Void>>handleFileStorageException(FileStorageException ex) {
        log.warn("File storage error: {}", ex.getMessage());
        
        // 핸들링된 예외 웹훅 전송
        sendHandledExceptionWebhook("FileStorageException", ex.getMessage());
        
        return ApiUtils.error(HttpStatus.BAD_REQUEST, ex.getMessage());
    }
    
    /**
     * 핸들링된 예외 웹훅 전송 헬퍼 메서드
     */
    private void sendHandledExceptionWebhook(String exceptionType, String errorMessage) {
        try {
            String endpoint = getCurrentEndpoint();
            String userInfo = getCurrentUserInfo();
            
            webhookService.sendHandledExceptionNotification(exceptionType, errorMessage, endpoint, userInfo);
        } catch (Exception webhookEx) {
            log.error("핸들링된 예외 웹훅 전송 실패: {}", webhookEx.getMessage());
        }
    }
    
    /**
     * 현재 요청 엔드포인트 정보 추출
     */
    private String getCurrentEndpoint() {
        try {
            ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attributes != null) {
                HttpServletRequest request = attributes.getRequest();
                return request.getMethod() + " " + request.getRequestURI();
            }
        } catch (Exception e) {
            log.debug("엔드포인트 정보 추출 실패: {}", e.getMessage());
        }
        return "알 수 없음";
    }
    
    /**
     * 현재 사용자 정보 추출
     */
    private String getCurrentUserInfo() {
        try {
            ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attributes != null) {
                HttpServletRequest request = attributes.getRequest();
                String userAgent = request.getHeader("User-Agent");
                String remoteAddr = request.getRemoteAddr();
                
                if (userAgent != null && userAgent.contains("Mozilla")) {
                    return "웹 브라우저 (" + remoteAddr + ")";
                } else if (userAgent != null && userAgent.contains("Postman")) {
                    return "Postman (" + remoteAddr + ")";
                } else {
                    return "API 클라이언트 (" + remoteAddr + ")";
                }
            }
        } catch (Exception e) {
            log.debug("사용자 정보 추출 실패: {}", e.getMessage());
        }
        return "알 수 없음";
    }
    
    /**
     * SQL 문 추출
     */
    private String extractSqlStatement(DataIntegrityViolationException ex) {
        String message = ex.getMessage();
        if (message != null && message.contains("could not execute statement")) {
            int start = message.indexOf("[");
            int end = message.indexOf("]");
            if (start != -1 && end != -1 && start < end) {
                return message.substring(start + 1, end);
            }
        }
        return null;
    }
    
    /**
     * 제약조건 정보 추출
     */
    private String extractConstraintInfo(DataIntegrityViolationException ex) {
        String message = ex.getMessage();
        if (message != null && message.contains("FOREIGN KEY")) {
            int start = message.indexOf("CONSTRAINT `");
            if (start != -1) {
                int end = message.indexOf("`", start + 12);
                if (end != -1) {
                    return message.substring(start + 12, end);
                }
            }
        }
        return null;
    }
    
    /**
     * 스택 트레이스 추출 (최대 10줄)
     */
    private String getStackTrace(Exception ex) {
        StackTraceElement[] stackTrace = ex.getStackTrace();
        StringBuilder sb = new StringBuilder();
        
        int maxLines = Math.min(10, stackTrace.length);
        for (int i = 0; i < maxLines; i++) {
            sb.append(stackTrace[i].toString()).append("\n");
        }
        
        return sb.toString();
    }
} 