package com.promisenow.api.domain.roulette.service;

import com.promisenow.api.domain.roulette.dto.RouletteRequestDto;
import com.promisenow.api.domain.roulette.dto.RouletteResponseDto;

import java.util.List;

public interface RouletteService {
    Long createRouletteContent(RouletteRequestDto dto);

    List<RouletteResponseDto> getAllContentsByRoomId(Long roomId);

    void updateRouletteContent(Long rouletteId, RouletteRequestDto dto);

    void deleteRouletteContent(Long rouletteId, Long roomId, Long roomUserId);
}
