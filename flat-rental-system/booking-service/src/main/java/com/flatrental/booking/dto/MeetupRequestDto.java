package com.flatrental.booking.dto;

import java.time.LocalDateTime;

public class MeetupRequestDto {
    private Long id;
    private Long bookingId;
    private String meetingDate;
    private String meetingTime;
    private String location;
    private String message;
    private String status;
    private String counterDate;
    private String counterTime;
    private String counterMessage;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Constructors
    public MeetupRequestDto() {
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
