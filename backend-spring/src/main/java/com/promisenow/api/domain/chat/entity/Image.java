package com.promisenow.api.domain.chat.entity;



import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name="image")
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Image {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "image_id")
    private Long imageId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "message_id", nullable = false)
    private Chat chat;

    @Column(name = "image_url", nullable = false)
    private String imageUrl;

    @Column(name = "location_lat")
    private Double lat;

    @Column(name = "location_lng")
    private Double lng;

    @Column(name = "sent_date")
    private LocalDateTime sentDate;

}
