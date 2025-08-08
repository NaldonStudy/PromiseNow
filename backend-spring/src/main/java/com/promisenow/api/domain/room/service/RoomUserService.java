package com.promisenow.api.domain.room.service;

import com.promisenow.api.domain.room.dto.RoomUserRequestDto.*;
import com.promisenow.api.domain.room.dto.RoomUserResponseDto.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface RoomUserService {

    // 방에 초대코드로 참가
    JoinInfoResponse joinRoomByInviteCode(JoinRequest dto);

    // 방 나가기
    void quitRoom(Long roomId, Long userId);

    // 방 참가인원 보기
    List<SimpleInfoResponse> getRoomUsers(Long roomId);

    // 알람 true false 설정
    void updateAlarm(Long roomId, Long userId, boolean isAgreed);

    // 알람 상태 유무 true false GET
    boolean getAlarmAgreement(Long roomId, Long userId);

    // 유저 닉네임 변경
    void updateNickname(Long roomId, Long userId, String newNickname);

    // 프로필 사진 업데이트
    String updateProfileImage(Long roomId, Long userId, MultipartFile file);
} 