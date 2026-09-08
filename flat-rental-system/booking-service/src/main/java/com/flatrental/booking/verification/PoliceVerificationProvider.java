package com.flatrental.booking.verification;

public interface PoliceVerificationProvider {
    PoliceVerificationResult verify(Long tenantId, String documentData, String documentFileName);
}
