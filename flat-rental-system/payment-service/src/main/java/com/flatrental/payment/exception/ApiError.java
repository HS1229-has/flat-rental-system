package com.flatrental.payment.exception;

import java.time.LocalDateTime;
import java.util.List;

public class ApiError {

    private int status;
    private String message;
    private LocalDateTime timestamp;
    private List<String> details;

    // -------------------------------------------------------------------------
    // Constructors
    // -------------------------------------------------------------------------

    public ApiError() {
    }

    public ApiError(int status, String message, LocalDateTime timestamp, List<String> details) {
        this.status = status;
        this.message = message;
        this.timestamp = timestamp;
        this.details = details;
    }

    // -------------------------------------------------------------------------
    // Getters and Setters
    // -------------------------------------------------------------------------

    public int getStatus() {
        return status;
    }

    public void setStatus(int status) {
        this.status = status;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }

    public List<String> getDetails() {
        return details;
    }

    public void setDetails(List<String> details) {
        this.details = details;
    }

    // -------------------------------------------------------------------------
    // Builder
    // -------------------------------------------------------------------------

    public static Builder builder() {
        return new Builder();
    }

    public static final class Builder {

        private int status;
        private String message;
        private LocalDateTime timestamp;
        private List<String> details;

        private Builder() {
        }

        public Builder status(int status) {
            this.status = status;
            return this;
        }

        public Builder message(String message) {
            this.message = message;
            return this;
        }

        public Builder timestamp(LocalDateTime timestamp) {
            this.timestamp = timestamp;
            return this;
        }

        public Builder details(List<String> details) {
            this.details = details;
            return this;
        }

        public ApiError build() {
            return new ApiError(status, message, timestamp, details);
        }
    }
}
