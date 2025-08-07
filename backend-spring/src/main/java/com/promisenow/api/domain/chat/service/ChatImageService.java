package com.promisenow.api.domain.chat.service;

import org.springframework.web.multipart.MultipartFile;

public interface ChatImageService {
    String uploadImage(MultipartFile file, Double lat, Double lng, String timestampStr);
}