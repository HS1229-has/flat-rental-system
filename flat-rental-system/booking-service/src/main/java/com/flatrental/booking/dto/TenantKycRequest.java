package com.flatrental.booking.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public class TenantKycRequest {

    @NotBlank(message = "Full name is required")
    private String fullName;

    @NotBlank(message = "Aadhaar number is required")
    @Pattern(regexp = "^\\d{12}$", message = "Aadhaar number must be exactly 12 digits")
    private String aadhaarNumber;

    @NotBlank(message = "PAN number is required")
    @Pattern(regexp = "^[A-Z]{5}[0-9]{4}[A-Z]{1}$", message = "PAN must be a valid 10-character code (e.g. ABCDE1234F)")
    private String panNumber;

    private String companyName;

    private Double monthlyIncome;

    public TenantKycRequest() {}

    public TenantKycRequest(String fullName, String aadhaarNumber, String panNumber, String companyName, Double monthlyIncome) {
        this.fullName = fullName;
        this.aadhaarNumber = aadhaarNumber;
        this.panNumber = panNumber;
        this.companyName = companyName;
        this.monthlyIncome = monthlyIncome;
    }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getAadhaarNumber() { return aadhaarNumber; }
    public void setAadhaarNumber(String aadhaarNumber) { this.aadhaarNumber = aadhaarNumber; }

    public String getPanNumber() { return panNumber; }
    public void setPanNumber(String panNumber) { this.panNumber = panNumber; }

    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }

    public Double getMonthlyIncome() { return monthlyIncome; }
    public void setMonthlyIncome(Double monthlyIncome) { this.monthlyIncome = monthlyIncome; }
}
