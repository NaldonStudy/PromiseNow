package com.promisenow.api.domain.chat.service;

import com.promisenow.api.domain.chat.exception.FileStorageException;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Objects;

@Service
public class ChatImageServiceImpl implements ChatImageService {
    @Override
    public String uploadImage(MultipartFile file, Double lat, Double lng, String sentDateStr) { // 변경!
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("파일이 비어있습니다.");
        }
        if (lat == null || lng == null) {
            throw new IllegalArgumentException("좌표(lat/lng)는 필수입니다.");
        }

        try {
            String uploadDir = "./uploaded-images/chat/";
            Files.createDirectories(Path.of(uploadDir));

            String originalFilename = StringUtils.cleanPath(Objects.requireNonNull(file.getOriginalFilename()));
            String fileName = System.currentTimeMillis() + "_" + originalFilename;
            Path filePath = Paths.get(uploadDir, fileName);
            Files.write(filePath, file.getBytes());


            return ServletUriComponentsBuilder.fromCurrentContextPath()
                    .path("/uploaded-images/chat/")
                    .path(fileName)
                    .toUriString();

        } catch (IOException e) {
            throw new FileStorageException("파일 저장 중 오류가 발생했습니다.", e);
        }
    }
}

