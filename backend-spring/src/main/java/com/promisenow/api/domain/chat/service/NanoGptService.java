// NanoGptService.java
package com.promisenow.api.domain.chat.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.*;

@Service
public class NanoGptService {
    private static final String ENDPOINT = "https://gms.ssafy.io/gmsapi/api.openai.com/v1/chat/completions";
    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    // 반드시 환경변수에서 안전하게 GMS_KEY 불러오기!
    @Value("${gms.key}")
    private String gmsKey;

    public String generateGptReply(String userMessage) throws Exception {
        Map<String, Object> body = new HashMap<>();
        body.put("model", "gpt-4.1-nano");
        body.put("max_tokens", 4096);
        body.put("temperature", 0.3);

        List<Map<String, String>> messages = new ArrayList<>();
        messages.add(Map.of("role", "system", "content", "Answer in Korean, 30자 이내, 센스있게"));
        messages.add(Map.of("role", "user", "content", userMessage));
        body.put("messages", messages);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(gmsKey);

        HttpEntity<String> request = new HttpEntity<>(objectMapper.writeValueAsString(body), headers);
        ResponseEntity<Map> response = restTemplate.exchange(ENDPOINT, HttpMethod.POST, request, Map.class);

        List<Map<String, Object>> choices = (List<Map<String, Object>>) response.getBody().get("choices");
        String result = (String) ((Map)choices.get(0).get("message")).get("content");
        return result;
    }
}
