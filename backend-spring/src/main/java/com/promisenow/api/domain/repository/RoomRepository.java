package com.promisenow.api.domain.repository;

import java.util.List;
import java.util.Optional;

import com.promisenow.api.domain.entity.Room;

public interface RoomRepository {
    
    Room save(Room room);
    
    Optional<Room> findById(String roomId);
    
    List<Room> findByCreatedBy(Long createdBy);
    
    List<Room> findByRoomState(Room.RoomState roomState);
    
    List<Room> findAll();
    
    void deleteById(String roomId);
    
    boolean existsById(String roomId);
} 