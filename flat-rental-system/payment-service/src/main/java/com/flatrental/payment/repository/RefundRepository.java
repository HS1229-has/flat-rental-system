package com.flatrental.payment.repository;

import com.flatrental.payment.entity.Refund;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface RefundRepository extends JpaRepository<Refund, Long> {
    List<Refund> findByBookingId(Long bookingId);
}
