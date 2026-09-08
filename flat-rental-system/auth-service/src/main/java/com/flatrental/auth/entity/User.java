package com.flatrental.auth.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

/**
 * User entity stored in the auth-service database.
 * No Lombok – plain Java so the code is easy to read and works on any JDK.
 */
@Entity
@Table(name = "users", uniqueConstraints = {
        @UniqueConstraint(columnNames = "username"),
        @UniqueConstraint(columnNames = "email")
})
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 50)
    private String username;

    @Column(nullable = false, length = 100)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(name = "full_name", length = 100)
    private String fullName;

    @Column(name = "phone_number", length = 20)
    private String phoneNumber;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Role role;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "contact_phone", length = 20)
    private String contactPhone;

    @Column(name = "contact_email", length = 100)
    private String contactEmail;

    @Column(name = "preferred_contact_method", length = 20)
    private String preferredContactMethod;

    @Column(name = "contact_details_updated_at")
    private LocalDateTime contactDetailsUpdatedAt;

    // ── JPA required no-arg constructor ──────────────────────────────────────
    public User() {}

    // ── All-args constructor ──────────────────────────────────────────────────
    public User(Long id, String username, String email, String password,
                String fullName, String phoneNumber, Role role, LocalDateTime createdAt,
                String contactPhone, String contactEmail, String preferredContactMethod,
                LocalDateTime contactDetailsUpdatedAt) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.password = password;
        this.fullName = fullName;
        this.phoneNumber = phoneNumber;
        this.role = role;
        this.createdAt = createdAt;
        this.contactPhone = contactPhone;
        this.contactEmail = contactEmail;
        this.preferredContactMethod = preferredContactMethod;
        this.contactDetailsUpdatedAt = contactDetailsUpdatedAt;
    }

    // ── Getters ───────────────────────────────────────────────────────────────
    public Long getId() { return id; }
    public String getUsername() { return username; }
    public String getEmail() { return email; }
    public String getPassword() { return password; }
    public String getFullName() { return fullName; }
    public String getPhoneNumber() { return phoneNumber; }
    public Role getRole() { return role; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public String getContactPhone() { return contactPhone; }
    public String getContactEmail() { return contactEmail; }
    public String getPreferredContactMethod() { return preferredContactMethod; }
    public LocalDateTime getContactDetailsUpdatedAt() { return contactDetailsUpdatedAt; }

    // ── Setters ───────────────────────────────────────────────────────────────
    public void setId(Long id) { this.id = id; }
    public void setUsername(String username) { this.username = username; }
    public void setEmail(String email) { this.email = email; }
    public void setPassword(String password) { this.password = password; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }
    public void setRole(Role role) { this.role = role; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public void setContactPhone(String contactPhone) { this.contactPhone = contactPhone; }
    public void setContactEmail(String contactEmail) { this.contactEmail = contactEmail; }
    public void setPreferredContactMethod(String preferredContactMethod) { this.preferredContactMethod = preferredContactMethod; }
    public void setContactDetailsUpdatedAt(LocalDateTime contactDetailsUpdatedAt) { this.contactDetailsUpdatedAt = contactDetailsUpdatedAt; }

    // ── Lifecycle ─────────────────────────────────────────────────────────────
    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    // ── Static builder ────────────────────────────────────────────────────────
    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private Long id;
        private String username;
        private String email;
        private String password;
        private String fullName;
        private String phoneNumber;
        private Role role;
        private LocalDateTime createdAt;
        private String contactPhone;
        private String contactEmail;
        private String preferredContactMethod;
        private LocalDateTime contactDetailsUpdatedAt;

        public Builder id(Long id) { this.id = id; return this; }
        public Builder username(String username) { this.username = username; return this; }
        public Builder email(String email) { this.email = email; return this; }
        public Builder password(String password) { this.password = password; return this; }
        public Builder fullName(String fullName) { this.fullName = fullName; return this; }
        public Builder phoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; return this; }
        public Builder role(Role role) { this.role = role; return this; }
        public Builder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
        public Builder contactPhone(String contactPhone) { this.contactPhone = contactPhone; return this; }
        public Builder contactEmail(String contactEmail) { this.contactEmail = contactEmail; return this; }
        public Builder preferredContactMethod(String preferredContactMethod) { this.preferredContactMethod = preferredContactMethod; return this; }
        public Builder contactDetailsUpdatedAt(LocalDateTime contactDetailsUpdatedAt) { this.contactDetailsUpdatedAt = contactDetailsUpdatedAt; return this; }

        public User build() {
            return new User(id, username, email, password, fullName, phoneNumber, role, createdAt,
                    contactPhone, contactEmail, preferredContactMethod, contactDetailsUpdatedAt);
        }
    }
}
