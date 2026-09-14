package com.flatrental.booking.dto;

import java.time.LocalDateTime;

public class TenantKycResponse {

    private Long tenantId;
    private String fullName;
    private String aadhaarMasked;
    private String panMasked;
    private Integer cibilScore;
    private String creditRating;
    private boolean employmentVerified;
    private String companyName;
    private String kycStatus; // "VERIFIED", "PENDING", "REJECTED"
    private String riskLevel; // "LOW", "MODERATE", "HIGH"
    private String referenceNumber;
    private LocalDateTime verifiedAt;
    private String summary;

    public TenantKycResponse() {}

    public TenantKycResponse(Long tenantId, String fullName, String aadhaarMasked, String panMasked,
                             Integer cibilScore, String creditRating, boolean employmentVerified,
                             String companyName, String kycStatus, String riskLevel,
                             String referenceNumber, LocalDateTime verifiedAt, String summary) {
        this.tenantId = tenantId;
        this.fullName = fullName;
        this.aadhaarMasked = aadhaarMasked;
        this.panMasked = panMasked;
        this.cibilScore = cibilScore;
        this.creditRating = creditRating;
        this.employmentVerified = employmentVerified;
        this.companyName = companyName;
        this.kycStatus = kycStatus;
        this.riskLevel = riskLevel;
        this.referenceNumber = referenceNumber;
        this.verifiedAt = verifiedAt;
        this.summary = summary;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private Long tenantId;
        private String fullName;
        private String aadhaarMasked;
        private String panMasked;
        private Integer cibilScore;
        private String creditRating;
        private boolean employmentVerified;
        private String companyName;
        private String kycStatus;
        private String riskLevel;
        private String referenceNumber;
        private LocalDateTime verifiedAt;
        private String summary;

        public Builder tenantId(Long val) { this.tenantId = val; return this; }
        public Builder fullName(String val) { this.fullName = val; return this; }
        public Builder aadhaarMasked(String val) { this.aadhaarMasked = val; return this; }
        public Builder panMasked(String val) { this.panMasked = val; return this; }
        public Builder cibilScore(Integer val) { this.cibilScore = val; return this; }
        public Builder creditRating(String val) { this.creditRating = val; return this; }
        public Builder employmentVerified(boolean val) { this.employmentVerified = val; return this; }
        public Builder companyName(String val) { this.companyName = val; return this; }
        public Builder kycStatus(String val) { this.kycStatus = val; return this; }
        public Builder riskLevel(String val) { this.riskLevel = val; return this; }
        public Builder referenceNumber(String val) { this.referenceNumber = val; return this; }
        public Builder verifiedAt(LocalDateTime val) { this.verifiedAt = val; return this; }
        public Builder summary(String val) { this.summary = val; return this; }

        public TenantKycResponse build() {
            return new TenantKycResponse(tenantId, fullName, aadhaarMasked, panMasked, cibilScore,
                    creditRating, employmentVerified, companyName, kycStatus, riskLevel,
                    referenceNumber, verifiedAt, summary);
        }
    }

    public Long getTenantId() { return tenantId; }
    public void setTenantId(Long tenantId) { this.tenantId = tenantId; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getAadhaarMasked() { return aadhaarMasked; }
    public void setAadhaarMasked(String aadhaarMasked) { this.aadhaarMasked = aadhaarMasked; }

    public String getPanMasked() { return panMasked; }
    public void setPanMasked(String panMasked) { this.panMasked = panMasked; }

    public Integer getCibilScore() { return cibilScore; }
    public void setCibilScore(Integer cibilScore) { this.cibilScore = cibilScore; }

    public String getCreditRating() { return creditRating; }
    public void setCreditRating(String creditRating) { this.creditRating = creditRating; }

    public boolean isEmploymentVerified() { return employmentVerified; }
    public void setEmploymentVerified(boolean employmentVerified) { this.employmentVerified = employmentVerified; }

    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }

    public String getKycStatus() { return kycStatus; }
    public void setKycStatus(String kycStatus) { this.kycStatus = kycStatus; }

    public String getRiskLevel() { return riskLevel; }
    public void setRiskLevel(String riskLevel) { this.riskLevel = riskLevel; }

    public String getReferenceNumber() { return referenceNumber; }
    public void setReferenceNumber(String referenceNumber) { this.referenceNumber = referenceNumber; }

    public LocalDateTime getVerifiedAt() { return verifiedAt; }
    public void setVerifiedAt(LocalDateTime verifiedAt) { this.verifiedAt = verifiedAt; }

    public String getSummary() { return summary; }
    public void setSummary(String summary) { this.summary = summary; }
}
