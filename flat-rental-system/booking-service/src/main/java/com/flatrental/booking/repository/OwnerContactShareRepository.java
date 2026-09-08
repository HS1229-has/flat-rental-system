package com.flatrental.booking.repository;

import com.flatrental.booking.entity.OwnerContactShare;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface OwnerContactShareRepository extends JpaRepository<OwnerContactShare, Long> {

    Optional<OwnerContactShare> findByBookingId(Long bookingId);
}
