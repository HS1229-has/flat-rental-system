package com.flatrental.payment.service;

import com.flatrental.payment.dto.PaymentRequest;
import com.flatrental.payment.dto.PaymentResponse;
import com.flatrental.payment.dto.RefundResponse;
import com.flatrental.payment.entity.PaymentStatus;
import java.util.List;

public interface PaymentService {
    PaymentResponse createPayment(PaymentRequest request, Long tenantId);
    List<PaymentResponse> getAllPayments();
    PaymentResponse getPaymentById(Long id);
    List<PaymentResponse> getPaymentsByBooking(Long bookingId);
    List<PaymentResponse> getPaymentsByTenant(Long tenantId);
    PaymentResponse updateStatus(Long id, PaymentStatus status);
    RefundResponse initiateRefund(Long paymentId, Long currentUserId);
    List<RefundResponse> refundBookingPayments(Long bookingId, Long currentUserId);
    List<RefundResponse> getRefundsByBooking(Long bookingId);
}
