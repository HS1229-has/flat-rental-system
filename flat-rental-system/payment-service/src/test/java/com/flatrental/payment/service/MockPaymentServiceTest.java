package com.flatrental.payment.service;

import com.flatrental.payment.dto.PaymentRequest;
import com.flatrental.payment.dto.PaymentResponse;
import com.flatrental.payment.dto.RefundResponse;
import com.flatrental.payment.entity.Payment;
import com.flatrental.payment.entity.PaymentMethod;
import com.flatrental.payment.entity.PaymentStatus;
import com.flatrental.payment.exception.PaymentProcessingException;
import com.flatrental.payment.exception.ResourceNotFoundException;
import com.flatrental.payment.repository.PaymentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MockPaymentServiceTest {

    @Mock
    private PaymentRepository paymentRepository;

    @Mock
    private RefundService refundService;

    @InjectMocks
    private MockPaymentService paymentService;

    private Payment sampleTokenPayment;

    @BeforeEach
    void setUp() {
        sampleTokenPayment = Payment.builder()
                .id(1L)
                .bookingId(100L)
                .tenantId(200L)
                .amount(new BigDecimal("5000.00"))
                .paymentMethod(PaymentMethod.CARD)
                .paymentType("TOKEN")
                .status(PaymentStatus.COMPLETED)
                .transactionReference("LF-TXN-TOKEN123")
                .build();
    }

    @Test
    @DisplayName("Should successfully create a token payment")
    void testCreatePayment_TokenSuccess() {
        PaymentRequest request = new PaymentRequest();
        request.setBookingId(100L);
        request.setAmount(new BigDecimal("5000.00"));
        request.setPaymentMethod(PaymentMethod.CARD);
        request.setPaymentType("TOKEN");

        when(paymentRepository.findByBookingId(100L)).thenReturn(List.of());
        when(paymentRepository.save(any(Payment.class))).thenAnswer(inv -> {
            Payment p = inv.getArgument(0);
            p.setId(1L);
            return p;
        });

        PaymentResponse response = paymentService.createPayment(request, 200L);

        assertNotNull(response);
        assertEquals(1L, response.getId());
        assertEquals(PaymentStatus.COMPLETED, response.getStatus());
        assertEquals("TOKEN", response.getPaymentType());
        assertTrue(response.getTransactionReference().startsWith("LF-TXN-"));
        verify(paymentRepository, times(1)).save(any(Payment.class));
    }

    @Test
    @DisplayName("Should throw PaymentProcessingException on duplicate token payment for same booking")
    void testCreatePayment_DuplicateToken_ThrowsException() {
        PaymentRequest request = new PaymentRequest();
        request.setBookingId(100L);
        request.setAmount(new BigDecimal("5000.00"));
        request.setPaymentMethod(PaymentMethod.CARD);
        request.setPaymentType("TOKEN");

        when(paymentRepository.findByBookingId(100L)).thenReturn(List.of(sampleTokenPayment));

        assertThrows(PaymentProcessingException.class, () -> paymentService.createPayment(request, 200L));
        verify(paymentRepository, never()).save(any(Payment.class));
    }

    @Test
    @DisplayName("Should allow rent payment even if token payment already succeeded (different paymentType)")
    void testCreatePayment_RentPaymentAfterToken_Success() {
        PaymentRequest rentRequest = new PaymentRequest();
        rentRequest.setBookingId(100L);
        rentRequest.setAmount(new BigDecimal("25000.00"));
        rentRequest.setPaymentMethod(PaymentMethod.UPI);
        rentRequest.setPaymentType("RENT");

        // Existing token payment in repository
        when(paymentRepository.findByBookingId(100L)).thenReturn(List.of(sampleTokenPayment));
        when(paymentRepository.save(any(Payment.class))).thenAnswer(inv -> {
            Payment p = inv.getArgument(0);
            p.setId(2L);
            return p;
        });

        PaymentResponse response = paymentService.createPayment(rentRequest, 200L);

        assertNotNull(response);
        assertEquals(2L, response.getId());
        assertEquals(PaymentStatus.COMPLETED, response.getStatus());
        assertEquals("RENT", response.getPaymentType());
        verify(paymentRepository, times(1)).save(any(Payment.class));
    }

    @Test
    @DisplayName("Should return payment by ID when found")
    void testGetPaymentById_Success() {
        when(paymentRepository.findById(1L)).thenReturn(Optional.of(sampleTokenPayment));

        PaymentResponse response = paymentService.getPaymentById(1L);

        assertNotNull(response);
        assertEquals(1L, response.getId());
        assertEquals(new BigDecimal("5000.00"), response.getAmount());
    }

    @Test
    @DisplayName("Should throw ResourceNotFoundException when payment ID not found")
    void testGetPaymentById_NotFound() {
        when(paymentRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> paymentService.getPaymentById(999L));
    }

    @Test
    @DisplayName("Should return all payments for a given booking ID")
    void testGetPaymentsByBooking() {
        when(paymentRepository.findByBookingId(100L)).thenReturn(List.of(sampleTokenPayment));

        List<PaymentResponse> results = paymentService.getPaymentsByBooking(100L);

        assertNotNull(results);
        assertEquals(1, results.size());
        assertEquals(100L, results.get(0).getBookingId());
    }

    @Test
    @DisplayName("Should return all payments for a given tenant ID")
    void testGetPaymentsByTenant() {
        when(paymentRepository.findByTenantId(200L)).thenReturn(List.of(sampleTokenPayment));

        List<PaymentResponse> results = paymentService.getPaymentsByTenant(200L);

        assertNotNull(results);
        assertEquals(1, results.size());
        assertEquals(200L, results.get(0).getTenantId());
    }

    @Test
    @DisplayName("Should update payment status successfully")
    void testUpdateStatus_Success() {
        when(paymentRepository.findById(1L)).thenReturn(Optional.of(sampleTokenPayment));
        when(paymentRepository.save(any(Payment.class))).thenAnswer(inv -> inv.getArgument(0));

        PaymentResponse response = paymentService.updateStatus(1L, PaymentStatus.REFUNDED);

        assertNotNull(response);
        assertEquals(PaymentStatus.REFUNDED, response.getStatus());
    }

    @Test
    @DisplayName("Should process refund for completed payment successfully")
    void testInitiateRefund_Success() {
        when(paymentRepository.findById(1L)).thenReturn(Optional.of(sampleTokenPayment));

        RefundResponse mockRefund = new RefundResponse();
        mockRefund.setRefundReference("REFUND-12345");
        mockRefund.setRefundStatus("REFUNDED");
        mockRefund.setRefundAmount(new BigDecimal("5000.00"));
        when(refundService.processRefund(sampleTokenPayment)).thenReturn(mockRefund);

        RefundResponse response = paymentService.initiateRefund(1L, 200L);

        assertNotNull(response);
        assertEquals("REFUNDED", response.getRefundStatus());
        assertEquals(PaymentStatus.REFUNDED, sampleTokenPayment.getStatus());
        verify(refundService, times(1)).processRefund(sampleTokenPayment);
    }

    @Test
    @DisplayName("Should reject refund for non-completed payment")
    void testInitiateRefund_PendingPayment_ThrowsException() {
        sampleTokenPayment.setStatus(PaymentStatus.PENDING);
        when(paymentRepository.findById(1L)).thenReturn(Optional.of(sampleTokenPayment));

        assertThrows(PaymentProcessingException.class, () -> paymentService.initiateRefund(1L, 200L));
        verify(refundService, never()).processRefund(any());
    }
}
