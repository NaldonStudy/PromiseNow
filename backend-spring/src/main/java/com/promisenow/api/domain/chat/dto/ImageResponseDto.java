package com.promisenow.api.domain.chat.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
@Getter
@Setter
@RequiredArgsConstructor
@Schema(description = "이미지 조회 응답 DTO")
public class ImageResponseDto {
    @Schema(description = "이미지 URL")
    private String imageUrl;

    @Schema(description = "위도")
    private Double lat;

    @Schema(description = "경도")
    private Double lng;

    @Schema(description = "타임스탬프")
    private LocalDateTime timestamp;

    public ImageResponseDto(String imageUrl, Double lat, Double lng, LocalDateTime timestamp) {
        this.imageUrl = imageUrl;
        this.lat = lat;
        this.lng = lng;
        this.timestamp = timestamp;
    }

    // getter/setter(필요시)
}
