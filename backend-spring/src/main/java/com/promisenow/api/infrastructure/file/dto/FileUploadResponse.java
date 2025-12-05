package com.promisenow.api.infrastructure.file.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;

/**
 * 파일 업로드 응답을 위한 DTO
 */
@Getter
@Setter
@Schema(description = "파일 업로드 응답 DTO")
public class FileUploadResponse {
    
    @Schema(description = "업로드된 파일 URL", example = "https://api.promisenow.store/uploaded-images/chat/1754802391451_chat.png")
    private String fileUrl;
    
    @Schema(description = "파일명", example = "1754802391451_chat.png")
    private String fileName;
    
    @Schema(description = "파일 크기 (바이트)", example = "1024000")
    private Long fileSize;
    
    @Schema(description = "파일 타입", example = "image/png")
    private String fileType;
    
    public FileUploadResponse() {}
    
    public FileUploadResponse(String fileUrl) {
        this.fileUrl = fileUrl;
    }
    
    public FileUploadResponse(String fileUrl, String fileName, Long fileSize, String fileType) {
        this.fileUrl = fileUrl;
        this.fileName = fileName;
        this.fileSize = fileSize;
        this.fileType = fileType;
    }
}
