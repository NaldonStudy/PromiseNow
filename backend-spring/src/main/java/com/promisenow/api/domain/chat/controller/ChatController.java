package com.promisenow.api.domain.chat.controller;

import com.promisenow.api.common.ApiUtils;
import com.promisenow.api.domain.chat.dto.MessageResponseDto;
import com.promisenow.api.domain.chat.exception.FileStorageException;
import com.promisenow.api.domain.chat.service.ChatService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

@RestController
@RequestMapping("/api/chatting")
@RequiredArgsConstructor
@Tag(name = "Chat API", description = "채팅 메시지 및 이미지 업로드 관련 API")
public class ChatController {

    private final ChatService chatService;
    private final String uploadDir = "./uploaded-images/";

    @Operation(
            summary = "채팅 메시지 조회",
            description = "특정 채팅방 ID에 해당하는 메시지 리스트를 반환합니다.",
            responses = {
                    @ApiResponse(responseCode = "200", description = "메시지 조회 성공",
                            content = @Content(mediaType = "application/json",
                                    schema = @Schema(implementation = MessageResponseDto.class))),
                    @ApiResponse(responseCode = "404", description = "채팅방을 찾을 수 없음")
            }
    )
    @GetMapping("/{roomId}/messages")
    public ResponseEntity<ApiUtils.ApiResponse<List<MessageResponseDto>>> getMessages(
            @Parameter(description = "채팅방 ID", example = "1") @PathVariable Long roomId) {

        List<MessageResponseDto> messages = chatService.getMessages(roomId);
        if (messages == null || messages.isEmpty()) {
            return ApiUtils.success(List.of());
        }
        return ApiUtils.success(messages);
    }

    @PostMapping(
            value = "/upload/image",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE
    )
    @Operation(
            summary = "이미지 업로드",
            description = "이미지 파일을 업로드하고, 접근 가능한 URL을 반환합니다.",
            responses = {
                    @ApiResponse(responseCode = "200", description = "업로드 성공",
                            content = @Content(mediaType = "application/json",
                                    schema = @Schema(implementation = ImageUploadResponse.class))),
                    @ApiResponse(responseCode = "400", description = "잘못된 요청"),
                    @ApiResponse(responseCode = "500", description = "서버 오류")
            }
    )
    public ResponseEntity<ApiUtils.ApiResponse<ImageUploadResponse>> uploadImage(
            @Parameter(
                    description = "업로드할 이미지 파일",
                    required = true,
                    schema = @Schema(type = "string", format = "binary")
            )
            @RequestPart("file") MultipartFile file,
            @RequestParam("lat") Double lat,
            @RequestParam("lng") Double lng,
            @RequestParam(value = "timestamp", required = false) String timestampStr) {



        try {
            File uploadPath = new File(uploadDir);
            if (!uploadPath.exists()) {
                uploadPath.mkdirs();
            }

            String originalFilename = StringUtils.cleanPath(file.getOriginalFilename());
            String fileName = System.currentTimeMillis() + "_" + originalFilename;

            Path filePath = Paths.get(uploadDir, fileName);
            Files.write(filePath, file.getBytes());

            String fileDownloadUri = ServletUriComponentsBuilder.fromCurrentContextPath()
                    .path("/uploaded-images/")
                    .path(fileName)
                    .toUriString();

            return ApiUtils.success(new ImageUploadResponse(fileDownloadUri));

        } catch (IOException e) {
            e.printStackTrace();
            throw new FileStorageException("파일 저장 중 오류가 발생했습니다.");
        }
    }

    @Schema(description = "이미지 업로드 응답 DTO")
    public static class ImageUploadResponse {
        @Schema(description = "업로드된 이미지 URL", example = "http://localhost:8080/uploaded-images/1690859341256_image.png")
        private String imageUrl;

        public ImageUploadResponse(String imageUrl) {
            this.imageUrl = imageUrl;
        }

        public String getImageUrl() {
            return imageUrl;
        }
    }
}
