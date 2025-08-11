package com.promisenow.api.domain.room.service;

import com.promisenow.api.common.AppException;
import com.promisenow.api.common.ErrorCode;
import com.promisenow.api.domain.room.dto.RoomRequestDto.*;
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

import java.time.LocalDate;
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
    // 방을 찾지 못하면
    private Room findRoomOrThrow(Long roomId) {
        return roomRepository.findById(roomId)
                .orElseThrow(() -> new AppException(ErrorCode.ROOM_NOT_FOUND));
    }

    // User를 찾지 못하면
    private User findUserOrThrow(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
    }

    // 방이 대기이거나 활성화 인지 확인하는 메서드
    private boolean isWaitingOrActive(Room.RoomState state) {
        return state == Room.RoomState.WAITING || state == Room.RoomState.ACTIVE;
    }


    // 방 만드는 서비스
    @Override
    public CreateResponse createRoomWithUser(CreateRequest request) {

        String roomCode = generateRandomCode(6);

        // 오늘 날짜가 기본으로 시작날짜
        LocalDate startDate = LocalDate.now();
        // 1주일 동안을 기본으로 설정
        LocalDate endDate = startDate.plusWeeks(1);

        Room room = Room.builder()
                .roomTitle(request.getRoomTitle())
                .inviteCode(roomCode)
                .roomState(Room.RoomState.WAITING)
                .startDate(startDate)
                .endDate(endDate)
                .build();
        roomRepository.save(room);

        User user = findUserOrThrow(request.getUserId());

        RoomUser roomUser = RoomUser.builder()
                .room(room)
                .user(user)
                .nickname(request.getNickname())
                .isAgreed(true)
                .build();
        roomUserRepository.save(roomUser);

        return CreateResponse.builder()
                .roomId(room.getRoomId())
                .roomUserId(roomUser.getRoomUserId())
                .roomTitle(room.getRoomTitle())
                .roomCode(room.getInviteCode())
                .nickname(request.getNickname())
                .build();
    }

    @Override
    public void deleteRoom(Long roomId) {
        Room room = findRoomOrThrow(roomId);

        List<RoomUser> roomUsers = roomUserRepository.findByRoom_RoomId(roomId);

        if(roomUsers.size() > 1) {
            throw new AppException(ErrorCode.ROOM_DELETE_NOT_ALLOWED);
        }

        if (roomUsers.size() == 1) {
            RoomUser lastUser = roomUsers.get(0);
            roomUserRepository.delete(lastUser);
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
    public List<RoomListItem> getRoomsByUserId(Long userId) {
        findUserOrThrow(userId);

        List<RoomUser> joinedRoomUsers = roomUserRepository.findByUserId(userId);

        Set<Long> roomIds = joinedRoomUsers.stream()
                .map(ru -> ru.getRoom().getRoomId())
                .collect(Collectors.toSet());

        Map<Long, List<RoomUser>> participantsByRoom = roomIds.stream()
                .collect(Collectors.toMap(
                        id -> id,
                        id -> roomUserRepository.findByRoom_RoomId(id)
                ));

        // 4) 목록 변환
        List<RoomListItem> roomList = joinedRoomUsers.stream()
                .map(myRoomUser -> {
                    Room room = myRoomUser.getRoom();
                    List<RoomUser> participants = participantsByRoom
                            .getOrDefault(room.getRoomId(), Collections.emptyList())
                            .stream()
                            .filter(p -> !Objects.equals(p.getUser().getUserId(), -1L))
                            .toList();

                    int total = participants.size();
                    String myNickname = myRoomUser.getNickname();

                    String firstNickname = participants.stream()
                            .filter(p -> !Objects.equals(p.getUser().getUserId(), userId))
                            .map(RoomUser::getNickname)
                            .findFirst()
                            .orElse(myNickname);

                    String summary = (total <= 1) ? myNickname : firstNickname + " 외 " + (total - 1) + "명";

                    return new RoomListItem(
                            room.getRoomId(),
                            room.getRoomTitle(),
                            room.getLocationDate(),
                            room.getLocationTime(),
                            room.getLocationName(),
                            summary,
                            room.getRoomState()
                    );
                })
                .collect(Collectors.toList());

        // WAITING, ACTIVE 상태중에 먼저 시간은 정해진 애들끼리 담아두기
        List<RoomListItem> upcomingWithDate = roomList.stream()
                .filter(r -> isWaitingOrActive(r.getRoomState()))
                .filter(r -> r.getLocationDate() != null && r.getLocationTime() != null)
                .sorted(Comparator
                        .comparing(RoomListItem::getLocationDate)
                        .thenComparing(RoomListItem::getLocationTime))
                .collect(Collectors.toList());

        // WAITING, ACTIVE 중 날짜아니면 시간이 null이면 아래로
        List<RoomListItem> upcomingWithoutDate = roomList.stream()
                .filter(r -> isWaitingOrActive(r.getRoomState()))
                .filter(r -> r.getLocationDate() == null || r.getLocationTime() == null)
                .collect(Collectors.toList());

        // COMPLETED일땐 날짜,시간 기준 내림차순. 이때는 시간은 정해져있으니깐 null생각은 안해도된다 !
        List<RoomListItem> completedRooms = roomList.stream()
                .filter(r -> r.getRoomState() == Room.RoomState.COMPLETED)
                .sorted(Comparator
                        .comparing(RoomListItem::getLocationDate, Comparator.nullsLast(Comparator.reverseOrder()))
                        .thenComparing(RoomListItem::getLocationTime, Comparator.nullsLast(Comparator.reverseOrder())))
                .collect(Collectors.toList());

        // 그 외 상태 CANCELLED는 그냥 하자
        List<RoomListItem> otherRooms = roomList.stream()
                .filter(r -> !isWaitingOrActive(r.getRoomState()) && r.getRoomState() != Room.RoomState.COMPLETED)
                .collect(Collectors.toList());

        // 합치기
        List<RoomListItem> result = new ArrayList<>();
        result.addAll(upcomingWithDate);
        result.addAll(upcomingWithoutDate);
        result.addAll(completedRooms);
        result.addAll(otherRooms);

        return result;
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
    public void updateRoomDateRange(Long roomId, DateRangeUpdateRequest request) {
        Room room = findRoomOrThrow(roomId);

        room.upadteDateRange(request.getStartDate(), request.getEndDate());
    }

    @Override
    @Transactional
    public void updateRoomAppointment(Long roomId, AppointmentUpdateRequest request) {
        Room room = findRoomOrThrow(roomId);

        room.updateAppointment(
                request.getLocationDate(),
                request.getLocationTime(),
                request.getLocationName(),
                request.getLocationLat(),
                request.getLocationLng());
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