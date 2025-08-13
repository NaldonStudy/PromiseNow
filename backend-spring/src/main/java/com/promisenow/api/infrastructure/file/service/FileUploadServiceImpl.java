package com.promisenow.api.infrastructure.file.service;

import com.promisenow.api.common.FileUploadConstants;
import com.promisenow.api.infrastructure.file.FileUploadUtils;
import com.promisenow.api.infrastructure.file.dto.FileUploadRequest;
import com.promisenow.api.infrastructure.file.dto.FileUploadResponse;
import com.promisenow.api.infrastructure.file.exception.FileUploadException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

/**
 * 파일 업로드를 위한 서비스 구현체
 */
@Service
@RequiredArgsConstructor
public class FileUploadServiceImpl implements FileUploadService {
    
    @Override
    public FileUploadResponse uploadFile(FileUploadRequest request, String fileType) {
        validateRequest(request);
        
        MultipartFile file = request.getFile();
        String uploadDir = getUploadDir(fileType);
        String urlPath = getUrlPath(fileType);
        
        String fileUrl = FileUploadUtils.uploadFile(file, uploadDir, fileType, urlPath);
        
        return new FileUploadResponse(
            fileUrl,
            file.getOriginalFilename(),
            file.getSize(),
            file.getContentType()
        );
    }
    
    @Override
    public String uploadFileAndGetUrl(FileUploadRequest request, String fileType) {
        validateRequest(request);
        
        MultipartFile file = request.getFile();
        String uploadDir = getUploadDir(fileType);
        String urlPath = getUrlPath(fileType);
        
        return FileUploadUtils.uploadFile(file, uploadDir, fileType, urlPath);
    }
    
    /**
     * 요청 유효성 검사
     */
    private void validateRequest(FileUploadRequest request) {
        if (request == null || request.getFile() == null) {
            throw new FileUploadException("파일 업로드 요청이 유효하지 않습니다.", 400);
        }
    }
    
    /**
     * 파일 타입에 따른 업로드 디렉토리 반환
     */
    private String getUploadDir(String fileType) {
        return switch (fileType) {
            case FileUploadConstants.FILE_TYPE_CHAT -> FileUploadConstants.UPLOAD_DIR_CHAT;
            case FileUploadConstants.FILE_TYPE_PROFILE -> FileUploadConstants.UPLOAD_DIR_PROFILE;
            default -> throw new FileUploadException("지원하지 않는 파일 타입입니다: " + fileType, 400);
        };
    }
    
    /**
     * 파일 타입에 따른 URL 경로 반환
     */
    private String getUrlPath(String fileType) {
        return switch (fileType) {
            case FileUploadConstants.FILE_TYPE_CHAT -> FileUploadConstants.URL_PATH_CHAT;
            case FileUploadConstants.FILE_TYPE_PROFILE -> FileUploadConstants.URL_PATH_PROFILE;
            default -> throw new FileUploadException("지원하지 않는 파일 타입입니다: " + fileType, 400);
        };
    }
}
