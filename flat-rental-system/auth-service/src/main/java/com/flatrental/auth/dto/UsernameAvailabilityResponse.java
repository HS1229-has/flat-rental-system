package com.flatrental.auth.dto;

public class UsernameAvailabilityResponse {

    private boolean available;
    private String message;

    public UsernameAvailabilityResponse() {}

    public UsernameAvailabilityResponse(boolean available, String message) {
        this.available = available;
        this.message = message;
    }

    public boolean isAvailable() {
        return available;
    }

    public void setAvailable(boolean available) {
        this.available = available;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
