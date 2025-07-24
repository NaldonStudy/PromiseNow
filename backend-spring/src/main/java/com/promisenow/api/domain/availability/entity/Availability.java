package com.promisenow.api.domain.availability.entity;

import com.promisenow.api.domain.room.entity.RoomUser;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "Availability")
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Availability {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "availablity_id")
    private Long availabilityId;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_user_id", nullable = false)
    private RoomUser roomUser;
    
    @Column(name = "timedata", columnDefinition = "TEXT")
    private String timeData;
} 