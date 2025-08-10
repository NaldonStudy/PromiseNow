package com.promisenow.api.common;

/**
 * 파일 업로드 관련 상수들을 관리하는 클래스
 */
public class FileUploadConstants {
    
    // 파일 타입
    public static final String FILE_TYPE_CHAT = "chat";
    public static final String FILE_TYPE_PROFILE = "profile";
    
    // 업로드 디렉토리
    public static final String UPLOAD_DIR_CHAT = "./uploaded-images/chat/";
    public static final String UPLOAD_DIR_PROFILE = "./uploaded-images/profile/";
    
    // URL 경로
    public static final String URL_PATH_CHAT = "/uploaded-images/chat/";
    public static final String URL_PATH_PROFILE = "/uploaded-images/profile/";
    
    // 파일 확장자
    public static final String[] ALLOWED_IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp"};
    public static final String[] ALLOWED_FILE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp", ".pdf", ".doc", ".docx", ".txt"};
    
    // 파일 크기 제한 (바이트)
    public static final long MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    public static final long MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
    
    private FileUploadConstants() {
        // 유틸리티 클래스이므로 인스턴스화 방지
    }
}
