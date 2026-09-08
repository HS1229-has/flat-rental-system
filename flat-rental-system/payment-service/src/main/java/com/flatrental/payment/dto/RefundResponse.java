package com.flatrental.payment.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class RefundResponse {
    private Long id;
    private Long bookingId;
    private String refundReference;
    private BigDecimal refundAmount;
    private String refundStatus;
    private LocalDateTime refundInitiatedAt;
    private LocalDateTime refundCompletedAt;

    public RefundResponse() {
    }

    public RefundResponse(Long id, Long bookingId, String refundReference, BigDecimal refundAmount,
                          String refundStatus, LocalDateTime refundInitiatedAt, LocalDateTime refundCompletedAt) {
        this.id = id;
        this.bookingId = bookingId;
        this.refundReference = refundReference;
        this.refundAmount = refundAmount;
        this.refundStatus = refundStatus;
        this.refundInitiatedAt = refundInitiatedAt;
        this.refundCompletedAt = refundCompletedAt;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getBookingId() {
        return bookingId;
    }

    public void setBookingId(Long bookingId) {
        this.bookingId = bookingId;
    }

    public String getRefundReference() {
        return refundReference;
    }

    public void setRefundReference(String refundReference) {
        this.refundReference = refundReference;
    }

    public BigDecimal getRefundAmount() {
        return refundAmount;
    }

    public void setRefundAmount(BigDecimal refundAmount) {
        this.refundAmount = refundAmount;
    }

    public String getRefundStatus() {
        return refundStatus;
    }

    public void setRefundStatus(String refundStatus) {
        this.refundStatus = refundStatus;
    }

    public LocalDateTime getRefundInitiatedAt() {
        return refundInitiatedAt;
    }

    public void setRefundInitiatedAt(LocalDateTime refundInitiatedAt) {
        this.refundInitiatedAt = refundInitiatedAt;
    }

    public LocalDateTime getRefundCompletedAt() {
        return refundCompletedAt;
    }

    public void setRefundCompletedAt(LocalDateTime refundCompletedAt) {
        this.refundCompletedAt = refundCompletedAt;
    }
}
