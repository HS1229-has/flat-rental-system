package com.flatrental.booking.dto;

import java.time.LocalDateTime;

public class PoliceVerificationDto {
    private Long id;
    private Long tenantId;
    private String verificationType;
    private String documentData;
    private String documentFileName;
    private String status;
    private LocalDateTime submittedAt;
    private LocalDateTime verifiedAt;
    private String rejectionReason;
    private String verificationReferenceNumber;
    private String verificationProvider;
    private LocalDateTime lastUpdatedAt;

    public PoliceVerificationDto() {
    }

    public PoliceVerificationDto(Long id, Long tenantId, String verificationType, String documentData,
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
