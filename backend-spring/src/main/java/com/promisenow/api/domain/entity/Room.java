package com.promisenow.api.domain.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Entity
@Table(name = "rooms")
public class Room {
    
    @Id
    @Column(name = "roomId", length = 36)
    private String roomId; // UUID
    
    @NotBlank
    @Column(name = "room_title")
    private String roomTitle;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @NotNull
    @Column(name = "created_by")
    private Long createdBy;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "room_state")
    private RoomState roomState;
    
    @Column(name = "location_date")
    private LocalDateTime locationDate;
    
    @Column(name = "location_name")
    private String locationName;
    
    @Column(name = "location_lat")
    private Double locationLat;
    
    @Column(name = "location_lng")
    private Double locationLng;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
    
    // Getters and Setters
    public String getRoomId() {
        return roomId;
    }
    
    public void setRoomId(String roomId) {
        this.roomId = roomId;
    }
    
    public String getRoomTitle() {
        return roomTitle;
    }
    
    public void setRoomTitle(String roomTitle) {
        this.roomTitle = roomTitle;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public Long getCreatedBy() {
        return createdBy;
    }
    
    public void setCreatedBy(Long createdBy) {
        this.createdBy = createdBy;
    }
    
    public RoomState getRoomState() {
        return roomState;
    }
    
    public void setRoomState(RoomState roomState) {
        this.roomState = roomState;
    }
    
    public LocalDateTime getLocationDate() {
        return locationDate;
    }
    
    public void setLocationDate(LocalDateTime locationDate) {
        this.locationDate = locationDate;
    }
    
    public String getLocationName() {
        return locationName;
    }
    
    public void setLocationName(String locationName) {
        this.locationName = locationName;
    }
    
    public Double getLocationLat() {
        return locationLat;
    }
    
    public void setLocationLat(Double locationLat) {
        this.locationLat = locationLat;
    }
    
    public Double getLocationLng() {
        return locationLng;
    }
    
    public void setLocationLng(Double locationLng) {
        this.locationLng = locationLng;
    }
    
    public enum RoomState {
        PLANNING, ACTIVE, FINISHED, CANCELLED
    }
} 