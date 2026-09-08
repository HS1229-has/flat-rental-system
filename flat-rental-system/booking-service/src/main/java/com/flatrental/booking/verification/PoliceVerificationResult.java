package com.flatrental.booking.verification;

public class PoliceVerificationResult {
    private String status;
    private String referenceNumber;
    private String providerName;
    private String message;

    public PoliceVerificationResult(String status, String referenceNumber, String providerName, String message) {
        this.status = status;
        this.referenceNumber = referenceNumber;
        this.providerName = providerName;
        this.message = message;
    }

    public String getStatus() {
        return status;
    }

    public String getReferenceNumber() {
        return referenceNumber;
    }

    public String getProviderName() {
        return providerName;
    }

    public String getMessage() {
        return message;
    }
}
