package com.flatrental.booking.controller;

import com.flatrental.booking.dto.BookingRequest;
import com.flatrental.booking.dto.BookingResponse;
import com.flatrental.booking.dto.MeetupRequestDto;
import com.flatrental.booking.dto.TenantVerificationDto;
import com.flatrental.booking.entity.BookingStatus;
import com.flatrental.booking.service.BookingService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @PostMapping
    public ResponseEntity<BookingResponse> createBooking(@Valid @RequestBody BookingRequest request,
                                                           @RequestHeader("X-User-Id") Long tenantId) {
        BookingResponse response = bookingService.createBooking(request, tenantId);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<List<BookingResponse>> getAllBookings() {
        return ResponseEntity.ok(bookingService.getAllBookings());
    }

    @GetMapping("/{id}")
    public ResponseEntity<BookingResponse> getBookingById(@PathVariable Long id) {
        return ResponseEntity.ok(bookingService.getBookingById(id));
    }

    @GetMapping("/tenant/{tenantId}")
    public ResponseEntity<List<BookingResponse>> getBookingsByTenant(@PathVariable Long tenantId) {
        return ResponseEntity.ok(bookingService.getBookingsByTenant(tenantId));
    }

    @GetMapping("/property/{propertyId}")
    public ResponseEntity<List<BookingResponse>> getBookingsByProperty(@PathVariable Long propertyId) {
        return ResponseEntity.ok(bookingService.getBookingsByProperty(propertyId));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<BookingResponse> updateStatus(@PathVariable Long id,
                                                           @RequestParam BookingStatus status,
                                                           @RequestParam(required = false) String tokenPaymentReference) {
        return ResponseEntity.ok(bookingService.updateStatus(id, status, tokenPaymentReference));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> cancelBooking(@PathVariable Long id, @RequestParam(required = false) String reason) {
        bookingService.cancelBooking(id, reason);
        return ResponseEntity.noContent().build();
    }

    // -------------------------------------------------------------------------
    // Tenant Verification Endpoints
    // -------------------------------------------------------------------------

    @PostMapping("/{bookingId}/verification")
    public ResponseEntity<TenantVerificationDto> submitVerification(@PathVariable Long bookingId,
                                                                    @RequestBody TenantVerificationDto dto,
                                                                    @RequestHeader("X-User-Id") Long currentUserId) {
        TenantVerificationDto response = bookingService.submitVerification(bookingId, dto, currentUserId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{bookingId}/verification")
    public ResponseEntity<TenantVerificationDto> getVerification(@PathVariable Long bookingId,
                                                                 @RequestHeader("X-User-Id") Long currentUserId) {
        TenantVerificationDto response = bookingService.getVerification(bookingId, currentUserId);
        return ResponseEntity.ok(response);
    }

    // -------------------------------------------------------------------------
    // Profile-level Police Verification Endpoints
    // -------------------------------------------------------------------------

    @GetMapping("/tenant/{tenantId}/police-verification")
    public ResponseEntity<com.flatrental.booking.dto.PoliceVerificationDto> getPoliceVerification(
            @PathVariable Long tenantId,
            @RequestHeader("X-User-Id") Long currentUserId) {
        com.flatrental.booking.dto.PoliceVerificationDto response = bookingService.getPoliceVerification(tenantId, currentUserId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/tenant/{tenantId}/police-verification")
    public ResponseEntity<com.flatrental.booking.dto.PoliceVerificationDto> submitPoliceVerification(
            @PathVariable Long tenantId,
            @RequestBody com.flatrental.booking.dto.PoliceVerificationDto dto,
            @RequestHeader("X-User-Id") Long currentUserId) {
        com.flatrental.booking.dto.PoliceVerificationDto response = bookingService.submitPoliceVerification(tenantId, dto, currentUserId);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/tenant/{tenantId}/police-verification/status")
    public ResponseEntity<com.flatrental.booking.dto.PoliceVerificationDto> updatePoliceVerificationStatus(
            @PathVariable Long tenantId,
            @RequestParam String status,
            @RequestParam(required = false) String rejectionReason) {
        com.flatrental.booking.dto.PoliceVerificationDto response = bookingService.updatePoliceVerificationStatus(tenantId, status, rejectionReason);
        return ResponseEntity.ok(response);
    }

    // -------------------------------------------------------------------------
    // Meetup Request Endpoints
    // -------------------------------------------------------------------------

    @PostMapping("/{bookingId}/meetup")
    public ResponseEntity<MeetupRequestDto> createMeetup(@PathVariable Long bookingId,
                                                         @RequestBody MeetupRequestDto dto,
                                                         @RequestHeader("X-User-Id") Long currentUserId) {
        MeetupRequestDto response = bookingService.createMeetup(bookingId, dto, currentUserId);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/meetup/{id}/status")
    public ResponseEntity<MeetupRequestDto> updateMeetupStatus(@PathVariable Long id,
                                                               @RequestBody MeetupRequestDto dto,
                                                               @RequestHeader("X-User-Id") Long currentUserId) {
        MeetupRequestDto response = bookingService.updateMeetupStatus(id, dto, currentUserId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{bookingId}/meetups")
    public ResponseEntity<List<MeetupRequestDto>> getMeetupsByBooking(@PathVariable Long bookingId,
                                                                     @RequestHeader("X-User-Id") Long currentUserId) {
        return ResponseEntity.ok(bookingService.getMeetupsByBooking(bookingId, currentUserId));
    }

    @PostMapping("/{bookingId}/approve-with-contact")
    public ResponseEntity<BookingResponse> approveWithContactShare(@PathVariable Long bookingId,
                                                                   @RequestBody com.flatrental.booking.dto.OwnerContactShareDto contactDto,
                                                                   @RequestHeader("X-User-Id") Long currentUserId) {
        BookingResponse response = bookingService.approveWithContactShare(bookingId, contactDto, currentUserId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{bookingId}/owner-contact")
    public ResponseEntity<com.flatrental.booking.dto.OwnerContactShareDto> getOwnerContact(@PathVariable Long bookingId,
                                                                                           @RequestHeader("X-User-Id") Long currentUserId) {
        com.flatrental.booking.dto.OwnerContactShareDto response = bookingService.getOwnerContact(bookingId, currentUserId);
        return ResponseEntity.ok(response);
    }
}
