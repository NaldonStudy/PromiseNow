package com.promisenow.api.domain.chat.repository;

import com.promisenow.api.domain.chat.entity.Image;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;


@Repository
public interface ImageRepository extends JpaRepository<Image, Long> {
    Image findByChat_MessageId(Long messageId);

    @Query("SELECT i FROM Image i JOIN i.chat c JOIN c.roomUser ru JOIN ru.room r WHERE r.roomId = :roomId ORDER BY c.sentDate ASC")
    List<Image> findAllByRoomId(@Param("roomId") Long roomId);
}
