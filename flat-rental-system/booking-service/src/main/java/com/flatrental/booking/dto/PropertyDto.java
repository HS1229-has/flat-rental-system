package com.flatrental.booking.dto;

import java.math.BigDecimal;

/**
 * Lightweight local copy of the fields booking-service needs from
 * property-service's PropertyResponse, used when calling that service
 * over HTTP. Kept intentionally minimal for Day 1.
 */
public class PropertyDto {

    private Long id;
    private Long ownerId;
    private String title;
    private BigDecimal rentAmount;
    private boolean available;

    // -------------------------------------------------------------------------
    // No-arg constructor
    // -------------------------------------------------------------------------

    public PropertyDto() {
    }

    // -------------------------------------------------------------------------
    // All-args constructor
    // -------------------------------------------------------------------------

    public PropertyDto(Long id, Long ownerId, String title, BigDecimal rentAmount, boolean available) {
        this.id = id;
        this.ownerId = ownerId;
        this.title = title;
        this.rentAmount = rentAmount;
        this.available = available;
    }

    // -------------------------------------------------------------------------
    // Getters
    // -------------------------------------------------------------------------

    public Long getId() {
        return id;
    }

    public Long getOwnerId() {
        return ownerId;
    }

    public String getTitle() {
        return title;
    }

    public BigDecimal getRentAmount() {
        return rentAmount;
    }

    public boolean isAvailable() {
        return available;
    }

    // -------------------------------------------------------------------------
    // Setters
    // -------------------------------------------------------------------------

    public void setId(Long id) {
        this.id = id;
    }

    public void setOwnerId(Long ownerId) {
        this.ownerId = ownerId;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public void setRentAmount(BigDecimal rentAmount) {
        this.rentAmount = rentAmount;
    }

    public void setAvailable(boolean available) {
        this.available = available;
    }
}
