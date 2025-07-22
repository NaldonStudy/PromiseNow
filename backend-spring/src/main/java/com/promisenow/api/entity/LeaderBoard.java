package com.promisenow.api.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

@Entity
@Table(name = "leader_board")
public class LeaderBoard {
    
    @Id
    @Column(name = "roomId", length = 36)
    private String roomId;
    
    @Column(name = "first_arrival_user_id")
    private Long firstArrivalUserId;
    
    @Column(name = "first_arrival_time")
    private LocalDateTime firstArrivalTime;
    
    @Column(name = "last_arrival_user_id")
    private Long lastArrivalUserId;
    
    @Column(name = "last_arrival_time")
    private LocalDateTime lastArrivalTime;
    
    @Column(name = "total_participants")
    private Integer totalParticipants = 0;
    
    @Column(name = "arrived_participants")
    private Integer arrivedParticipants = 0;
    
    @Column(name = "average_travel_time")
    private Double averageTravelTime;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
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
    
    public Long getFirstArrivalUserId() {
        return firstArrivalUserId;
    }
    
    public void setFirstArrivalUserId(Long firstArrivalUserId) {
        this.firstArrivalUserId = firstArrivalUserId;
    }
    
    public LocalDateTime getFirstArrivalTime() {
        return firstArrivalTime;
    }
    
    public void setFirstArrivalTime(LocalDateTime firstArrivalTime) {
        this.firstArrivalTime = firstArrivalTime;
    }
    
    public Long getLastArrivalUserId() {
        return lastArrivalUserId;
    }
    
    public void setLastArrivalUserId(Long lastArrivalUserId) {
        this.lastArrivalUserId = lastArrivalUserId;
    }
    
    public LocalDateTime getLastArrivalTime() {
        return lastArrivalTime;
    }
    
    public void setLastArrivalTime(LocalDateTime lastArrivalTime) {
        this.lastArrivalTime = lastArrivalTime;
    }
    
    public Integer getTotalParticipants() {
        return totalParticipants;
    }
    
    public void setTotalParticipants(Integer totalParticipants) {
        this.totalParticipants = totalParticipants;
    }
    
    public Integer getArrivedParticipants() {
        return arrivedParticipants;
    }
    
    public void setArrivedParticipants(Integer arrivedParticipants) {
        this.arrivedParticipants = arrivedParticipants;
    }
    
    public Double getAverageTravelTime() {
        return averageTravelTime;
    }
    
    public void setAverageTravelTime(Double averageTravelTime) {
        this.averageTravelTime = averageTravelTime;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
} 