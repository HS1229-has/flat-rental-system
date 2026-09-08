package com.flatrental.booking.verification;

import org.springframework.stereotype.Component;
import java.util.UUID;

@Component("manualVerificationProvider")
public class ManualVerificationProvider implements PoliceVerificationProvider {
    @Override
    public PoliceVerificationResult verify(Long tenantId, String documentData, String documentFileName) {
        String ref = "LF-MANUAL-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        return new PoliceVerificationResult("PENDING_VERIFICATION", ref, "Manual", "Document submitted successfully for manual verification.");
    }
}
