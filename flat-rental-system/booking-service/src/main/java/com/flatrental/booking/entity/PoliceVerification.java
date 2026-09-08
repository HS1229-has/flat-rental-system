package com.flatrental.booking.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import java.time.LocalDateTime;

@Entity
@Table(name = "police_verifications")
public class PoliceVerification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "tenant_id", nullable = false, unique = true)
    private Long tenantId;

    @Column(name = "verification_type")
    private String verificationType;

    @Lob
    @Column(name = "document_data", columnDefinition = "LONGTEXT")
    private String documentData;

    @Column(name = "document_file_name")
    private String documentFileName;

    @Column(name = "status", nullable = false, length = 30)
    private String status; // NOT_SUBMITTED, PENDING_VERIFICATION, VERIFIED, REJECTED, VERIFICATION_FAILED

    @Column(name = "submitted_at")
    private LocalDateTime submittedAt;

    @Column(name = "verified_at")
    private LocalDateTime verifiedAt;

    @Column(name = "rejection_reason")
    private String rejectionReason;

    @Column(name = "verification_reference_number")
    private String verificationReferenceNumber;

    @Column(name = "verification_provider")
    private String verificationProvider;

    @Column(name = "last_updated_at")
    private LocalDateTime lastUpdatedAt;

    @PrePersist
    protected void onCreate() {
        this.submittedAt = LocalDateTime.now();
        this.lastUpdatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.lastUpdatedAt = LocalDateTime.now();
    }

    // Constructors
    public PoliceVerification() {
    }

    public PoliceVerification(Long id, Long tenantId, String verificationType, String documentData,
                              String documentFileName, String status, LocalDateTime submittedAt,
                              LocalDateTime verifiedAt, String rejectionReason, String verificationReferenceNumber,
                              String verificationProvider, LocalDateTime lastUpdatedAt) {
        this.id = id;
        this.tenantId = tenantId;
        this.verificationType = verificationType;
        this.documentData = documentData;
        this.documentFileName = documentFileName;
        this.status = status;
        this.submittedAt = submittedAt;
        this.verifiedAt = verifiedAt;
        this.rejectionReason = rejectionReason;
        this.verificationReferenceNumber = verificationReferenceNumber;
        this.verificationProvider = verificationProvider;
        this.lastUpdatedAt = lastUpdatedAt;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getTenantId() {
        return tenantId;
    }

    public void setTenantId(Long tenantId) {
        this.tenantId = tenantId;
    }

    public String getVerificationType() {
        return verificationType;
    }

    public void setVerificationType(String verificationType) {
        this.verificationType = verificationType;
    }

    public String getDocumentData() {
        return documentData;
    }

    public void setDocumentData(String documentData) {
        this.documentData = documentData;
    }

    public String getDocumentFileName() {
        return documentFileName;
    }

    public void setDocumentFileName(String documentFileName) {
        this.documentFileName = documentFileName;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getSubmittedAt() {
        return submittedAt;
    }

    public void setSubmittedAt(LocalDateTime submittedAt) {
        this.submittedAt = submittedAt;
    }

    public LocalDateTime getVerifiedAt() {
        return verifiedAt;
    }

    public void setVerifiedAt(LocalDateTime verifiedAt) {
        this.verifiedAt = verifiedAt;
    }

    public String getRejectionReason() {
        return rejectionReason;
    }

    public void setRejectionReason(String rejectionReason) {
        this.rejectionReason = rejectionReason;
    }

    public String getVerificationReferenceNumber() {
        return verificationReferenceNumber;
    }

    public void setVerificationReferenceNumber(String verificationReferenceNumber) {
        this.verificationReferenceNumber = verificationReferenceNumber;
    }

    public String getVerificationProvider() {
        return verificationProvider;
    }

    public void setVerificationProvider(String verificationProvider) {
        this.verificationProvider = verificationProvider;
    }

    public LocalDateTime getLastUpdatedAt() {
        return lastUpdatedAt;
    }

    public void setLastUpdatedAt(LocalDateTime lastUpdatedAt) {
        this.lastUpdatedAt = lastUpdatedAt;
    }
}
