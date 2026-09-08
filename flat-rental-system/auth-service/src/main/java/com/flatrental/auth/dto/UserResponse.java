package com.flatrental.auth.dto;

import java.time.LocalDateTime;

/**
 * Response returned after successful user registration (no password field!).
 * Plain Java – no Lombok dependency needed.
 */
public class UserResponse {

    private Long id;
    private String username;
    private String email;
    private String fullName;
    private String phoneNumber;
    private String role;
    private LocalDateTime createdAt;
    private String contactPhone;
    private String contactEmail;
    private String preferredContactMethod;
    private LocalDateTime contactDetailsUpdatedAt;

    public UserResponse() {}

    public UserResponse(Long id, String username, String email, String fullName,
                        String phoneNumber, String role, LocalDateTime createdAt,
                        String contactPhone, String contactEmail, String preferredContactMethod,
                        LocalDateTime contactDetailsUpdatedAt) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.fullName = fullName;
        this.phoneNumber = phoneNumber;
        this.role = role;
        this.createdAt = createdAt;
        this.contactPhone = contactPhone;
        this.contactEmail = contactEmail;
        this.preferredContactMethod = preferredContactMethod;
        this.contactDetailsUpdatedAt = contactDetailsUpdatedAt;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public String getContactPhone() { return contactPhone; }
    public void setContactPhone(String contactPhone) { this.contactPhone = contactPhone; }

    public String getContactEmail() { return contactEmail; }
    public void setContactEmail(String contactEmail) { this.contactEmail = contactEmail; }

    public String getPreferredContactMethod() { return preferredContactMethod; }
    public void setPreferredContactMethod(String preferredContactMethod) { this.preferredContactMethod = preferredContactMethod; }

    public LocalDateTime getContactDetailsUpdatedAt() { return contactDetailsUpdatedAt; }
    public void setContactDetailsUpdatedAt(LocalDateTime contactDetailsUpdatedAt) { this.contactDetailsUpdatedAt = contactDetailsUpdatedAt; }

    // Builder pattern
    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private Long id;
        private String username;
        private String email;
        private String fullName;
        private String phoneNumber;
        private String role;
        private LocalDateTime createdAt;
        private String contactPhone;
        private String contactEmail;
        private String preferredContactMethod;
        private LocalDateTime contactDetailsUpdatedAt;

        public Builder id(Long id) { this.id = id; return this; }
        public Builder username(String username) { this.username = username; return this; }
        public Builder email(String email) { this.email = email; return this; }
        public Builder fullName(String fullName) { this.fullName = fullName; return this; }
        public Builder phoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; return this; }
        public Builder role(String role) { this.role = role; return this; }
        public Builder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
        public Builder contactPhone(String contactPhone) { this.contactPhone = contactPhone; return this; }
        public Builder contactEmail(String contactEmail) { this.contactEmail = contactEmail; return this; }
        public Builder preferredContactMethod(String preferredContactMethod) { this.preferredContactMethod = preferredContactMethod; return this; }
        public Builder contactDetailsUpdatedAt(LocalDateTime contactDetailsUpdatedAt) { this.contactDetailsUpdatedAt = contactDetailsUpdatedAt; return this; }

        public UserResponse build() {
            return new UserResponse(id, username, email, fullName, phoneNumber, role, createdAt,
                    contactPhone, contactEmail, preferredContactMethod, contactDetailsUpdatedAt);
        }
    }
}
