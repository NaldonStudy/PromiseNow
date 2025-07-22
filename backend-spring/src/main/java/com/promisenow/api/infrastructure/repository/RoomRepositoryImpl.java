package com.promisenow.api.infrastructure.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.promisenow.api.domain.entity.Room;
import com.promisenow.api.domain.repository.RoomRepository;

@Repository
public interface RoomRepositoryImpl extends JpaRepository<Room, String>, RoomRepository {
    
    @Override
    default Room save(Room room) {
        return saveAndFlush(room);
    }
    
    @Override
    default Optional<Room> findById(String roomId) {
        return findById(roomId);
    }
    
    @Override
    default List<Room> findByCreatedBy(Long createdBy) {
        return findByCreatedBy(createdBy);
    }
    
    @Override
    default List<Room> findByRoomState(Room.RoomState roomState) {
        return findByRoomState(roomState);
    }
    
    @Override
    default List<Room> findAll() {
        return findAll();
    }
    
    @Override
    default void deleteById(String roomId) {
        deleteById(roomId);
    }
    
    @Override
    default boolean existsById(String roomId) {
        return existsById(roomId);
    }
} 