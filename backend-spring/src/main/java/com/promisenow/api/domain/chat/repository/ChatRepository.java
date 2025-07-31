package com.promisenow.api.domain.chat.repository;


import com.promisenow.api.domain.chat.entity.Chat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatRepository extends JpaRepository<Chat, Long> {
    List<Chat> findByRoomUser_Room_RoomIdOrderBySentDateAsc(Long roomId);
}