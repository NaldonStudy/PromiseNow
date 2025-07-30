package com.promisenow.api.domain.room.service;

import com.promisenow.api.domain.room.entity.RoomUser;
import com.promisenow.api.domain.room.repository.RoomUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
@RequiredArgsConstructor
public class RoomUserServiceImpl implements RoomUserService {
    
    private final RoomUserRepository roomUserRepository;
} 