package com.promisenow.api.domain.chat.entity;


import com.promisenow.api.domain.redis.entity.UserRedis;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

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

    @Embedded
    @AttributeOverrides({
            @AttributeOverride(name = "lat", column = @Column(name = "location_lat")),
            @AttributeOverride(name = "lng", column = @Column(name = "location_lng")),
            @AttributeOverride(name = "timestamp", column = @Column(name = "location_timestamp"))
    })
    private UserRedis.LocationData location;

}
