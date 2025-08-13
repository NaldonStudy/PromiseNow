package com.promisenow.api.domain.user.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TokenInfoDebugResponseDto {
    private Long userId;
    private String email;
    private String nickname;
    private String message;
}
