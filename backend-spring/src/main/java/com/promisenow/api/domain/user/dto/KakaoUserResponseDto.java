package com.promisenow.api.domain.user.dto;

import com.promisenow.api.domain.user.entity.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class KakaoUserResponseDto {

    private Long id; // 카카오 사용자 고유 ID
    private LocalDate joinDate; // 가입 날짜

    public KakaoUserResponseDto(User user) {
        this.id = user.getUserId();
        this.joinDate = user.getJoinDate();
    }
}
