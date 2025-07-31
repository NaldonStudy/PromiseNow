package com.promisenow.api.domain.room.repository;

import com.promisenow.api.domain.room.entity.RoomUser;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RoomUserRepository extends JpaRepository<RoomUser, Long> {
    
    // 방에 참가
    boolean existsByRoom_RoomIdAndUser_UserId(Long roomId, Long userId);

    // 방에 참가한 사람들 목록 확인
    List<RoomUser> findByRoom_RoomId(Long roomId);

    // userId로 사용자 검색
    @Query("SELECT ru FROM RoomUser ru JOIN FETCH ru.room WHERE ru.user.userId = :userId")
    List<RoomUser> findByUserId(@Param("userId") Long userId);

    // roomId와 userId로 사용자 검색
    Optional<RoomUser> findByRoom_RoomIdAndUser_UserId(Long roomId, Long userId);
}