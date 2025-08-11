package com.promisenow.api.domain.room.service;

import com.promisenow.api.common.AppException;
import com.promisenow.api.common.ErrorCode;
import com.promisenow.api.common.FileUploadConstants;
import com.promisenow.api.infrastructure.file.dto.FileUploadRequest;
import com.promisenow.api.infrastructure.file.service.FileUploadService;
import com.promisenow.api.domain.room.dto.RoomUserRequestDto.*;
import com.promisenow.api.domain.room.dto.RoomUserResponseDto.*;
import com.promisenow.api.domain.room.entity.Room;
import com.promisenow.api.domain.room.entity.RoomUser;
import com.promisenow.api.domain.room.repository.RoomRepository;
import com.promisenow.api.domain.room.repository.RoomUserRepository;
import com.promisenow.api.domain.user.entity.User;
import com.promisenow.api.domain.user.repository.UserRepository;
import com.promisenow.api.domain.leaderboard.repository.LeaderboardRepository;
import com.promisenow.api.domain.leaderboard.service.LeaderboardService;
import com.promisenow.api.domain.leaderboard.dto.PositionResponseDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@Transactional
@RequiredArgsConstructor
public class RoomUserServiceImpl implements RoomUserService {

    private final RoomRepository roomRepository;
    private final RoomUserRepository roomUserRepository;
    private final UserRepository userRepository;
    private final FileUploadService fileUploadService;
    private final LeaderboardRepository leaderboardRepository;
    private final LeaderboardService leaderboardService;
    private final SimpMessagingTemplate messagingTemplate;


    // ---------- 공통 헬퍼 ----------
    private Room findRoomOrThrow(Long roomId) {
        return roomRepository.findById(roomId)
                .orElseThrow(() -> new AppException(ErrorCode.ROOM_NOT_FOUND));
    }

    private User findUserOrThrow(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
    }

    private RoomUser findRoomUserOrThrow(Long roomId, Long userId) {
        return roomUserRepository.findByRoom_RoomIdAndUser_UserId(roomId, userId)
                .orElseThrow(() -> new AppException(ErrorCode.ROOM_USER_NOT_FOUND));
    }

    // 방에 초대코드로 참가
    @Override
    public JoinInfoResponse joinRoomByInviteCode(JoinRequest request) {
        Room room = roomRepository.findByInviteCode(request.getInviteCode())
                .orElseThrow(() -> new AppException(ErrorCode.INVITECODE_NOT_ALLOWED));

        if (roomUserRepository.existsByRoom_RoomIdAndUser_UserId(room.getRoomId(), request.getUserId())) {
            throw new AppException(ErrorCode.USER_ALREADY_JOINED);
        }

        User user = findUserOrThrow(request.getUserId());

        RoomUser roomUser = RoomUser.builder()
                .room(room)
                .user(user)
                .nickname(request.getNickname())
                .isAgreed(true)
                .build();
        roomUserRepository.save(roomUser);


        // 방 참가 시 리더보드에 초기 점수로 추가 (매우 높은 점수로 설정하여 하위권에 배치)
        String leaderboardKey = "room:" + room.getRoomId() + ":leaderboard";
        leaderboardRepository.addToLeaderboard(leaderboardKey, String.valueOf(roomUser.getRoomUserId()), 999999.0);

        // 새로운 사용자 참가 시 기존 사용자들에게 실시간 알림
        try {
            if (room.getLocationLat() != null && room.getLocationLng() != null) {
                // 현재 리더보드 상태를 조회하여 모든 사용자에게 브로드캐스트
                List<PositionResponseDto> currentLeaderboard = leaderboardService.getLeaderboard(
                        room.getRoomId(),
                        room.getLocationLat(),
                        room.getLocationLng(),
                        100 // 충분히 큰 수로 설정
                );
                
                // WebSocket으로 기존 사용자들에게 새로운 리더보드 상태 전송
                messagingTemplate.convertAndSend("/topic/leaderboard/" + room.getRoomId(), currentLeaderboard);
                
                log.info("새로운 사용자 참가 알림 전송: roomId={}, roomUserId={}, nickname={}",
                        room.getRoomId(), roomUser.getRoomUserId(), request.getNickname());
            }
        } catch (Exception e) {
            log.error("❌ 새로운 사용자 참가 알림 전송 실패", e);
        }

        return new JoinInfoResponse(
                room.getRoomId(),
                roomUser.getRoomUserId(),
                room.getRoomTitle(),
                request.getNickname()
                );
    }

    @Override
    public void quitRoom(Long roomId, Long userId) {
        RoomUser roomUser = findRoomUserOrThrow(roomId, userId);
        roomUserRepository.delete(roomUser);
    }

    // 방에 들어와있는 사람들의 닉네임과 이미지 확인
    @Override
    public List<SimpleInfoResponse> getRoomUsers(Long roomId) {
        findRoomOrThrow(roomId);

        List<RoomUser> roomUsers = roomUserRepository.findByRoom_RoomId(roomId);

        if (roomUsers.isEmpty()) {
            throw new AppException(ErrorCode.ROOM_USER_NOT_FOUND);  // 예외 처리
        }

        return roomUsers.stream()
                .map(ru -> new SimpleInfoResponse(ru.getNickname(), ru.getProfileImage()))
                .collect(Collectors.toList());
    }

    @Override
    public RoomUserMyInfoResponseDto getMyRoomUserInfo(Long roomId, Long userId) {
        RoomUser roomUser = findRoomUserOrThrow(roomId, userId);

        return new RoomUserMyInfoResponseDto(
                roomUser.getRoomUserId(),
                roomUser.getNickname(),
                roomUser.getProfileImage()
        );
    }

    @Override
    public void updateAlarm(Long roomId, Long userId, boolean isAgreed) {
        RoomUser roomUser = findRoomUserOrThrow(roomId, userId);

        roomUser.updateAlarm(isAgreed);
    }

    @Override
    public boolean getAlarmAgreement(Long roomId, Long userId) {
        RoomUser roomUser = findRoomUserOrThrow(roomId, userId);

        return roomUser.getIsAgreed();
    }

    @Override
    public void updateNickname(Long roomId, Long userId, String newNickname) {
        RoomUser roomUser = findRoomUserOrThrow(roomId, userId);
        roomUser.updateNickname(newNickname);
    }


    @Override
    public String updateProfileImage(Long roomId, Long userId, MultipartFile file) {
        RoomUser roomUser = findRoomUserOrThrow(roomId, userId);

        FileUploadRequest request = new FileUploadRequest(file);
        String imageUrl = fileUploadService.uploadFileAndGetUrl(request, FileUploadConstants.FILE_TYPE_PROFILE);

        roomUser.updateProfileImage(imageUrl);
        return imageUrl;
    }



} 