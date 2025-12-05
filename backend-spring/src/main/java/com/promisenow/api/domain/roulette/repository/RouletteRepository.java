package com.promisenow.api.domain.roulette.repository;

import com.promisenow.api.domain.roulette.entity.Roulette;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RouletteRepository extends JpaRepository<Roulette, Long> {

    // 룸ID로 해당 방의 룰렛 조회
    List<Roulette> findByRoomId(Long roomId);

    // 룰렛항목ID, 룸ID, 룸유저ID에 해당하는 룰렛 항목 삭제
    Optional<Roulette> findByRouletteIdAndRoomIdAndRoomUserId(Long rouletteId, Long roomId, Long roomUserId);
}
