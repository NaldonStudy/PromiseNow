package com.promisenow.api.infrastructure.file.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;
import org.springframework.web.multipart.MultipartFile;

/**
 * 파일 업로드 요청을 위한 DTO
 */
@Getter
@Setter
@Schema(description = "파일 업로드 요청 DTO")
public class FileUploadRequest {
    
    @Schema(description = "업로드할 파일", required = true)
    private MultipartFile file;
    
    @Schema(description = "위도 (선택사항)", example = "37.5665")
    private Double lat;
    
    @Schema(description = "경도 (선택사항)", example = "126.9780")
    private Double lng;
    
    @Schema(description = "전송 날짜 (선택사항)", example = "2025-01-07T10:30:00")
    private String sentDate;
    
    public FileUploadRequest() {}
    
    public FileUploadRequest(MultipartFile file) {
        this.file = file;
    }
    
    public FileUploadRequest(MultipartFile file, Double lat, Double lng) {
        this.file = file;
        this.lat = lat;
        this.lng = lng;
    }
    
    public FileUploadRequest(MultipartFile file, Double lat, Double lng, String sentDate) {
        this.file = file;
        this.lat = lat;
        this.lng = lng;
        this.sentDate = sentDate;
    }
}
