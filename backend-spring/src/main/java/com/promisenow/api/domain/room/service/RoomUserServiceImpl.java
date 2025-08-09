package com.promisenow.api.domain.room.service;

import com.promisenow.api.domain.chat.exception.FileStorageException;
import com.promisenow.api.domain.room.dto.RoomUserRequestDto.*;
import com.promisenow.api.domain.room.dto.RoomUserResponseDto.*;
import com.promisenow.api.domain.room.entity.Room;
import com.promisenow.api.domain.room.entity.RoomUser;
import com.promisenow.api.domain.room.repository.RoomRepository;
import com.promisenow.api.domain.room.repository.RoomUserRepository;
import com.promisenow.api.domain.user.entity.User;
import com.promisenow.api.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
public class RoomUserServiceImpl implements RoomUserService {

    private final RoomRepository roomRepository;
    private final RoomUserRepository roomUserRepository;
    private final UserRepository userRepository;

    private final String uploadDir = "./uploaded-images/profile/";

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

        try {
            File uploadPath = new File(uploadDir);
            if (!uploadPath.exists()) uploadPath.mkdirs();

            String originalFilename = StringUtils.cleanPath(file.getOriginalFilename());
            String fileName = System.currentTimeMillis() + "_" + originalFilename;
            Path filePath = Paths.get(uploadDir, fileName);
            Files.write(filePath, file.getBytes());

            String imageUrl = ServletUriComponentsBuilder.fromCurrentContextPath()
                    .path("/uploaded-images/")
                    .path(fileName)
                    .toUriString();

            roomUser.updateProfileImage(imageUrl);
            return imageUrl;

        } catch (IOException e) {
            e.printStackTrace(); // 로그 출력
            throw new FileStorageException("프로필 이미지 저장 중 오류가 발생했습니다.");
        }
    }



} 