package com.flatrental.booking.verification;

import org.springframework.stereotype.Component;

@Component("futureCCTNSProvider")
public class FutureCCTNSProvider implements PoliceVerificationProvider {
    @Override
    public PoliceVerificationResult verify(Long tenantId, String documentData, String documentFileName) {
        throw new UnsupportedOperationException("CCTNS Government API Integration is currently unavailable.");
    }
}
