package com.flatrental.payment.controller;

import com.flatrental.payment.dto.PaymentRequest;
import com.flatrental.payment.dto.PaymentResponse;
import com.flatrental.payment.entity.PaymentStatus;
import com.flatrental.payment.service.PaymentService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @PostMapping
    public ResponseEntity<PaymentResponse> createPayment(@Valid @RequestBody PaymentRequest request,
                                                           @RequestHeader("X-User-Id") Long tenantId) {
        PaymentResponse response = paymentService.createPayment(request, tenantId);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<List<PaymentResponse>> getAllPayments() {
        return ResponseEntity.ok(paymentService.getAllPayments());
    }

    @GetMapping("/{id}")
    public ResponseEntity<PaymentResponse> getPaymentById(@PathVariable Long id) {
        return ResponseEntity.ok(paymentService.getPaymentById(id));
    }

    @GetMapping("/booking/{bookingId}")
    public ResponseEntity<List<PaymentResponse>> getPaymentsByBooking(@PathVariable Long bookingId) {
        return ResponseEntity.ok(paymentService.getPaymentsByBooking(bookingId));
    }

    @GetMapping("/tenant/{tenantId}")
    public ResponseEntity<List<PaymentResponse>> getPaymentsByTenant(@PathVariable Long tenantId) {
        return ResponseEntity.ok(paymentService.getPaymentsByTenant(tenantId));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<PaymentResponse> updateStatus(@PathVariable Long id,
                                                          @RequestParam PaymentStatus status) {
        return ResponseEntity.ok(paymentService.updateStatus(id, status));
    }

    @PostMapping("/{id}/refund")
    public ResponseEntity<com.flatrental.payment.dto.RefundResponse> initiateRefund(
            @PathVariable Long id,
            @RequestHeader("X-User-Id") Long currentUserId) {
        return ResponseEntity.ok(paymentService.initiateRefund(id, currentUserId));
    }

    @PostMapping("/booking/{bookingId}/refund")
    public ResponseEntity<List<com.flatrental.payment.dto.RefundResponse>> refundBookingPayments(
            @PathVariable Long bookingId,
            @RequestHeader("X-User-Id") Long currentUserId) {
        return ResponseEntity.ok(paymentService.refundBookingPayments(bookingId, currentUserId));
    }

    @GetMapping("/booking/{bookingId}/refunds")
    public ResponseEntity<List<com.flatrental.payment.dto.RefundResponse>> getRefundsByBooking(@PathVariable Long bookingId) {
        return ResponseEntity.ok(paymentService.getRefundsByBooking(bookingId));
    }
}
