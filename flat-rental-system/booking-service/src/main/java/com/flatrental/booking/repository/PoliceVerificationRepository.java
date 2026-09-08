package com.flatrental.booking.repository;

import com.flatrental.booking.entity.PoliceVerification;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface PoliceVerificationRepository extends JpaRepository<PoliceVerification, Long> {
    Optional<PoliceVerification> findByTenantId(Long tenantId);
}
