package com.flatrental.booking.dto;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public class BookingRequest {

    @NotNull(message = "Property id is required")
    private Long propertyId;

    @NotNull(message = "Start date is required")
    @FutureOrPresent(message = "Start date must be in the present or future")
    private LocalDate startDate;

    @NotNull(message = "End date is required")
    @FutureOrPresent(message = "End date must be in the present or future")
    private LocalDate endDate;

    private String tokenPaymentReference;

    // No-arg constructor
    public BookingRequest() {
    }

    // Getters
    public Long getPropertyId() {
        return propertyId;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public String getTokenPaymentReference() {
        return tokenPaymentReference;
    }

    // Setters
    public void setPropertyId(Long propertyId) {
        this.propertyId = propertyId;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }

    public void setTokenPaymentReference(String tokenPaymentReference) {
        this.tokenPaymentReference = tokenPaymentReference;
    }
}
