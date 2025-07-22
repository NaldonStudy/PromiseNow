package com.promisenow.api.domain.repository;

import java.util.List;
import java.util.Optional;

import com.promisenow.api.domain.entity.User;

public interface UserRepository {
    
    User save(User user);
    
    Optional<User> findById(Long userId);
    
    Optional<User> findByUserName(String userName);
    
    Optional<User> findByRoomId(String roomId);
    
    List<User> findAll();
    
    void deleteById(Long userId);
    
    boolean existsByUserName(String userName);
    
    boolean existsById(Long userId);
} 