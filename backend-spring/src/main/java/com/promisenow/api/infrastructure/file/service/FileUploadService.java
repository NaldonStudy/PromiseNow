package com.promisenow.api.infrastructure.file.service;

import com.promisenow.api.infrastructure.file.dto.FileUploadRequest;
import com.promisenow.api.infrastructure.file.dto.FileUploadResponse;

/**
 * 파일 업로드를 위한 서비스 인터페이스
 */
public interface FileUploadService {
    
    /**
     * 파일을 업로드하고 응답을 반환합니다.
     * 
     * @param request 파일 업로드 요청
     * @param fileType 파일 타입 (chat, profile 등)
     * @return 파일 업로드 응답
     */
    FileUploadResponse uploadFile(FileUploadRequest request, String fileType);
    
    /**
     * 파일을 업로드하고 URL만 반환합니다.
     * 
     * @param request 파일 업로드 요청
     * @param fileType 파일 타입 (chat, profile 등)
     * @return 업로드된 파일 URL
     */
    String uploadFileAndGetUrl(FileUploadRequest request, String fileType);
}
