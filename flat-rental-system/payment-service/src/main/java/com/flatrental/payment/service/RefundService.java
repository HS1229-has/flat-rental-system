package com.flatrental.payment.service;

import com.flatrental.payment.dto.RefundResponse;
import com.flatrental.payment.entity.Payment;

public interface RefundService {
    RefundResponse processRefund(Payment payment);
    java.util.List<RefundResponse> getRefundsByBooking(Long bookingId);
}
