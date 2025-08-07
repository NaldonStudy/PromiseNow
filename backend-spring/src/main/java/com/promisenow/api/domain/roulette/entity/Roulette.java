package com.promisenow.api.domain.roulette.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "roulette")
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Roulette {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long rouletteId;

    @Column(name = "room_id")
    private Long roomId;

    @Column(name = "room_user_id")
    private Long roomUserId;

    @Column(name = "content")
    private String content;

    public void updateContent(String content) {
        this.content = content;
    }

}
