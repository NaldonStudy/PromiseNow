package com.promisenow.api.domain.room.repository;

import com.promisenow.api.domain.room.entity.RoomUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RoomUserRepository extends JpaRepository<RoomUser, Long> {
    
    // 특정 룸의 모든 사용자 조회
    List<RoomUser> findByRoomRoomId(Long roomId);
} 