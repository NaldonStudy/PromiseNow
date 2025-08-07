package com.promisenow.api.domain.roulette.service;

import com.promisenow.api.domain.roulette.dto.RouletteRequestDto;
import com.promisenow.api.domain.roulette.dto.RouletteResponseDto;
import com.promisenow.api.domain.roulette.entity.Roulette;
import com.promisenow.api.domain.roulette.repository.RouletteRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@Transactional
@RequiredArgsConstructor
public class RouletteServiceImpl implements RouletteService {

    private final RouletteRepository repository;

    @Override
    public Long createRouletteContent(RouletteRequestDto dto) {
        Roulette roulette = Roulette.builder()
                .roomId(dto.getRoomId())
                .roomUserId(dto.getRoomUserId())
                .content(dto.getContent())
                .build();

        return repository.save(roulette).getRouletteId();
    }

    @Override
    public List<RouletteResponseDto> getAllContentsByRoomId(Long roomId) {
        return repository.findByRoomId(roomId).stream()
                .map(item -> RouletteResponseDto.builder()
                        .rouletteId(item.getRouletteId())
                        .roomId(item.getRoomId())
                        .roomUserId(item.getRoomUserId())
                        .content(item.getContent())
                        .build())
                .toList();
    }

    @Override
    public void updateRouletteContent(Long rouletteId, RouletteRequestDto dto) {
        log.info("id={}, roomId={}, roomUserId={}", rouletteId, dto.getRoomId(), dto.getRoomUserId());
        Roulette roulette = repository.findByRouletteIdAndRoomIdAndRoomUserId(rouletteId, dto.getRoomId(), dto.getRoomUserId())
                .orElseThrow(() -> new RuntimeException("권한이 없거나 항목이 존재하지 않습니다."));

        roulette.updateContent(dto.getContent());

        repository.save(roulette);
    }

    @Override
    public void deleteRouletteContent(Long rouletteId, Long roomId, Long roomUserId) {
        Roulette roulette = repository.findByRouletteIdAndRoomIdAndRoomUserId(rouletteId, roomId, roomUserId)
                .orElseThrow(() -> new RuntimeException("권한이 없거나 항목이 존재하지 않습니다."));
        repository.delete(roulette);
    }
}
