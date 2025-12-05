package com.promisenow.api.infrastructure.file;

import com.promisenow.api.common.FileUploadConstants;
import com.promisenow.api.infrastructure.file.exception.FileUploadException;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Arrays;
import java.util.Objects;

/**
 * 파일 업로드 관련 유틸리티 클래스
 */
public class FileUploadUtils {
    
    /**
     * 파일을 업로드하고 URL을 반환하는 공통 메서드
     * 
     * @param file 업로드할 파일
     * @param uploadDir 업로드 디렉토리 경로
     * @param fileType 파일 타입 (chat, profile 등)
     * @param urlPath URL 경로 (/uploaded-images/chat/, /uploaded-images/profile/ 등)
     * @return 업로드된 파일의 URL
     * @throws FileUploadException 파일 저장 중 오류 발생 시
     */
    public static String uploadFile(MultipartFile file, String uploadDir, String fileType, String urlPath) {
        validateFile(file);
        validateFileSize(file);
        validateFileExtension(file);

        try {
            // 업로드 디렉토리 생성
            createUploadDirectory(uploadDir);

            String originalFilename = StringUtils.cleanPath(Objects.requireNonNull(file.getOriginalFilename()));
            String fileExtension = extractFileExtension(originalFilename);
            String fileName = generateSafeFileName(fileType, fileExtension);
            
            Path filePath = Paths.get(uploadDir, fileName);
            Files.write(filePath, file.getBytes());

            return ServletUriComponentsBuilder.fromCurrentContextPath()
                    .path(urlPath)
                    .path(fileName)
                    .toUriString();

        } catch (IOException e) {
            throw new FileUploadException("파일 저장 중 오류가 발생했습니다.", 500, e);
        }
    }
    
    /**
     * 파일 유효성 검사
     */
    private static void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new FileUploadException("파일이 비어있습니다.", 400);
        }
    }
    
    /**
     * 파일 크기 검사
     */
    private static void validateFileSize(MultipartFile file) {
        if (file.getSize() > FileUploadConstants.MAX_FILE_SIZE) {
            throw new FileUploadException("파일 크기가 제한을 초과했습니다.", 400);
        }
    }
    
    /**
     * 파일 확장자 검사
     */
    private static void validateFileExtension(MultipartFile file) {
        String originalFilename = file.getOriginalFilename();
        if (originalFilename != null && originalFilename.contains(".")) {
            String extension = originalFilename.substring(originalFilename.lastIndexOf(".")).toLowerCase();
            if (!Arrays.asList(FileUploadConstants.ALLOWED_FILE_EXTENSIONS).contains(extension)) {
                throw new FileUploadException("지원하지 않는 파일 형식입니다.", 400);
            }
        }
    }
    
    /**
     * 업로드 디렉토리 생성
     */
    private static void createUploadDirectory(String uploadDir) {
        try {
            Files.createDirectories(Path.of(uploadDir));
        } catch (IOException e) {
            throw new FileUploadException("업로드 디렉토리 생성에 실패했습니다.", 500, e);
        }
    }
    
    /**
     * 파일 확장자만 추출하는 유틸리티 메서드
     * 
     * @param originalFilename 원본 파일명
     * @return 파일 확장자 (.jpg, .png 등)
     */
    public static String extractFileExtension(String originalFilename) {
        if (originalFilename != null && originalFilename.contains(".")) {
            return originalFilename.substring(originalFilename.lastIndexOf("."));
        }
        return "";
    }
    
    /**
     * 안전한 파일명 생성 (타임스탬프 + 타입 + 확장자)
     * 
     * @param fileType 파일 타입 (chat, profile 등)
     * @param fileExtension 파일 확장자
     * @return 안전한 파일명
     */
    public static String generateSafeFileName(String fileType, String fileExtension) {
        return System.currentTimeMillis() + "_" + fileType + fileExtension;
    }
}
