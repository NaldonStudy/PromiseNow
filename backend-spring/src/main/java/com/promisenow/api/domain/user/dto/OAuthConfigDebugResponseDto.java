package com.promisenow.api.domain.user.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OAuthConfigDebugResponseDto {
    private String message;
    private Long timestamp;
    private String status;
}
