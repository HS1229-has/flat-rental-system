package com.flatrental.payment.service;

import com.flatrental.payment.dto.RefundResponse;
import com.flatrental.payment.entity.Payment;
import com.flatrental.payment.entity.Refund;
import com.flatrental.payment.repository.RefundRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.UUID;

@Service("mockRefundService")
public class MockRefundService implements RefundService {

    private final RefundRepository refundRepository;

    public MockRefundService(RefundRepository refundRepository) {
        this.refundRepository = refundRepository;
    }

    @Override
    @Transactional
    public RefundResponse processRefund(Payment payment) {
        String ref = "LF-REFUND-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        
        Refund refund = new Refund();
        refund.setBookingId(payment.getBookingId());
        refund.setRefundReference(ref);
        refund.setRefundAmount(payment.getAmount());
        refund.setRefundStatus("REFUNDED");
        refund.setRefundInitiatedAt(LocalDateTime.now());
        refund.setRefundCompletedAt(LocalDateTime.now());

        Refund saved = refundRepository.save(refund);
        return toResponse(saved);
    }

    @Override
    public java.util.List<RefundResponse> getRefundsByBooking(Long bookingId) {
        return refundRepository.findByBookingId(bookingId).stream()
                .map(this::toResponse)
                .toList();
    }

    private RefundResponse toResponse(Refund r) {
        RefundResponse resp = new RefundResponse();
        resp.setId(r.getId());
        resp.setBookingId(r.getBookingId());
        resp.setRefundReference(r.getRefundReference());
        resp.setRefundAmount(r.getRefundAmount());
        resp.setRefundStatus(r.getRefundStatus());
        resp.setRefundInitiatedAt(r.getRefundInitiatedAt());
        resp.setRefundCompletedAt(r.getRefundCompletedAt());
        return resp;
    }
}
