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
public class UserResponseDto {

    private Long id; // 카카오 사용자 고유 ID
    private LocalDate joinDate; // 가입 날짜

    public static UserResponseDto from(User user) {
        return UserResponseDto.builder()
                .id(user.getUserId())
                .joinDate(user.getJoinDate())
                .build();
    }

    public User toEntity() {
        return User.builder()
                .userId(this.id)
                .joinDate(this.joinDate != null ? this.joinDate : LocalDate.now())
                .build();
    }
}
