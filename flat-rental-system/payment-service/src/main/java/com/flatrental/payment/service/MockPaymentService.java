package com.flatrental.payment.service;

import com.flatrental.payment.dto.PaymentRequest;
import com.flatrental.payment.dto.PaymentResponse;
import com.flatrental.payment.dto.RefundResponse;
import com.flatrental.payment.entity.Payment;
import com.flatrental.payment.entity.PaymentStatus;
import com.flatrental.payment.exception.PaymentProcessingException;
import com.flatrental.payment.exception.ResourceNotFoundException;
import com.flatrental.payment.repository.PaymentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.math.BigDecimal;
import java.util.UUID;

@Service("mockPaymentService")
public class MockPaymentService implements PaymentService {

    private final PaymentRepository paymentRepository;
    private final RefundService refundService;

    public MockPaymentService(PaymentRepository paymentRepository, RefundService refundService) {
        this.paymentRepository = paymentRepository;
        this.refundService = refundService;
    }

    @Override
    @Transactional
    public PaymentResponse createPayment(PaymentRequest request, Long tenantId) {
        if (request.getAmount() == null || request.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new PaymentProcessingException("Payment amount must be greater than zero.");
        }
        // Prevent duplicate payments of the SAME TYPE for the same booking
        List<Payment> existingPayments = paymentRepository.findByBookingId(request.getBookingId());
        String reqType = request.getPaymentType();
        for (Payment p : existingPayments) {
            String pType = p.getPaymentType();
            // Default to TOKEN if null to support legacy database entries
            String normPType = (pType != null) ? pType : "TOKEN";
            String normReqType = (reqType != null) ? reqType : "TOKEN";

            if (normPType.equalsIgnoreCase(normReqType)) {
                if (p.getStatus() == PaymentStatus.SUCCESS || p.getStatus() == PaymentStatus.COMPLETED) {
                    throw new PaymentProcessingException(normReqType + " payment has already succeeded for this booking. Transaction Reference: " + p.getTransactionReference());
                }
            }
        }

        Payment payment = Payment.builder()
                .bookingId(request.getBookingId())
                .tenantId(tenantId)
                .amount(request.getAmount())
                .paymentMethod(request.getPaymentMethod())
                .paymentType(request.getPaymentType())
                .status(PaymentStatus.COMPLETED) // Instantly marked as COMPLETED for mock demo flow
                .transactionReference("LF-TXN-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                .build();

        Payment saved = paymentRepository.save(payment);
        return toResponse(saved);
    }

    @Override
    public List<PaymentResponse> getAllPayments() {
        return paymentRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public PaymentResponse getPaymentById(Long id) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found with id: " + id));
        return toResponse(payment);
    }

    @Override
    public List<PaymentResponse> getPaymentsByBooking(Long bookingId) {
        return paymentRepository.findByBookingId(bookingId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public List<PaymentResponse> getPaymentsByTenant(Long tenantId) {
        return paymentRepository.findByTenantId(tenantId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public PaymentResponse updateStatus(Long id, PaymentStatus status) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found with id: " + id));
        payment.setStatus(status);
        Payment updated = paymentRepository.save(payment);
        return toResponse(updated);
    }

    @Override
    @Transactional
    public RefundResponse initiateRefund(Long paymentId, Long currentUserId) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found with id: " + paymentId));

        if (!payment.getTenantId().equals(currentUserId)) {
            throw new PaymentProcessingException("You are not authorized to refund this payment.");
        }

        if (payment.getStatus() != PaymentStatus.COMPLETED && payment.getStatus() != PaymentStatus.SUCCESS) {
            throw new PaymentProcessingException("Only completed/successful payments can be refunded.");
        }



        // Set status to REFUND_PENDING initially
        payment.setStatus(PaymentStatus.REFUND_PENDING);
        paymentRepository.save(payment);

        // Process refund
        RefundResponse refundResp = refundService.processRefund(payment);

        // Complete refund status updates
        payment.setStatus(PaymentStatus.REFUNDED);
        paymentRepository.save(payment);

        return refundResp;
    }

    @Override
    @Transactional
    public List<RefundResponse> refundBookingPayments(Long bookingId, Long currentUserId) {
        List<Payment> bookingPayments = paymentRepository.findByBookingId(bookingId);
        List<RefundResponse> refunds = new java.util.ArrayList<>();
        
        for (Payment payment : bookingPayments) {
            if (payment.getStatus() == PaymentStatus.COMPLETED || payment.getStatus() == PaymentStatus.SUCCESS) {
                payment.setStatus(PaymentStatus.REFUND_PENDING);
                paymentRepository.save(payment);

                RefundResponse refundResp = refundService.processRefund(payment);

                payment.setStatus(PaymentStatus.REFUNDED);
                paymentRepository.save(payment);

                refunds.add(refundResp);
            }
        }
        return refunds;
    }

    @Override
    public List<RefundResponse> getRefundsByBooking(Long bookingId) {
        return refundService.getRefundsByBooking(bookingId);
    }

    private PaymentResponse toResponse(Payment payment) {
        return PaymentResponse.builder()
                .id(payment.getId())
                .bookingId(payment.getBookingId())
                .tenantId(payment.getTenantId())
                .amount(payment.getAmount())
                .paymentMethod(payment.getPaymentMethod())
                .status(payment.getStatus())
                .transactionReference(payment.getTransactionReference())
                .createdAt(payment.getCreatedAt())
                .updatedAt(payment.getUpdatedAt())
                .paymentType(payment.getPaymentType())
                .build();
    }
}
