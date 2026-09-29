package com.flatrental.booking.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "tenant_kyc_records")
public class TenantKycRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "tenant_id", nullable = false, unique = true)
    private Long tenantId;

    @Column(name = "full_name")
    private String fullName;

    @Column(name = "aadhaar_masked", length = 30)
    private String aadhaarMasked;

    @Column(name = "pan_masked", length = 30)
    private String panMasked;

    @Column(name = "company_name")
    private String companyName;

    @Column(name = "monthly_income")
    private Double monthlyIncome;

    @Column(name = "cibil_score")
    private Integer cibilScore;

    @Column(name = "credit_rating", length = 30)
    private String creditRating;

    @Column(name = "kyc_status", nullable = false, length = 30)
    private String kycStatus; // NOT_STARTED, VERIFIED, FAILED

    @Column(name = "risk_level", length = 30)
    private String riskLevel;

    @Column(name = "reference_number", length = 100)
    private String referenceNumber;

    @Column(name = "summary", length = 1000)
    private String summary;

    @Column(name = "is_simulation")
    private Boolean isSimulation = true;

    @Column(name = "verified_at")
    private LocalDateTime verifiedAt;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.isSimulation == null) {
            this.isSimulation = true;
        }
    }

    public TenantKycRecord() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getTenantId() { return tenantId; }
    public void setTenantId(Long tenantId) { this.tenantId = tenantId; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getAadhaarMasked() { return aadhaarMasked; }
    public void setAadhaarMasked(String aadhaarMasked) { this.aadhaarMasked = aadhaarMasked; }

    public String getPanMasked() { return panMasked; }
    public void setPanMasked(String panMasked) { this.panMasked = panMasked; }

    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }

    public Double getMonthlyIncome() { return monthlyIncome; }
    public void setMonthlyIncome(Double monthlyIncome) { this.monthlyIncome = monthlyIncome; }

    public Integer getCibilScore() { return cibilScore; }
    public void setCibilScore(Integer cibilScore) { this.cibilScore = cibilScore; }

    public String getCreditRating() { return creditRating; }
    public void setCreditRating(String creditRating) { this.creditRating = creditRating; }

    public String getKycStatus() { return kycStatus; }
    public void setKycStatus(String kycStatus) { this.kycStatus = kycStatus; }

    public String getRiskLevel() { return riskLevel; }
    public void setRiskLevel(String riskLevel) { this.riskLevel = riskLevel; }

    public String getReferenceNumber() { return referenceNumber; }
    public void setReferenceNumber(String referenceNumber) { this.referenceNumber = referenceNumber; }

    public String getSummary() { return summary; }
    public void setSummary(String summary) { this.summary = summary; }

    public Boolean getIsSimulation() { return isSimulation; }
    public void setIsSimulation(Boolean isSimulation) { this.isSimulation = isSimulation; }

    public LocalDateTime getVerifiedAt() { return verifiedAt; }
    public void setVerifiedAt(LocalDateTime verifiedAt) { this.verifiedAt = verifiedAt; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
