package com.flatrental.booking.repository;

import com.flatrental.booking.entity.TenantVerification;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface TenantVerificationRepository extends JpaRepository<TenantVerification, Long> {

    Optional<TenantVerification> findByBookingId(Long bookingId);
}
