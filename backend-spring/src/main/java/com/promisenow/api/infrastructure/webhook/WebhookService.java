package com.promisenow.api.infrastructure.webhook;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;

/**
 * 슬랙 웹훅 알림 서비스
 * 예외 레벨과 심각도에 따라 차별화된 알림 제공
 */
@Slf4j
@Service
public class WebhookService {

    @Value("${webhook.slack.url}")
    private String slackWebhookUrl;

    @Value("${webhook.enable.handled-exceptions:false}")
    private boolean enableHandledExceptions;

    @Value("${webhook.enable.unhandled-exceptions:true}")
    private boolean enableUnhandledExceptions;

    private final RestTemplate restTemplate = new RestTemplate();

    /**
     * 예외 심각도 레벨
     */
    public enum SeverityLevel {
        LOW("🔵", "낮음"),
        MEDIUM("🟡", "보통"),
        HIGH("🟠", "높음"),
        CRITICAL("🔴", "치명적");

        private final String emoji;
        private final String koreanName;

        SeverityLevel(String emoji, String koreanName) {
            this.emoji = emoji;
            this.koreanName = koreanName;
        }

        public String getEmoji() { return emoji; }
        public String getKoreanName() { return koreanName; }
    }

    /**
     * 핸들링된 예외 알림 (정상적으로 처리된 예외)
     */
    public void sendHandledExceptionNotification(String exceptionType, String errorMessage, String endpoint, String userInfo) {
        if (!enableHandledExceptions) {
            log.debug("핸들링된 예외 웹훅이 비활성화되어 있습니다: {}", exceptionType);
            return;
        }

        String message = buildHandledExceptionMessage(exceptionType, errorMessage, endpoint, userInfo);
        sendSlackMessage(message, SeverityLevel.LOW);
    }

    /**
     * 핸들링되지 않은 예외 알림 (서버 오류)
     */
    public void sendUnhandledExceptionNotification(String exceptionType, String errorMessage, String stackTrace) {
        if (!enableUnhandledExceptions) {
            log.debug("핸들링되지 않은 예외 웹훅이 비활성화되어 있습니다: {}", exceptionType);
            return;
        }

        String message = buildUnhandledExceptionMessage(exceptionType, errorMessage, stackTrace);
        sendSlackMessage(message, SeverityLevel.HIGH);
    }

    /**
     * 데이터베이스 제약조건 오류 알림 전송
     */
    public void sendDatabaseConstraintError(String errorMessage, String sqlStatement, String constraintInfo) {
        String message = buildDatabaseErrorMessage(errorMessage, sqlStatement, constraintInfo);
        sendSlackMessage(message, SeverityLevel.MEDIUM);
    }

    /**
     * 시스템 상태 알림 (서버 시작, 종료 등)
     */
    public void sendSystemNotification(String title, String message, SeverityLevel severity) {
        String formattedMessage = buildSystemMessage(title, message, severity);
        sendSlackMessage(formattedMessage, severity);
    }

    /**
     * 슬랙 메시지 전송
     */
    private void sendSlackMessage(String message, SeverityLevel severity) {
        try {
            Map<String, Object> payload = new HashMap<>();
            
            // 심각도 정보를 메시지에 추가
            String fullMessage = message + "\n\n" + 
                String.format("*심각도:* %s %s | *서버:* `i13b107`", 
                    severity.getEmoji(), severity.getKoreanName());
            
            payload.put("text", fullMessage);
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(payload, headers);
            
            restTemplate.postForEntity(slackWebhookUrl, request, String.class);
            
            log.info("웹훅 알림 전송 완료 - 심각도: {}", severity.getKoreanName());
        } catch (Exception e) {
            log.error("웹훅 알림 전송 실패: {}", e.getMessage());
        }
    }

    /**
     * 핸들링된 예외 메시지 구성
     */
    private String buildHandledExceptionMessage(String exceptionType, String errorMessage, String endpoint, String userInfo) {
        return String.format("%s *핸들링된 예외 발생*\n\n" +
                "*📍 요청 정보*\n" +
                "• 엔드포인트: `%s`\n" +
                "• 사용자: %s\n\n" +
                "*오류 메시지*\n" +
                "```%s```\n\n" +
                "*ℹ️ 처리 상태*\n" +
                "• ✅ 정상적으로 핸들링됨\n" +
                "• 🔄 클라이언트에게 적절한 응답 전송",
                SeverityLevel.LOW.getEmoji(), endpoint, userInfo, errorMessage);
    }

    /**
     * 핸들링되지 않은 예외 메시지 구성
     */
    private String buildUnhandledExceptionMessage(String exceptionType, String errorMessage, String stackTrace) {
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
        
        return String.format("%s *핸들링되지 않은 예외 발생*\n\n" +
                "*📊 시스템 정보*\n" +
                "• 시간: %s\n" +
                "• 컨테이너: spring-api\n" +
                "• 이미지: promisenow-backend-new\n" +
                "• 서버: `i13b107`\n\n" +
                "*오류 내용*\n" +
                "```%s```\n\n" +
                "*스택 트레이스*\n" +
                "```%s```\n\n" +
                "*🚨 긴급 조치 필요*\n" +
                "• 🔍 즉시 원인 분석 필요\n" +
                "• 🛠️ 코드 수정 또는 설정 변경 필요\n\n" +
                "*🔍 확인 방법*\n" +
                "```docker logs spring-api --tail 20```\n\n" +
                "*🔗 관련 링크*\n" +
                "• API 헬스체크: https://api.promisenow.store/actuator/health\n" +
                "• 웹사이트: https://promisenow.store",
                SeverityLevel.HIGH.getEmoji(), timestamp, errorMessage, stackTrace);
    }

    /**
     * 데이터베이스 오류 메시지 구성
     */
    private String buildDatabaseErrorMessage(String errorMessage, String sqlStatement, String constraintInfo) {
        StringBuilder message = new StringBuilder();
        message.append(SeverityLevel.MEDIUM.getEmoji()).append(" *데이터베이스 제약조건 오류*\n\n");
        
        message.append("*🔍 루트 원인*\n");
        message.append("```").append(errorMessage).append("```\n\n");
        
        if (sqlStatement != null && !sqlStatement.isEmpty()) {
            message.append("*🗄️ SQL 문*\n");
            message.append("```sql\n").append(sqlStatement).append("```\n\n");
        }
        
        if (constraintInfo != null && !constraintInfo.isEmpty()) {
            message.append("*🔗 제약조건 정보*\n");
            message.append("• 제약조건: `").append(constraintInfo).append("`\n");
            message.append("• 문제: 부모 레코드 삭제 시 자식 레코드가 존재함\n\n");
            
            message.append("*💡 해결 방법*\n");
            message.append("• 자식 테이블에서 해당 레코드 먼저 삭제\n");
            message.append("• 또는 CASCADE 옵션 설정으로 자동 삭제\n");
        }
        
        return message.toString();
    }

    /**
     * 시스템 메시지 구성
     */
    private String buildSystemMessage(String title, String message, SeverityLevel severity) {
        return String.format("%s *%s*\n\n" +
                "*메시지*\n" +
                "```%s```",
                severity.getEmoji(), title, message);
    }
} 