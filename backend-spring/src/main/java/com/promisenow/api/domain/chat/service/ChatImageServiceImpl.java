package com.promisenow.api.domain.chat.service;

import com.promisenow.api.domain.chat.exception.FileStorageException;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Service
public class ChatImageServiceImpl implements ChatImageService {

    private final String uploadDir = "./uploaded-images/chat/";

    @Override
    public String uploadImage(MultipartFile file, Double lat, Double lng, String timestampStr) {
        try {
            File uploadPath = new File(uploadDir);
            if (!uploadPath.exists()) {
                uploadPath.mkdirs();
            }

            String originalFilename = StringUtils.cleanPath(file.getOriginalFilename());
            String fileName = System.currentTimeMillis() + "_" + originalFilename;

            Path filePath = Paths.get(uploadDir, fileName);
            Files.write(filePath, file.getBytes());

            return ServletUriComponentsBuilder.fromCurrentContextPath()
                    .path("/uploaded-images/chat/")
                    .path(fileName)
                    .toUriString();

        } catch (IOException e) {
            e.printStackTrace();
            throw new FileStorageException("파일 저장 중 오류가 발생했습니다.");
        }
    }
}
