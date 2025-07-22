package com.promisenow.api.infrastructure.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.promisenow.api.domain.entity.User;
import com.promisenow.api.domain.repository.UserRepository;

@Repository
public interface UserRepositoryImpl extends JpaRepository<User, Long>, UserRepository {
    
    @Override
    default User save(User user) {
        return saveAndFlush(user);
    }
    
    @Override
    default Optional<User> findById(Long userId) {
        return findById(userId);
    }
    
    @Override
    default Optional<User> findByUserName(String userName) {
        return findByUserName(userName);
    }
    
    @Override
    default Optional<User> findByRoomId(String roomId) {
        return findByRoomId(roomId);
    }
    
    @Override
    default List<User> findAll() {
        return findAll();
    }
    
    @Override
    default void deleteById(Long userId) {
        deleteById(userId);
    }
    
    @Override
    default boolean existsByUserName(String userName) {
        return existsByUserName(userName);
    }
    
    @Override
    default boolean existsById(Long userId) {
        return existsById(userId);
    }
} 