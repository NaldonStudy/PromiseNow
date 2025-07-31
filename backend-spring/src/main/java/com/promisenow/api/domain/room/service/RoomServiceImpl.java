package com.promisenow.api.domain.room.service;

import com.promisenow.api.domain.room.dto.RoomRequestDto;
import com.promisenow.api.domain.room.dto.RoomResponseDto.*;
import com.promisenow.api.domain.room.entity.Room;
import com.promisenow.api.domain.room.entity.RoomUser;
import com.promisenow.api.domain.room.repository.RoomRepository;
import com.promisenow.api.domain.room.repository.RoomUserRepository;
import com.promisenow.api.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
public class RoomServiceImpl implements RoomService {

    @Autowired
    private final RoomRepository roomRepository;

    @Autowired
    private final RoomUserRepository roomUserRepository;

    @Autowired
    private final UserRepository userRepository;

    // 방 만드는 서비스
    @Override
    public CreateResponse createRoom(String roomTitle) {
        String roomCode = generateRandomCode(6);

        Room room = Room.builder()
                .roomTitle(roomTitle)
                .inviteCode(roomCode)
                .roomState(Room.RoomState.WAITING)
                .build();

        roomRepository.save(room);

        return new CreateResponse(roomTitle, roomCode);
    }

    @Override
    public void deleteRoom(Long roomId) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new IllegalArgumentException("방이 존재하지 않습니다."));
        roomRepository.delete(room);
    }

    // 방제목 & 방참여코드 GET
    @Override
    public TitleCodeResponse getRoomTitleAndCode(Long roomId) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new IllegalArgumentException("해당 ID의 방이 존재하지 않습니다 : " + roomId));
        return new TitleCodeResponse(room.getRoomTitle(), room.getInviteCode());
    }

    // 방 상태 GET
    @Override
    public StateResponse getRoomStatus(Long roomId) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new IllegalArgumentException("해당 ID의 방이 존재하지 않습니다 : " + roomId));
        return new StateResponse(room.getRoomState());
    }

    // 방 약속기간 GET
    @Override
    public DateRangeResponse getRoomDateRange(Long roomId) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new IllegalArgumentException("해당 ID의 방이 존재하지 않습니다 : " + roomId));
        return new DateRangeResponse(room.getStartDate(), room.getEndDate());
    }

    // 방 세부약속 GET
    @Override
    public AppointmentResponse getRoomAppointment(Long roomId) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new IllegalArgumentException("해당 ID의 방이 존재하지 않습니다 : " + roomId));

        return new AppointmentResponse(
                room.getLocationDate(),
                room.getLocationTime(),
                room.getLocationName(),
                room.getLocationLat(),
                room.getLocationLng()
        );
    }


    // 내가 참가되어있는 방 정보들 확인
    @Override
    public List<RoomListItem> getRoomsByUserId(Long userId) {
        List<RoomUser> joinedRoomUsers = roomUserRepository.findByUserId(userId);

        return joinedRoomUsers.stream()
                .map(RoomUser::getRoom)
                .distinct()
                .map(room -> {
                    List<RoomUser> participants = roomUserRepository.findByRoom_RoomId(room.getRoomId());

                    int total = participants.size();

                    String myNickname = participants.stream()
                            .filter(p -> p.getUser().getUserId().equals(userId))
                            .map(RoomUser::getNickname)
                            .findFirst()
                            .orElse("나");

                    String firstNickname = participants.stream()
                            .filter(p -> !p.getUser().getUserId().equals(userId))
                            .map(RoomUser::getNickname)
                            .findFirst()
                            .orElse(myNickname);   // 나 혼자일 때에는 "나"

                    String summary = (total == 1) ? myNickname : firstNickname + " 외 " + (total - 1) + "명";

                    return new RoomListItem(
                            room.getRoomId(),
                            room.getRoomTitle(),
                            room.getLocationDate(),
                            room.getLocationTime(),
                            room.getLocationName(),
                            summary
                    );
                })
                .collect(Collectors.toList());
    }

    @Override
    public void updateRoomState(Long roomId, Room.RoomState roomState) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new IllegalArgumentException("해당 방이 존재하지 않습니다."));

        room.changeRoomState(roomState);
    }


    // 방 제목 변경
    @Transactional
    public void updateRoomTitle(Long roomId, String newTitle) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new IllegalArgumentException("해당 방이 존재하지 않습니다."));
        room.updateTitle(newTitle);
    }

    // 일정 기간 조절
    @Override
    @Transactional
    public void updateRoomDateRange(Long roomId, RoomRequestDto.DateRangeUpdateRequest dto) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 방입니다"));

        room.upadteDateRange(dto.getStartDate(), dto.getEndDate());
    }

    @Override
    @Transactional
    public void updateRoomAppointment(Long roomId, RoomRequestDto.AppointmentUpdateRequest dto) {
        Room room = roomRepository.findById((roomId))
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 방입니다"));

        room.updateAppointment(
                dto.getLocationDate(),
                dto.getLocationTime(),
                dto.getLocationName(),
                dto.getLocationLat(),
                dto.getLocationLng());
    }


    // 6자리 영문 대소문자+숫자 혼합 코드 생성
    private String generateRandomCode(int length) {
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        String code;
        do{
            StringBuilder sb = new StringBuilder();
            for (int i = 0; i < length; i++) {
                int idx = (int)(Math.random() * chars.length());
                sb.append(chars.charAt(idx));
            }
            code = sb.toString();
        } while (roomRepository.existsByInviteCode(code));
        return code;
    }


}