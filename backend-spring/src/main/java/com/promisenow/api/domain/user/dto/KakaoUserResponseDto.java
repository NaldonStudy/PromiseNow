package com.promisenow.api.domain.user.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.Map;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class KakaoUserResponseDto {

    private Long id; // 카카오 사용자 고유 ID
    private Map<String, String> properties; // 가입 날짜
}
