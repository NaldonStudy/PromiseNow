package com.promisenow.api.global.aop;

import com.promisenow.api.common.AppException;
import com.promisenow.api.common.ErrorCode;
import com.promisenow.api.common.ErrorMessage;
import com.promisenow.api.domain.room.entity.RoomUser;
import com.promisenow.api.domain.room.repository.RoomUserRepository;
import com.promisenow.api.global.annotation.RequireRoomMember;
import com.promisenow.api.global.security.OAuth2UserDetails;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Slf4j
@Aspect
@Component
@RequiredArgsConstructor
public class RoomMemberValidationAspect {

    private final RoomUserRepository roomUserRepository;

    @Before("@annotation(requireRoomMember)")
    public void validateRoomMember(JoinPoint joinPoint, RequireRoomMember requireRoomMember) {
        try {
            // 메서드 파라미터에서 roomId와 userId 추출
            Long roomId = extractRoomId(joinPoint, requireRoomMember.roomIdParam());
            Long userId = extractUserId(joinPoint, requireRoomMember.userIdParam());

            // 방 참여자 검증
            Optional<RoomUser> roomUser = roomUserRepository.findByRoom_RoomIdAndUser_UserId(roomId, userId);
            
            if (roomUser.isEmpty()) {
                throw new AppException(ErrorCode.UNAUTHORIZED, ErrorMessage.ROOM_USER_NOT_FOUND);
            }

            
        } catch (AppException e) {
            throw e;
        } catch (Exception e) {
            throw new AppException(ErrorCode.UNAUTHORIZED, ErrorMessage.ROOM_MEMBER_VALIDATION_ERROR);
        }
    }

    /**
     * 메서드 파라미터에서 roomId 추출
     */
    private Long extractRoomId(JoinPoint joinPoint, String roomIdParam) {
        Object[] args = joinPoint.getArgs();
        
        // @PathVariable로 받는 경우 순서로 추출
        for (Object arg : args) {
            if (arg instanceof Long) {
                return (Long) arg;
            }
        }
        
        throw new AppException(ErrorCode.BAD_REQUEST, ErrorMessage.BAD_REQUEST);
    }

    /**
     * 메서드 파라미터에서 userId 추출
     */
    private Long extractUserId(JoinPoint joinPoint, String userIdParam) {
        // userIdParam이 지정된 경우 해당 파라미터 찾기
        if (!userIdParam.isEmpty()) {
            Object[] args = joinPoint.getArgs();
            
            // @PathVariable로 받는 경우 순서로 추출
            Long[] longArgs = new Long[2];
            int longCount = 0;
            
            for (Object arg : args) {
                if (arg instanceof Long) {
                    longArgs[longCount++] = (Long) arg;
                }
            }
            
            // roomId와 userId가 모두 있는 경우, 두 번째 Long이 userId일 가능성이 높음
            if (longCount >= 2) {
                return longArgs[1]; // 두 번째 Long 파라미터
            }
        }
        
        // userIdParam이 지정되지 않은 경우 현재 인증된 사용자의 ID 사용
        return getCurrentUserId();
    }

    /**
     * 현재 인증된 사용자의 ID를 가져오는 헬퍼 메서드
     */
    private Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof OAuth2UserDetails) {
            OAuth2UserDetails userDetails = (OAuth2UserDetails) authentication.getPrincipal();
            return userDetails.getUserId();
        }
        
        throw new AppException(ErrorCode.UNAUTHORIZED, ErrorMessage.UNAUTHORIZED_ACCESS);
    }
}
