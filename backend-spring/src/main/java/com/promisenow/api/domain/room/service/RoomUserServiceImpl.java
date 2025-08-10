package com.promisenow.api.domain.room.service;

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

    // 방에 초대코드로 참가
    @Override
    public JoinInfoResponse joinRoomByInviteCode(JoinRequest dto) {
        Room room = roomRepository.findByInviteCode(dto.getInviteCode())
                .orElseThrow(() -> new IllegalArgumentException("유효하지 않은 초대코드입니다."));

        if (roomUserRepository.existsByRoom_RoomIdAndUser_UserId(room.getRoomId(), dto.getUserId())){
            throw new IllegalStateException("이미 해당 방에 참가한 사용자입니다");
        }

        User user = userRepository.findById(dto.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 사용자입니다"));

        RoomUser roomUser = RoomUser.builder()
                .room(room)
                .user(user)
                .nickname(dto.getNickname())
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
                        room.getRoomId(), roomUser.getRoomUserId(), dto.getNickname());
            }
        } catch (Exception e) {
            log.error("❌ 새로운 사용자 참가 알림 전송 실패", e);
        }

        return new JoinInfoResponse(
                room.getRoomId(),
                roomUser.getRoomUserId(),
                room.getRoomTitle(),
                dto.getNickname()
                );
    }

    @Override
    public void quitRoom(Long roomId, Long userId) {
        RoomUser roomUser = roomUserRepository.findByRoom_RoomIdAndUser_UserId(roomId, userId)
                .orElseThrow(() -> new IllegalArgumentException("해당 유저는 방에 참가하고 있지 않습니다"));
        roomUserRepository.delete(roomUser);
    }

    // 방에 들어와있는 사람들의 닉네임과 이미지 확인
    @Override
    public List<SimpleInfoResponse> getRoomUsers(Long roomId) {
        return roomUserRepository.findByRoom_RoomId(roomId).stream()
                .map(roomUser -> new SimpleInfoResponse(
                        roomUser.getNickname(),
                        roomUser.getProfileImage()
                ))
                .collect(Collectors.toList());
    }

    @Override
    public RoomUserMyInfoResponseDto getMyRoomUserInfo(Long roomId, Long userId) {
        RoomUser roomUser = roomUserRepository.findByRoom_RoomIdAndUser_UserId(roomId, userId)
                .orElseThrow(() -> new IllegalArgumentException("해당 유저는 방에 참가하고 있지 않습니다"));

        return new RoomUserMyInfoResponseDto(roomUser.getRoomUserId(), roomUser.getNickname());
    }

    @Override
    public void updateAlarm(Long roomId, Long userId, boolean isAgreed) {
        RoomUser roomUser = roomUserRepository.findByRoom_RoomIdAndUser_UserId(roomId, userId)
                .orElseThrow(() -> new IllegalArgumentException("해당 사용자 정보를 찾을 수 없습니다."));

        roomUser.updateAlarm(isAgreed);
    }

    @Override
    public boolean getAlarmAgreement(Long roomId, Long userId) {
        RoomUser roomUser = roomUserRepository.findByRoom_RoomIdAndUser_UserId(roomId, userId)
                .orElseThrow(() -> new IllegalArgumentException("해당 사용자 정보를 찾을 수 없습니다."));

        return roomUser.getIsAgreed();
    }

    @Override
    public void updateNickname(Long roomId, Long userId, String newNickname) {
        RoomUser roomUser = roomUserRepository.findByRoom_RoomIdAndUser_UserId(roomId, userId)
                .orElseThrow(() -> new IllegalArgumentException("해당 사용자 정보를 찾을 수 없습니다."));
        roomUser.updateNickname(newNickname);
    }


    @Override
    public String updateProfileImage(Long roomId, Long userId, MultipartFile file) {
        RoomUser roomUser = roomUserRepository.findByRoom_RoomIdAndUser_UserId(roomId, userId)
                .orElseThrow(() -> new IllegalArgumentException("해당 사용자 정보를 찾을 수 없습니다."));

        FileUploadRequest request = new FileUploadRequest(file);
        String imageUrl = fileUploadService.uploadFileAndGetUrl(request, FileUploadConstants.FILE_TYPE_PROFILE);

        roomUser.updateProfileImage(imageUrl);
        return imageUrl;
    }



} 