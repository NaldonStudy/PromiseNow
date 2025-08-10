package com.promisenow.api.infrastructure.file.exception;

import com.promisenow.api.common.ErrorMessage;
import lombok.Getter;

/**
 * 파일 업로드 관련 예외 클래스
 */
@Getter
public class FileUploadException extends RuntimeException {
    
    private final ErrorMessage errorMessage;
    private final int statusCode;
    
    public FileUploadException(ErrorMessage errorMessage) {
        super(errorMessage.getMessage());
        this.errorMessage = errorMessage;
        this.statusCode = errorMessage.getStatus();
    }
    
    public FileUploadException(ErrorMessage errorMessage, Throwable cause) {
        super(errorMessage.getMessage(), cause);
        this.errorMessage = errorMessage;
        this.statusCode = errorMessage.getStatus();
    }
    
    public FileUploadException(String message, int statusCode) {
        super(message);
        this.errorMessage = new ErrorMessage(message, statusCode);
        this.statusCode = statusCode;
    }
    
    public FileUploadException(String message, int statusCode, Throwable cause) {
        super(message, cause);
        this.errorMessage = new ErrorMessage(message, statusCode);
        this.statusCode = statusCode;
    }
}
