package com.flatrental.booking.config;

import com.flatrental.booking.verification.FutureCCTNSProvider;
import com.flatrental.booking.verification.ManualVerificationProvider;
import com.flatrental.booking.verification.PoliceVerificationProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class VerificationConfig {

    @Value("${police.verification.provider:manual}")
    private String providerType;

    @Bean
    public PoliceVerificationProvider policeVerificationProvider(
            ManualVerificationProvider manual,
            FutureCCTNSProvider future) {
        if ("cctns".equalsIgnoreCase(providerType)) {
            return future;
        }
        return manual;
    }
}
