package com.promisenow.api.common;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class ErrorMessage {
    private final String message;
    private final int status;

    // ------ RoomServiceImpl ------
    public static final String ROOM_NOT_FOUND = "해당 방이 존재하지 않습니다.";

    public static final String USER_NOT_FOUND = "해당 사용자가 존재하지 않습니다.";

    public static final String ROOM_DELETE_NOT_ALLOWED = "방에 1명만 남았을 때 방 삭제 가능합니다.";

    // ------ FileUpload ------
    public static final String FILE_EMPTY = "파일이 비어있습니다.";
    public static final String FILE_UPLOAD_FAILED = "파일 업로드 중 오류가 발생했습니다.";
    public static final String FILE_EXTENSION_INVALID = "지원하지 않는 파일 형식입니다.";
    public static final String FILE_SIZE_EXCEEDED = "파일 크기가 제한을 초과했습니다.";
    public static final String DIRECTORY_CREATION_FAILED = "업로드 디렉토리 생성에 실패했습니다.";
    public static final String COORDINATES_REQUIRED = "좌표(lat/lng)는 필수입니다.";

}
