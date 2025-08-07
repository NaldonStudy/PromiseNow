package com.promisenow.api.domain.room.service;

import com.promisenow.api.common.ErrorMessage;
import com.promisenow.api.domain.room.dto.RoomRequestDto;
import com.promisenow.api.domain.room.dto.RoomResponseDto.*;
import com.promisenow.api.domain.room.entity.Room;
import com.promisenow.api.domain.room.entity.Room.*;
import com.promisenow.api.domain.room.entity.RoomUser;
import com.promisenow.api.domain.room.repository.RoomRepository;
import com.promisenow.api.domain.room.repository.RoomUserRepository;
import com.promisenow.api.domain.user.entity.User;
import com.promisenow.api.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
public class RoomServiceImpl implements RoomService {

    private final RoomRepository roomRepository;
    private final RoomUserRepository roomUserRepository;
    private final UserRepository userRepository;

    // 메서드로 묶어서 관리
    private Room findRoomOrThrow(Long roomId) {
        return roomRepository.findById(roomId)
                .orElseThrow(() -> new IllegalArgumentException(ErrorMessage.ROOM_NOT_FOUND));
    }

    private User findUserOrThrow(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException(ErrorMessage.USER_NOT_FOUND));
    }

    // 방 만드는 서비스
    @Override
    public CreateResponse createRoomWithUser(String roomTitle, Long userId, String nickname) {

        String roomCode = generateRandomCode(6);

        Room room = Room.builder()
                .roomTitle(roomTitle)
                .inviteCode(roomCode)
                .roomState(Room.RoomState.WAITING)
                .build();

        roomRepository.save(room);

        User user = findUserOrThrow(userId);

        RoomUser roomUser = RoomUser.builder()
                .room(room)
                .user(user)
                .nickname(nickname)
                .isAgreed(true)
                .build();

        roomUserRepository.save(roomUser);

        return CreateResponse.builder()
                .roomId(room.getRoomId())
                .roomUserId(roomUser.getRoomUserId())
                .roomTitle(room.getRoomTitle())
                .roomCode(room.getInviteCode())
                .nickname(nickname)
                .build();
    }

    @Override
    public void deleteRoom(Long roomId) {
        Room room = findRoomOrThrow(roomId);

        List<RoomUser> roomUsers = roomUserRepository.findByRoom_RoomId(roomId);

        if(roomUsers.size() > 1) {
            throw new IllegalArgumentException(ErrorMessage.ROOM_DELETE_NOT_ALLOWED);
        }

        if(roomUsers.size() == 1) {
            roomUserRepository.delete(roomUsers.get(0));
        }

        roomRepository.delete(room);
    }

    // 방제목 & 방참여코드 GET
    @Override
    public TitleCodeResponse getRoomTitleAndCode(Long roomId) {
        Room room = findRoomOrThrow(roomId);
        return new TitleCodeResponse(room.getRoomTitle(), room.getInviteCode());
    }

    // 방 상태 GET
    @Override
    public StateResponse getRoomStatus(Long roomId) {
        Room room = findRoomOrThrow(roomId);
        return new StateResponse(room.getRoomState());
    }

    // 방 약속기간 GET
    @Override
    public DateRangeResponse getRoomDateRange(Long roomId) {
        Room room = findRoomOrThrow(roomId);
        return new DateRangeResponse(room.getStartDate(), room.getEndDate());
    }

    // 방 세부약속 GET
    @Override
    public AppointmentResponse getRoomAppointment(Long roomId) {
        Room room = findRoomOrThrow(roomId);

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
                .map(myRoomUser -> {
                    Room room = myRoomUser.getRoom();

                    List<RoomUser> participants = roomUserRepository.findByRoom_RoomId(room.getRoomId());

                    int total = participants.size();

                    String myNickname = myRoomUser.getNickname();

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
        Room room = findRoomOrThrow(roomId);

        room.changeRoomState(roomState);
    }

    // 방 제목 변경
    @Transactional
    public void updateRoomTitle(Long roomId, String newTitle) {
        Room room = findRoomOrThrow(roomId);

        room.updateTitle(newTitle);
    }

    // 일정 기간 조절
    @Override
    @Transactional
    public void updateRoomDateRange(Long roomId, RoomRequestDto.DateRangeUpdateRequest dto) {
        Room room = findRoomOrThrow(roomId);

        room.upadteDateRange(dto.getStartDate(), dto.getEndDate());
    }

    @Override
    @Transactional
    public void updateRoomAppointment(Long roomId, RoomRequestDto.AppointmentUpdateRequest dto) {
        Room room = findRoomOrThrow(roomId);

        room.updateAppointment(
                dto.getLocationDate(),
                dto.getLocationTime(),
                dto.getLocationName(),
                dto.getLocationLat(),
                dto.getLocationLng());
    }

    // 시간 확인하고 방 상태 Activate로 변경
    @Override
    public void checkAndActivateRooms() {
        LocalDateTime now = LocalDateTime.now().withSecond(0).withNano(0);

        List<Room> rooms = roomRepository.findAll();

        for (Room room: rooms) {
            // locationDate 또는 locationTime이 null이면 건너뛰기
            if (room.getLocationDate() == null || room.getLocationTime() == null) {
                continue;
            }

            LocalDateTime appointmentTime = LocalDateTime.of(
                    room.getLocationDate(),
                    room.getLocationTime()
            );

            RoomState currentState = room.getRoomState();

            // 실수로 시간 이전으로 하면 WAITING으로 다시 변경
            if (currentState == RoomState.COMPLETED) {
                if (appointmentTime.isAfter(now)) {
                    room.changeRoomState(RoomState.WAITING);
                    currentState = RoomState.WAITING;
                }
            }

            // 2시간 이내에 약속이라면 ACTIVE로 변경
            if(currentState == RoomState.WAITING) {
                if(!appointmentTime.isAfter(now.plusHours(2))) {
                    room.changeRoomState(RoomState.ACTIVE);
                }
            }

            else if(currentState == RoomState.ACTIVE) {

                // 세션 ACTIVE에서 약속시간 변경 시 24시간 이내면 세션 ACTIVE 유지. 아니면 다시 W
                if(appointmentTime.isAfter(now.plusHours(24))) {
                    room.changeRoomState(RoomState.WAITING);
                }

                // 약속시간 1시간 지나면 세션 종료
                else if(appointmentTime.isBefore(now.minusHours(1))) {
                    room.changeRoomState(RoomState.COMPLETED);
                }
            }
        }
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