package com.promisenow.api.domain.chat.service;

import com.promisenow.api.common.ErrorMessage;
import com.promisenow.api.common.FileUploadConstants;
import com.promisenow.api.infrastructure.file.dto.FileUploadRequest;
import com.promisenow.api.infrastructure.file.exception.FileUploadException;
import com.promisenow.api.infrastructure.file.service.FileUploadService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
public class ChatImageServiceImpl implements ChatImageService {
    
    private final FileUploadService fileUploadService;
    
    @Override
    public String uploadImage(MultipartFile file, Double lat, Double lng, String sentDateStr) {
        validateCoordinates(lat, lng);
        
        FileUploadRequest request = new FileUploadRequest(file, lat, lng, sentDateStr);
        return fileUploadService.uploadFileAndGetUrl(request, FileUploadConstants.FILE_TYPE_CHAT);
    }
    
    /**
     * 좌표 유효성 검사
     */
    private void validateCoordinates(Double lat, Double lng) {
        if (lat == null || lng == null) {
            throw new FileUploadException(ErrorMessage.COORDINATES_REQUIRED, 400);
        }
    }
}

