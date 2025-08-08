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


}
