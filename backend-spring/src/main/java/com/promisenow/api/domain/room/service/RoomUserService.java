package com.promisenow.api.domain.room.service;

import com.promisenow.api.domain.room.dto.RoomUserRequestDto.*;
import com.promisenow.api.domain.room.dto.RoomUserResponseDto.*;

import java.util.List;

public interface RoomUserService {

    // 방에 초대코드로 참가
    JoinInfoResponse joinRoomByInviteCode(JoinRequest dto);

    // 입장했던 방에 재참가
    JoinInfoResponse enterJoinedRoom(Long roomId, Long userId);

    // 방 나가기
    void quitRoom(Long roomId, Long userId);

    // 방 참가인원 보기
    List<SimpleInfoResponse> getRoomUsers(Long roomId);

    // 알람 true false 설정
    void updateAlarm(Long roomId, Long userId, boolean isAgreed);

} 