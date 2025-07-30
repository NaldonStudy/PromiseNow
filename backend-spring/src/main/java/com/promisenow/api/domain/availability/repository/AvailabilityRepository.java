package com.promisenow.api.domain.availability.repository;

import com.promisenow.api.domain.availability.entity.Availability;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface AvailabilityRepository extends JpaRepository<Availability, Long>, AvailabilityRepositoryCustom {
    
    // 특정 사용자의 모든 일정 조회
    List<Availability> findByRoomUserRoomUserIdOrderByDate(Long roomUserId);
    
    // 여러 사용자의 일정 조회
    List<Availability> findByRoomUserRoomUserIdIn(List<Long> roomUserIds);
    
    @Query("""
    SELECT a
    FROM Availability a
    JOIN a.roomUser ru
    WHERE ru.room.roomId = :roomId
    """)
    List<Availability> findAllByRoomId(@Param("roomId") Long roomId);
    
    // 특정 날짜와 룸의 일정 조회
    @Query("SELECT a FROM Availability a WHERE a.date = :date AND a.roomUser.room.roomId = :roomId")
    List<Availability> findByDateAndRoomUserRoomId(@Param("date") LocalDate date, @Param("roomId") Long roomId);
    
    // 특정 사용자의 특정 날짜 일정 조회
    List<Availability> findByRoomUserRoomUserIdAndDate(Long roomUserId, LocalDate date);
    
    // 특정 사용자의 여러 날짜 일정 조회 (배치 업데이트용)
    List<Availability> findByRoomUserRoomUserIdAndDateIn(Long roomUserId, List<LocalDate> dates);
} 