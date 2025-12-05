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

    // ------ Auth & JWT ------
    public static final String INVALID_REFRESH_TOKEN = "유효하지 않은 Refresh Token입니다.";
    public static final String REFRESH_TOKEN_NOT_FOUND = "Refresh Token이 없습니다.";
    public static final String JWT_TOKEN_NULL_OR_EMPTY = "JWT token is null or empty";
    public static final String USER_INFO_PROCESSING_ERROR = "사용자 정보 처리 중 오류가 발생했습니다.";
    public static final String LOGIN_PROCESSING_ERROR = "로그인 처리 중 오류가 발생했습니다.";

    // ------ User ------
    public static final String KAKAO_ID_NOT_FOUND = "카카오 ID를 찾을 수 없습니다.";
    public static final String EMAIL_EXTRACTION_ERROR = "이메일 추출 중 오류가 발생했습니다.";
    public static final String NICKNAME_EXTRACTION_ERROR = "닉네임 추출 중 오류가 발생했습니다.";

    // ------ Room Member Validation ------
    public static final String ROOM_USER_NOT_FOUND = "방에 참여하지 않은 사용자입니다.";
    public static final String ROOM_MEMBER_VALIDATION_ERROR = "방 참여자 검증 중 오류가 발생했습니다.";

    // ------ Refresh Token Service ------
    public static final String REFRESH_TOKEN_SAVE_FAILED = "Refresh Token 저장 실패";
    public static final String REFRESH_TOKEN_GET_FAILED = "Refresh Token Redis 조회 실패";
    public static final String REFRESH_TOKEN_DELETE_FAILED = "Refresh Token Redis 삭제 실패";
    public static final String REDIS_CONNECTION_FAILED = "Redis 연결 실패";

    // ------ General ------
    public static final String RESOURCE_NOT_FOUND = "요청한 리소스를 찾을 수 없습니다.";
    public static final String UNAUTHORIZED_ACCESS = "인증이 필요합니다.";
    public static final String FORBIDDEN_ACCESS = "접근 권한이 없습니다.";
    public static final String INTERNAL_SERVER_ERROR = "서버 내부 오류가 발생했습니다.";
    public static final String BAD_REQUEST = "잘못된 요청입니다.";

}
