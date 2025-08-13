package com.promisenow.api.common;

import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
@AllArgsConstructor
public enum ErrorCode {

    // 로그인 관련 Error 메시지
    UNAUTHORIZED("로그인이 필요합니다.", HttpStatus.UNAUTHORIZED),
    FORBIDDEN("본인 계정으로만 요청 가능한 접근입니다.", HttpStatus.FORBIDDEN),

    // Room 관련 Error 메시지
    ROOM_NOT_FOUND("해당 방이 존재하지 않습니다", HttpStatus.NOT_FOUND),
    ROOM_DELETE_NOT_ALLOWED("방에 1명만 남았을 때 방을 삭제할 수 있습니다", HttpStatus.BAD_REQUEST),
    INVITECODE_NOT_ALLOWED("유효하지 않은 초대코드 입니다.", HttpStatus.BAD_REQUEST),
    ROOM_CAPACITY_EXCEEDED("방 정원이 초과되었습니다. (최대 9명)", HttpStatus.BAD_REQUEST),


    // User와 RoomUser 관련 Error 메시지
    USER_NOT_FOUND("해당 사용자가 존재하지 않습니다.", HttpStatus.NOT_FOUND),
    ROOM_USER_NOT_FOUND("접근할 수 없는 방입니다.", HttpStatus.NOT_FOUND),
    USER_ALREADY_JOINED("이미 해당 방에 참가한 사용자입니다", HttpStatus.CONFLICT),

    // 이미지 관련 Error 메시지
    FILE_REQUIRED("파일이 비어있습니다. form-data의 key가 'file'인지 확인하세요.", HttpStatus.BAD_REQUEST),
    PROFILE_IMAGE_STORE_FAIL("프로필 이미지 저장 중 오류가 발생했습니다.", HttpStatus.INTERNAL_SERVER_ERROR),

    // 일반적인 오류 메시지
    BAD_REQUEST("유효하지 않은 요청입니다.", HttpStatus.BAD_REQUEST),
    INTERNAL_SERVER_ERROR("서버 오류가 발생했습니다.", HttpStatus.INTERNAL_SERVER_ERROR);

    private final String message;
    private final HttpStatus status;
}
