package com.promisenow.api.domain.availability.entity;

import com.promisenow.api.domain.room.entity.RoomUser;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Table(name = "availability")
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Availability {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "availability_id")
    private Long availabilityId;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_user_id", nullable = false)
    private RoomUser roomUser;
    
    @Column(name = "timedata", columnDefinition = "TEXT", nullable = false)
    private String timeData;
    
    @Column(name = "date", nullable = false)
    private LocalDate date;
} 