package com.promisenow.api.domain.chat.repository;

import com.promisenow.api.domain.chat.entity.Image;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;


@Repository
public interface ImageRepository extends JpaRepository<Image, Long> {
    Image findByChat_MessageId(Long messageId);
}
