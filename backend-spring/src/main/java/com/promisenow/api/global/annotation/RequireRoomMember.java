package com.promisenow.api.global.annotation;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * 방 참여자 검증을 위한 어노테이션
 * 해당 어노테이션이 붙은 메서드는 현재 사용자가 해당 방의 멤버인지 검증합니다.
 */
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface RequireRoomMember {
    
    /**
     * roomId 파라미터 이름 (기본값: "roomId")
     */
    String roomIdParam() default "roomId";
    
    /**
     * userId 파라미터 이름 (기본값: "userId")
     * null인 경우 현재 인증된 사용자의 ID 사용
     */
    String userIdParam() default "";
    
    /**
     * 검증 실패 시 예외 메시지
     */
    String message() default "방에 참여하지 않은 사용자입니다.";
}
