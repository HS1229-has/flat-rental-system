package com.flatrental.booking.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "meetup_requests")
public class MeetupRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "booking_id", nullable = false)
    private Long bookingId;

    @Column(name = "meeting_date")
    private String meetingDate;

    @Column(name = "meeting_time")
    private String meetingTime;

    @Column(name = "location")
    private String location;

    @Column(name = "message")
    private String message;

    @Column(name = "status", nullable = false)
    private String status = "PENDING"; // PENDING, ACCEPTED, RESCHEDULE_REQUESTED, DECLINED, COMPLETED

    @Column(name = "counter_date")
    private String counterDate;

    @Column(name = "counter_time")
    private String counterTime;

    @Column(name = "counter_message")
    private String counterMessage;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    // Constructors
    public MeetupRequest() {
    }

    public MeetupRequest(Long id, Long bookingId, String meetingDate, String meetingTime, String location,
                         String message, String status, String counterDate, String counterTime,
                         String counterMessage, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.bookingId = bookingId;
        this.meetingDate = meetingDate;
        this.meetingTime = meetingTime;
        this.location = location;
        this.message = message;
        this.status = status;
        this.counterDate = counterDate;
        this.counterTime = counterTime;
        this.counterMessage = counterMessage;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getBookingId() { return bookingId; }
    public void setBookingId(Long bookingId) { this.bookingId = bookingId; }

    public String getMeetingDate() { return meetingDate; }
    public void setMeetingDate(String meetingDate) { this.meetingDate = meetingDate; }

    public String getMeetingTime() { return meetingTime; }
    public void setMeetingTime(String meetingTime) { this.meetingTime = meetingTime; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getCounterDate() { return counterDate; }
    public void setCounterDate(String counterDate) { this.counterDate = counterDate; }

    public String getCounterTime() { return counterTime; }
    public void setCounterTime(String counterTime) { this.counterTime = counterTime; }

    public String getCounterMessage() { return counterMessage; }
    public void setCounterMessage(String counterMessage) { this.counterMessage = counterMessage; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
