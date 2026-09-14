package com.flatrental.booking.service;

import com.flatrental.booking.client.PropertyClient;
import com.flatrental.booking.dto.BookingRequest;
import com.flatrental.booking.dto.BookingResponse;
import com.flatrental.booking.dto.OwnerContactShareDto;
import com.flatrental.booking.dto.PropertyDto;
import com.flatrental.booking.dto.TenantVerificationDto;
import com.flatrental.booking.entity.Booking;
import com.flatrental.booking.entity.BookingStatus;
import com.flatrental.booking.exception.InvalidBookingException;
import com.flatrental.booking.exception.ResourceNotFoundException;
import com.flatrental.booking.repository.BookingRepository;
import com.flatrental.booking.repository.MeetupRequestRepository;
import com.flatrental.booking.repository.OwnerContactShareRepository;
import com.flatrental.booking.repository.PoliceVerificationRepository;
import com.flatrental.booking.repository.TenantVerificationRepository;
import com.flatrental.booking.verification.PoliceVerificationProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BookingServiceTest {

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private TenantVerificationRepository tenantVerificationRepository;

    @Mock
    private MeetupRequestRepository meetupRequestRepository;

    @Mock
    private PropertyClient propertyClient;

    @Mock
    private OwnerContactShareRepository ownerContactShareRepository;

    @Mock
    private PoliceVerificationRepository policeVerificationRepository;

    @Mock
    private PoliceVerificationProvider policeVerificationProvider;

    @InjectMocks
    private BookingService bookingService;

    private Booking sampleBooking;

    @BeforeEach
    void setUp() {
        sampleBooking = Booking.builder()
                .id(1L)
                .propertyId(100L)
                .tenantId(200L)
                .startDate(LocalDate.of(2026, 9, 1))
                .endDate(LocalDate.of(2026, 9, 30))
                .status(BookingStatus.APPLICATION_DRAFT)
                .build();
    }

    @Test
    @DisplayName("Should successfully create a booking draft")
    void testCreateBooking_Success() {
        BookingRequest request = new BookingRequest();
        request.setPropertyId(100L);
        request.setStartDate(LocalDate.of(2026, 9, 1));
        request.setEndDate(LocalDate.of(2026, 9, 30));

        when(bookingRepository.save(any(Booking.class))).thenAnswer(inv -> {
            Booking b = inv.getArgument(0);
            b.setId(1L);
            return b;
        });

        BookingResponse response = bookingService.createBooking(request, 200L);

        assertNotNull(response);
        assertEquals(1L, response.getId());
        assertEquals(BookingStatus.APPLICATION_DRAFT, response.getStatus());
        assertEquals(200L, response.getTenantId());
        verify(bookingRepository, times(1)).save(any(Booking.class));
    }

    @Test
    @DisplayName("Should create booking with PENDING_OWNER_APPROVAL if token payment reference is provided")
    void testCreateBooking_WithTokenPaymentReference() {
        BookingRequest request = new BookingRequest();
        request.setPropertyId(100L);
        request.setStartDate(LocalDate.of(2026, 9, 1));
        request.setEndDate(LocalDate.of(2026, 9, 30));
        request.setTokenPaymentReference("MOCK-TXN-12345");

        when(bookingRepository.save(any(Booking.class))).thenAnswer(inv -> {
            Booking b = inv.getArgument(0);
            b.setId(2L);
            return b;
        });

        BookingResponse response = bookingService.createBooking(request, 200L);

        assertNotNull(response);
        assertEquals(BookingStatus.PENDING_OWNER_APPROVAL, response.getStatus());
        assertEquals("MOCK-TXN-12345", response.getTokenPaymentReference());
    }

    @Test
    @DisplayName("Should throw InvalidBookingException when end date is before or equal to start date")
    void testCreateBooking_InvalidDates() {
        BookingRequest request = new BookingRequest();
        request.setPropertyId(100L);
        request.setStartDate(LocalDate.of(2026, 9, 30));
        request.setEndDate(LocalDate.of(2026, 9, 1)); // Invalid

        assertThrows(InvalidBookingException.class, () -> bookingService.createBooking(request, 200L));
        verify(bookingRepository, never()).save(any(Booking.class));
    }

    @Test
    @DisplayName("Should return booking by ID when found")
    void testGetBookingById_Success() {
        when(bookingRepository.findById(1L)).thenReturn(Optional.of(sampleBooking));

        BookingResponse response = bookingService.getBookingById(1L);

        assertNotNull(response);
        assertEquals(1L, response.getId());
        assertEquals(100L, response.getPropertyId());
    }

    @Test
    @DisplayName("Should throw ResourceNotFoundException when booking ID is not found")
    void testGetBookingById_NotFound() {
        when(bookingRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> bookingService.getBookingById(999L));
    }

    @Test
    @DisplayName("Should allow valid transition from APPLICATION_DRAFT to PENDING_OWNER_APPROVAL")
    void testUpdateStatus_ValidTransition() {
        when(bookingRepository.findById(1L)).thenReturn(Optional.of(sampleBooking));
        when(bookingRepository.save(any(Booking.class))).thenAnswer(inv -> inv.getArgument(0));

        BookingResponse updated = bookingService.updateStatus(1L, BookingStatus.PENDING_OWNER_APPROVAL, "TXN-999");

        assertNotNull(updated);
        assertEquals(BookingStatus.PENDING_OWNER_APPROVAL, updated.getStatus());
        assertEquals("TXN-999", updated.getTokenPaymentReference());
    }

    @Test
    @DisplayName("Should reject invalid state transition, e.g. already cancelled booking")
    void testUpdateStatus_AlreadyCancelled_ThrowsException() {
        sampleBooking.setStatus(BookingStatus.CANCELLED);
        when(bookingRepository.findById(1L)).thenReturn(Optional.of(sampleBooking));

        assertThrows(InvalidBookingException.class, () ->
                bookingService.updateStatus(1L, BookingStatus.CONFIRMED, null));
    }

    @Test
    @DisplayName("Should cancel booking successfully and save cancellation reason")
    void testCancelBooking_Success() {
        when(bookingRepository.findById(1L)).thenReturn(Optional.of(sampleBooking));
        when(meetupRequestRepository.findByBookingId(1L)).thenReturn(List.of());

        bookingService.cancelBooking(1L, "Found alternative flat");

        assertEquals(BookingStatus.CANCELLED, sampleBooking.getStatus());
        assertEquals("Found alternative flat", sampleBooking.getCancellationReason());
        verify(bookingRepository, times(1)).save(sampleBooking);
    }

    @Test
    @DisplayName("Should reject verification when monthly income is zero or negative")
    void testSubmitVerification_InvalidIncome() {
        when(bookingRepository.findById(1L)).thenReturn(Optional.of(sampleBooking));

        TenantVerificationDto dto = new TenantVerificationDto();
        dto.setMonthlyIncome("0");

        assertThrows(InvalidBookingException.class, () ->
                bookingService.submitVerification(1L, dto, 200L));
    }

    @Test
    @DisplayName("Should approve booking and record owner contact share")
    void testApproveWithContactShare_Success() {
        sampleBooking.setStatus(BookingStatus.PENDING_OWNER_APPROVAL);
        when(bookingRepository.findById(1L)).thenReturn(Optional.of(sampleBooking));

        PropertyDto mockProperty = new PropertyDto();
        mockProperty.setId(100L);
        mockProperty.setOwnerId(500L);
        when(propertyClient.getPropertyById(100L)).thenReturn(mockProperty);

        OwnerContactShareDto contactDto = new OwnerContactShareDto();
        contactDto.setFullName("John Owner");
        contactDto.setPhone("9876543210");
        contactDto.setEmail("owner@flat.com");
        contactDto.setPreferredContactMethod("PHONE");
        contactDto.setMessage("Welcome!");

        when(bookingRepository.save(any(Booking.class))).thenAnswer(inv -> inv.getArgument(0));

        BookingResponse response = bookingService.approveWithContactShare(1L, contactDto, 500L);

        assertNotNull(response);
        assertEquals(BookingStatus.CONFIRMED, response.getStatus());
        verify(ownerContactShareRepository, times(1)).save(any());
    }

    @Test
    @DisplayName("Should reject approval when called by unauthorized user")
    void testApproveWithContactShare_Unauthorized() {
        sampleBooking.setStatus(BookingStatus.PENDING_OWNER_APPROVAL);
        when(bookingRepository.findById(1L)).thenReturn(Optional.of(sampleBooking));

        PropertyDto mockProperty = new PropertyDto();
        mockProperty.setId(100L);
        mockProperty.setOwnerId(500L);
        when(propertyClient.getPropertyById(100L)).thenReturn(mockProperty);

        OwnerContactShareDto contactDto = new OwnerContactShareDto();

        assertThrows(InvalidBookingException.class, () ->
                bookingService.approveWithContactShare(1L, contactDto, 999L)); // Not owner
    }
    @Test
    @DisplayName("Should reject booking when start date is missing")
    void testCreateBooking_NullStartDate_ThrowsException() {
        BookingRequest request = new BookingRequest();
        request.setPropertyId(100L);
        request.setStartDate(null);
        request.setEndDate(LocalDate.of(2026, 9, 30));

        assertThrows(InvalidBookingException.class,
                () -> bookingService.createBooking(request, 200L));

        verify(bookingRepository, never()).save(any(Booking.class));
    }

    @Test
    @DisplayName("Should reject booking when end date is missing")
    void testCreateBooking_NullEndDate_ThrowsException() {
        BookingRequest request = new BookingRequest();
        request.setPropertyId(100L);
        request.setStartDate(LocalDate.of(2026, 9, 1));
        request.setEndDate(null);

        assertThrows(InvalidBookingException.class,
                () -> bookingService.createBooking(request, 200L));

        verify(bookingRepository, never()).save(any(Booking.class));
    }
}
