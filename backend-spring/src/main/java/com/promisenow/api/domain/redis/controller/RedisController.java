package com.promisenow.api.domain.redis.controller;

import com.promisenow.api.domain.redis.service.RedisService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/redis")
@RequiredArgsConstructor
public class RedisController {
    
    private final RedisService redisService;
    

} 