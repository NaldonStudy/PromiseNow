package com.promisenow.api.domain.room.controller;

import com.promisenow.api.domain.room.service.RoomUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/room-users")
@RequiredArgsConstructor
public class RoomUserController {
    
    private final RoomUserService roomUserService;
    

} 