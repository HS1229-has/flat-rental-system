package com.flatrental.booking.service;

import com.flatrental.booking.client.PropertyClient;
import com.flatrental.booking.dto.*;
import com.flatrental.booking.entity.*;
import com.flatrental.booking.exception.InvalidBookingException;
import com.flatrental.booking.exception.ResourceNotFoundException;
import com.flatrental.booking.repository.BookingRepository;
import com.flatrental.booking.repository.MeetupRequestRepository;
import com.flatrental.booking.repository.TenantVerificationRepository;
import com.flatrental.booking.repository.PoliceVerificationRepository;
import com.flatrental.booking.verification.PoliceVerificationProvider;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class BookingService {

    private final BookingRepository bookingRepository;
    private final TenantVerificationRepository tenantVerificationRepository;
    private final MeetupRequestRepository meetupRequestRepository;
    private final PropertyClient propertyClient;
    private final com.flatrental.booking.repository.OwnerContactShareRepository ownerContactShareRepository;
    private final PoliceVerificationRepository policeVerificationRepository;
    private final PoliceVerificationProvider policeVerificationProvider;

    public BookingService(BookingRepository bookingRepository,
                          TenantVerificationRepository tenantVerificationRepository,
                          MeetupRequestRepository meetupRequestRepository,
                          PropertyClient propertyClient,
                          com.flatrental.booking.repository.OwnerContactShareRepository ownerContactShareRepository,
                          PoliceVerificationRepository policeVerificationRepository,
                          PoliceVerificationProvider policeVerificationProvider) {
        this.bookingRepository = bookingRepository;
        this.tenantVerificationRepository = tenantVerificationRepository;
        this.meetupRequestRepository = meetupRequestRepository;
        this.propertyClient = propertyClient;
        this.ownerContactShareRepository = ownerContactShareRepository;
        this.policeVerificationRepository = policeVerificationRepository;
        this.policeVerificationProvider = policeVerificationProvider;
    }

    @Transactional
    public BookingResponse createBooking(BookingRequest request, Long tenantId) {
        if (!request.getEndDate().isAfter(request.getStartDate())) {
            throw new InvalidBookingException("End date must be after start date");
        }

        BookingStatus initialStatus = BookingStatus.APPLICATION_DRAFT;
        if (request.getTokenPaymentReference() != null && !request.getTokenPaymentReference().trim().isEmpty()) {
            initialStatus = BookingStatus.PENDING_OWNER_APPROVAL;
        }

        Booking booking = Booking.builder()
                .propertyId(request.getPropertyId())
                .tenantId(tenantId)
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .status(initialStatus)
                .tokenPaymentReference(request.getTokenPaymentReference())
                .build();

        Booking saved = bookingRepository.save(booking);
        return toResponse(saved);
    }

    public List<BookingResponse> getAllBookings() {
        return bookingRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    public BookingResponse getBookingById(Long id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + id));
        return toResponse(booking);
    }

    public List<BookingResponse> getBookingsByTenant(Long tenantId) {
        return bookingRepository.findByTenantId(tenantId).stream()
                .map(this::toResponse)
                .toList();
    }

    public List<BookingResponse> getBookingsByProperty(Long propertyId) {
        return bookingRepository.findByPropertyId(propertyId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public BookingResponse updateStatus(Long id, BookingStatus status, String tokenPaymentReference) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + id));
        
        BookingStatus current = booking.getStatus();
        validateStateTransition(current, status);

        booking.setStatus(status);
        if (tokenPaymentReference != null && !tokenPaymentReference.trim().isEmpty()) {
            booking.setTokenPaymentReference(tokenPaymentReference);
        }

        // Auto-close any active meetups if booking is declined, cancelled, or rejected
        if (status == BookingStatus.DECLINED || status == BookingStatus.CANCELLED || status == BookingStatus.REJECTED) {
            cancelMeetupsForBooking(id);
        }

        Booking updated = bookingRepository.save(booking);
        return toResponse(updated);
    }

    @Transactional
    public void cancelBooking(Long id, String reason) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + id));
        
        validateStateTransition(booking.getStatus(), BookingStatus.CANCELLED);
        booking.setStatus(BookingStatus.CANCELLED);
        if (reason != null && !reason.trim().isEmpty()) {
            booking.setCancellationReason(reason);
        }
        cancelMeetupsForBooking(id);
        bookingRepository.save(booking);
    }

    /**
     * Enforces the explicit booking state transitions:
     * APPLICATION_DRAFT -> PENDING_OWNER_APPROVAL
     * PENDING_OWNER_APPROVAL -> MEETUP_SCHEDULED or CONFIRMED or APPROVED
     * MEETUP_SCHEDULED -> MEETUP_COMPLETED
     * MEETUP_COMPLETED -> CONFIRMED or APPROVED
     * CONFIRMED or APPROVED -> COMPLETED
     * Any non-terminal state -> CANCELLED or DECLINED or REJECTED
     */
    private void validateStateTransition(BookingStatus current, BookingStatus target) {
        if (current == target) {
            return;
        }
        if (current == BookingStatus.CANCELLED) {
            throw new InvalidBookingException("Cannot modify booking status: Booking is already CANCELLED.");
        }
        if (current == BookingStatus.DECLINED) {
            throw new InvalidBookingException("Cannot modify booking status: Booking is already DECLINED.");
        }
        if (current == BookingStatus.REJECTED) {
            throw new InvalidBookingException("Cannot modify booking status: Booking is already REJECTED.");
        }
        if (current == BookingStatus.COMPLETED) {
            throw new InvalidBookingException("Cannot modify booking status: Booking is already COMPLETED.");
        }

        // Always allow canceling, declining, or rejecting a non-terminal booking
        if (target == BookingStatus.CANCELLED || target == BookingStatus.DECLINED || target == BookingStatus.REJECTED) {
            return;
        }

        switch (current) {
            case APPLICATION_DRAFT:
                if (target != BookingStatus.TOKEN_PENDING && target != BookingStatus.PENDING_OWNER_APPROVAL) {
                    throw new InvalidBookingException("Invalid transition from APPLICATION_DRAFT to " + target);
                }
                break;
            case TOKEN_PENDING:
                if (target != BookingStatus.PENDING_OWNER_APPROVAL) {
                    throw new InvalidBookingException("Invalid transition from TOKEN_PENDING to " + target);
                }
                break;
            case PENDING_OWNER_APPROVAL:
                if (target != BookingStatus.MEETUP_SCHEDULED && target != BookingStatus.CONFIRMED && target != BookingStatus.APPROVED) {
                    throw new InvalidBookingException("Invalid transition from PENDING_OWNER_APPROVAL to " + target);
                }
                break;
            case MEETUP_SCHEDULED:
                if (target != BookingStatus.MEETUP_COMPLETED) {
                    throw new InvalidBookingException("Invalid transition from MEETUP_SCHEDULED to " + target + ". Meetup must be completed first.");
                }
                break;
            case MEETUP_COMPLETED:
                if (target != BookingStatus.CONFIRMED && target != BookingStatus.APPROVED) {
                    throw new InvalidBookingException("Invalid transition from MEETUP_COMPLETED to " + target);
                }
                break;
            case CONFIRMED:
            case APPROVED:
                if (target != BookingStatus.COMPLETED) {
                    throw new InvalidBookingException("Invalid transition from " + current + " to " + target);
                }
                break;
            default:
                throw new InvalidBookingException("Invalid status transition from " + current + " to " + target);
        }
    }

    /**
     * Automatically cancels all active (non-completed/non-declined) meetups for a booking.
     */
    private void cancelMeetupsForBooking(Long bookingId) {
        List<MeetupRequest> meetups = meetupRequestRepository.findByBookingId(bookingId);
        for (MeetupRequest m : meetups) {
            if (!"COMPLETED".equals(m.getStatus()) && !"DECLINED".equals(m.getStatus()) && !"CANCELLED".equals(m.getStatus())) {
                m.setStatus("CANCELLED");
                meetupRequestRepository.save(m);
            }
        }
    }

    // -------------------------------------------------------------------------
    // Tenant Verification
    // -------------------------------------------------------------------------

    @Transactional
    public TenantVerificationDto submitVerification(Long bookingId, TenantVerificationDto dto, Long currentUserId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + bookingId));

        if (!booking.getTenantId().equals(currentUserId)) {
            throw new InvalidBookingException("Unauthorized: Only the tenant can submit verification details.");
        }

        if (dto.getMonthlyIncome() == null || dto.getMonthlyIncome().trim().isEmpty()) {
            throw new InvalidBookingException("Monthly income (salary) is required.");
        }
        try {
            double income = Double.parseDouble(dto.getMonthlyIncome().trim());
            if (income <= 0) {
                throw new InvalidBookingException("Monthly income (salary) must be greater than 0.");
            }
        } catch (NumberFormatException e) {
            throw new InvalidBookingException("Monthly income (salary) must be a valid number.");
        }

        // Verification details submitted - status remains APPLICATION_DRAFT until token payment is successful.

        TenantVerification tv = tenantVerificationRepository.findByBookingId(bookingId)
                .orElse(new TenantVerification());

        tv.setBookingId(bookingId);
        tv.setFullName(dto.getFullName());
        tv.setDateOfBirth(dto.getDateOfBirth());
        tv.setCurrentCity(dto.getCurrentCity());
        tv.setCurrentAddress(dto.getCurrentAddress());
        tv.setOccupation(dto.getOccupation());
        tv.setCompanyName(dto.getCompanyName());
        tv.setMonthlyIncome(dto.getMonthlyIncome());
        tv.setExpectedMoveInDate(dto.getExpectedMoveInDate());
        tv.setExpectedDuration(dto.getExpectedDuration());
        tv.setReasonForRenting(dto.getReasonForRenting());
        tv.setOccupantsCount(dto.getOccupantsCount());
        tv.setRelationship(dto.getRelationship());
        tv.setPets(dto.getPets());
        tv.setPetType(dto.getPetType());
        tv.setNumberOfPets(dto.getNumberOfPets());
        tv.setSmokingPreference(dto.getSmokingPreference());
        tv.setDocumentType(dto.getDocumentType());
        tv.setDocumentData(dto.getDocumentData());
        tv.setDocumentFileName(dto.getDocumentFileName());
        tv.setPoliceVerificationStatus(dto.getPoliceVerificationStatus());
        tv.setPoliceVerificationCertificate(dto.getPoliceVerificationCertificate());
        tv.setPoliceCertificateFileName(dto.getPoliceCertificateFileName());
        tv.setEmergencyContactName(dto.getEmergencyContactName());
        tv.setEmergencyContactRelationship(dto.getEmergencyContactRelationship());
        tv.setEmergencyContactNumber(dto.getEmergencyContactNumber());
        tv.setConsent(dto.getConsent());

        TenantVerification saved = tenantVerificationRepository.save(tv);
        return toVerificationDto(saved);
    }

    public TenantVerificationDto getVerification(Long bookingId, Long currentUserId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + bookingId));

        PropertyDto property = propertyClient.getPropertyById(booking.getPropertyId());

        boolean isTenant = booking.getTenantId().equals(currentUserId);
        boolean isOwner = property != null && property.getOwnerId().equals(currentUserId);

        if (!isTenant && !isOwner) {
            throw new InvalidBookingException("Unauthorized: Access denied to sensitive tenant verification documents.");
        }

        TenantVerification tv = tenantVerificationRepository.findByBookingId(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Verification details not found for booking: " + bookingId));

        return toVerificationDto(tv);
    }

    // -------------------------------------------------------------------------
    // Physical Meetup Request
    // -------------------------------------------------------------------------

    @Transactional
    public MeetupRequestDto createMeetup(Long bookingId, MeetupRequestDto dto, Long currentUserId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + bookingId));

        PropertyDto property = propertyClient.getPropertyById(booking.getPropertyId());
        if (property == null || !property.getOwnerId().equals(currentUserId)) {
            throw new InvalidBookingException("Unauthorized: Only the property owner can request/schedule meetups.");
        }

        validateStateTransition(booking.getStatus(), BookingStatus.MEETUP_SCHEDULED);

        MeetupRequest meetup = new MeetupRequest();
        meetup.setBookingId(bookingId);
        meetup.setMeetingDate(dto.getMeetingDate());
        meetup.setMeetingTime(dto.getMeetingTime());
        meetup.setLocation(dto.getLocation());
        meetup.setMessage(dto.getMessage());
        meetup.setStatus("PENDING");

        booking.setStatus(BookingStatus.MEETUP_SCHEDULED);
        bookingRepository.save(booking);

        MeetupRequest saved = meetupRequestRepository.save(meetup);
        return toMeetupDto(saved);
    }

    @Transactional
    public MeetupRequestDto updateMeetupStatus(Long id, MeetupRequestDto dto, Long currentUserId) {
        MeetupRequest meetup = meetupRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Meetup request not found with id: " + id));

        Booking booking = bookingRepository.findById(meetup.getBookingId())
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + meetup.getBookingId()));

        PropertyDto property = propertyClient.getPropertyById(booking.getPropertyId());

        boolean isTenant = booking.getTenantId().equals(currentUserId);
        boolean isOwner = property != null && property.getOwnerId().equals(currentUserId);

        if ("ACCEPTED".equals(dto.getStatus()) || "DECLINED".equals(dto.getStatus()) || "RESCHEDULE_REQUESTED".equals(dto.getStatus())) {
            if (!isTenant) {
                throw new InvalidBookingException("Unauthorized: Only the tenant can respond to meetup requests.");
            }
        } else if ("COMPLETED".equals(dto.getStatus())) {
            if (!isOwner && !isTenant) {
                throw new InvalidBookingException("Unauthorized status transition.");
            }
        } else {
            throw new InvalidBookingException("Invalid status transition.");
        }

        meetup.setStatus(dto.getStatus());
        if ("RESCHEDULE_REQUESTED".equals(dto.getStatus())) {
            meetup.setCounterDate(dto.getCounterDate());
            meetup.setCounterTime(dto.getCounterTime());
            meetup.setCounterMessage(dto.getCounterMessage());
        } else if ("ACCEPTED".equals(dto.getStatus())) {
            if (dto.getMeetingDate() != null) meetup.setMeetingDate(dto.getMeetingDate());
            if (dto.getMeetingTime() != null) meetup.setMeetingTime(dto.getMeetingTime());
        } else if ("COMPLETED".equals(dto.getStatus())) {
            validateStateTransition(booking.getStatus(), BookingStatus.MEETUP_COMPLETED);
            booking.setStatus(BookingStatus.MEETUP_COMPLETED);
            bookingRepository.save(booking);
        }

        MeetupRequest saved = meetupRequestRepository.save(meetup);
        return toMeetupDto(saved);
    }

    public List<MeetupRequestDto> getMeetupsByBooking(Long bookingId, Long currentUserId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + bookingId));

        PropertyDto property = propertyClient.getPropertyById(booking.getPropertyId());

        boolean isTenant = booking.getTenantId().equals(currentUserId);
        boolean isOwner = property != null && property.getOwnerId().equals(currentUserId);

        if (!isTenant && !isOwner) {
            throw new InvalidBookingException("Unauthorized access to meetup records.");
        }

        return meetupRequestRepository.findByBookingId(bookingId).stream()
                .map(this::toMeetupDto)
                .toList();
    }

    // -------------------------------------------------------------------------
    // Converters
    // -------------------------------------------------------------------------

    private BookingResponse toResponse(Booking booking) {
        return BookingResponse.builder()
                .id(booking.getId())
                .propertyId(booking.getPropertyId())
                .tenantId(booking.getTenantId())
                .startDate(booking.getStartDate())
                .endDate(booking.getEndDate())
                .status(booking.getStatus())
                .tokenPaymentReference(booking.getTokenPaymentReference())
                .cancellationReason(booking.getCancellationReason())
                .createdAt(booking.getCreatedAt())
                .updatedAt(booking.getUpdatedAt())
                .build();
    }

    private TenantVerificationDto toVerificationDto(TenantVerification tv) {
        TenantVerificationDto dto = new TenantVerificationDto();
        dto.setId(tv.getId());
        dto.setBookingId(tv.getBookingId());
        dto.setFullName(tv.getFullName());
        dto.setDateOfBirth(tv.getDateOfBirth());
        dto.setCurrentCity(tv.getCurrentCity());
        dto.setCurrentAddress(tv.getCurrentAddress());
        dto.setOccupation(tv.getOccupation());
        dto.setCompanyName(tv.getCompanyName());
        dto.setMonthlyIncome(tv.getMonthlyIncome());
        dto.setExpectedMoveInDate(tv.getExpectedMoveInDate());
        dto.setExpectedDuration(tv.getExpectedDuration());
        dto.setReasonForRenting(tv.getReasonForRenting());
        dto.setOccupantsCount(tv.getOccupantsCount());
        dto.setRelationship(tv.getRelationship());
        dto.setPets(tv.getPets());
        dto.setPetType(tv.getPetType());
        dto.setNumberOfPets(tv.getNumberOfPets());
        dto.setSmokingPreference(tv.getSmokingPreference());
        dto.setDocumentType(tv.getDocumentType());
        dto.setDocumentData(tv.getDocumentData());
        dto.setDocumentFileName(tv.getDocumentFileName());
        dto.setPoliceVerificationStatus(tv.getPoliceVerificationStatus());
        dto.setPoliceVerificationCertificate(tv.getPoliceVerificationCertificate());
        dto.setPoliceCertificateFileName(tv.getPoliceCertificateFileName());
        dto.setEmergencyContactName(tv.getEmergencyContactName());
        dto.setEmergencyContactRelationship(tv.getEmergencyContactRelationship());
        dto.setEmergencyContactNumber(tv.getEmergencyContactNumber());
        dto.setConsent(tv.getConsent());
        dto.setCreatedAt(tv.getCreatedAt());
        return dto;
    }

    private MeetupRequestDto toMeetupDto(MeetupRequest m) {
        MeetupRequestDto dto = new MeetupRequestDto();
        dto.setId(m.getId());
        dto.setBookingId(m.getBookingId());
        dto.setMeetingDate(m.getMeetingDate());
        dto.setMeetingTime(m.getMeetingTime());
        dto.setLocation(m.getLocation());
        dto.setMessage(m.getMessage());
        dto.setStatus(m.getStatus());
        dto.setCounterDate(m.getCounterDate());
        dto.setCounterTime(m.getCounterTime());
        dto.setCounterMessage(m.getCounterMessage());
        dto.setCreatedAt(m.getCreatedAt());
        dto.setUpdatedAt(m.getUpdatedAt());
        return dto;
    }

    @Transactional
    public BookingResponse approveWithContactShare(Long bookingId, com.flatrental.booking.dto.OwnerContactShareDto contactDto, Long currentUserId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + bookingId));

        PropertyDto property = propertyClient.getPropertyById(booking.getPropertyId());
        if (property == null || !property.getOwnerId().equals(currentUserId)) {
            throw new InvalidBookingException("Unauthorized: Only the property owner can approve applications.");
        }

        validateStateTransition(booking.getStatus(), BookingStatus.CONFIRMED);

        // Set booking status to CONFIRMED
        booking.setStatus(BookingStatus.CONFIRMED);
        bookingRepository.save(booking);

        // Save Owner Contact Share details
        com.flatrental.booking.entity.OwnerContactShare share = ownerContactShareRepository.findByBookingId(bookingId)
                .orElse(new com.flatrental.booking.entity.OwnerContactShare());

        share.setBookingId(bookingId);
        share.setFullName(contactDto.getFullName());
        share.setPhone(contactDto.getPhone());
        share.setEmail(contactDto.getEmail());
        share.setPreferredContactMethod(contactDto.getPreferredContactMethod());
        share.setMessage(contactDto.getMessage());

        ownerContactShareRepository.save(share);

        return toResponse(booking);
    }

    public com.flatrental.booking.dto.OwnerContactShareDto getOwnerContact(Long bookingId, Long currentUserId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + bookingId));

        // Privacy check: Only confirm share when booking status is CONFIRMED or APPROVED
        if (!BookingStatus.CONFIRMED.equals(booking.getStatus()) && !BookingStatus.APPROVED.equals(booking.getStatus())) {
            throw new InvalidBookingException("Access denied: Contact details are only shared after application approval.");
        }

        PropertyDto property = propertyClient.getPropertyById(booking.getPropertyId());

        boolean isTenant = booking.getTenantId().equals(currentUserId);
        boolean isOwner = property != null && property.getOwnerId().equals(currentUserId);

        if (!isTenant && !isOwner) {
            throw new InvalidBookingException("Unauthorized to access shared owner contact info.");
        }

        com.flatrental.booking.entity.OwnerContactShare share = ownerContactShareRepository.findByBookingId(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("No contact share record found for booking: " + bookingId));

        return toOwnerContactShareDto(share);
    }

    private com.flatrental.booking.dto.OwnerContactShareDto toOwnerContactShareDto(com.flatrental.booking.entity.OwnerContactShare share) {
        com.flatrental.booking.dto.OwnerContactShareDto dto = new com.flatrental.booking.dto.OwnerContactShareDto();
        dto.setId(share.getId());
        dto.setBookingId(share.getBookingId());
        dto.setFullName(share.getFullName());
        dto.setPhone(share.getPhone());
        dto.setEmail(share.getEmail());
        dto.setPreferredContactMethod(share.getPreferredContactMethod());
        dto.setMessage(share.getMessage());
        dto.setCreatedAt(share.getCreatedAt());
        return dto;
    }

    // -------------------------------------------------------------------------
    // CCTNS Profile Police Verification
    // -------------------------------------------------------------------------

    @Transactional
    public PoliceVerificationDto getPoliceVerification(Long tenantId, Long currentUserId) {
        if (!tenantId.equals(currentUserId)) {
            throw new InvalidBookingException("Access denied: You can only view your own verification status.");
        }
        PoliceVerification pv = policeVerificationRepository.findByTenantId(tenantId)
                .orElseGet(() -> {
                    PoliceVerification temp = new PoliceVerification();
                    temp.setTenantId(tenantId);
                    temp.setStatus("NOT_SUBMITTED");
                    return temp;
                });
        return toPoliceVerificationDto(pv);
    }

    @Transactional
    public PoliceVerificationDto submitPoliceVerification(Long tenantId, PoliceVerificationDto dto, Long currentUserId) {
        if (!tenantId.equals(currentUserId)) {
            throw new InvalidBookingException("Access denied: You can only submit your own verification.");
        }

        PoliceVerification pv = policeVerificationRepository.findByTenantId(tenantId)
                .orElse(new PoliceVerification());

        pv.setTenantId(tenantId);
        pv.setVerificationType("CCTNS");
        pv.setDocumentData(dto.getDocumentData());
        pv.setDocumentFileName(dto.getDocumentFileName());

        com.flatrental.booking.verification.PoliceVerificationResult result = policeVerificationProvider.verify(
                tenantId, dto.getDocumentData(), dto.getDocumentFileName());

        pv.setStatus(result.getStatus());
        pv.setVerificationReferenceNumber(result.getReferenceNumber());
        pv.setVerificationProvider(result.getProviderName());
        pv.setSubmittedAt(LocalDateTime.now());

        PoliceVerification saved = policeVerificationRepository.save(pv);
        return toPoliceVerificationDto(saved);
    }

    @Transactional
    public PoliceVerificationDto updatePoliceVerificationStatus(Long tenantId, String status, String rejectionReason) {
        PoliceVerification pv = policeVerificationRepository.findByTenantId(tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("No verification record found for tenant: " + tenantId));

        pv.setStatus(status);
        if ("VERIFIED".equals(status)) {
            pv.setVerifiedAt(LocalDateTime.now());
            pv.setRejectionReason(null);
        } else if ("REJECTED".equals(status) || "VERIFICATION_FAILED".equals(status)) {
            pv.setRejectionReason(rejectionReason);
        }

        PoliceVerification saved = policeVerificationRepository.save(pv);
        return toPoliceVerificationDto(saved);
    }

    private PoliceVerificationDto toPoliceVerificationDto(PoliceVerification pv) {
        PoliceVerificationDto dto = new PoliceVerificationDto();
        dto.setId(pv.getId());
        dto.setTenantId(pv.getTenantId());
        dto.setVerificationType(pv.getVerificationType());
        dto.setDocumentData(pv.getDocumentData());
        dto.setDocumentFileName(pv.getDocumentFileName());
        dto.setStatus(pv.getStatus());
        dto.setSubmittedAt(pv.getSubmittedAt());
        dto.setVerifiedAt(pv.getVerifiedAt());
        dto.setRejectionReason(pv.getRejectionReason());
        dto.setVerificationReferenceNumber(pv.getVerificationReferenceNumber());
        dto.setVerificationProvider(pv.getVerificationProvider());
        dto.setLastUpdatedAt(pv.getLastUpdatedAt());
        return dto;
    }
}
