package com.promisenow.api.domain.room.service;

import com.promisenow.api.domain.room.dto.RoomRequestDto;
import com.promisenow.api.domain.room.entity.Room;
import com.promisenow.api.domain.room.dto.RoomResponseDto.*;

import java.util.List;

public interface RoomService {

    CreateResponse createRoom(String roomTitle);

    void deleteRoom(Long roomId);

    // 방과 관련된 GET
    // 방제목 & 방참여코드
    TitleCodeResponse getRoomTitleAndCode(Long roomId);

    // 방 상태
    StateResponse getRoomStatus(Long roomId);

    // 방 약속가능기간
    DateRangeResponse getRoomDateRange(Long roomId);

    // 방 세부약속
    AppointmentResponse getRoomAppointment(Long roomId);

    // userId로 방정보
    List<RoomListItem> getRoomsByUserId(Long userId);

    // 방 상태 업데이트
    void updateRoomState(Long roomId, Room.RoomState roomState);

    // 방 제목 업데이트
    void updateRoomTitle(Long roomId, String newTitle);

    // 약속기간 범위 업데이트
    void updateRoomDateRange(Long roomId, RoomRequestDto.DateRangeUpdateRequest dto);

    // 약속상세 업데이트
    void updateRoomAppointment(Long roomId, RoomRequestDto.AppointmentUpdateRequest dto);

    // 조건에 따른 방 상태 Activate으로 변경
    void checkAndActivateRooms();
}