package com.promisenow.api.domain.room.repository;

import com.promisenow.api.domain.room.entity.Room;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RoomRepository extends JpaRepository<Room, Long> {

    // 초대코드로 방 조회
    Optional<Room> findByInviteCode(String inviteCode);

    // 'SELECT COUNT(*) > 0 FROM room WHERE invite_code = ?' 의 역할과 같다. 있으면 true반환 없으면 false
    boolean existsByInviteCode(String inviteCode);
} 