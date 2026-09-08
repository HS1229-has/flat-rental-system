package com.flatrental.booking.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "tenant_verifications")
public class TenantVerification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "booking_id", nullable = false, unique = true)
    private Long bookingId;

    @Column(name = "full_name", nullable = false)
    private String fullName;

    @Column(name = "date_of_birth")
    private String dateOfBirth;

    @Column(name = "current_city")
    private String currentCity;

    @Column(name = "current_address")
    private String currentAddress;

    @Column(name = "occupation")
    private String occupation;

    @Column(name = "company_name")
    private String companyName;

    @Column(name = "monthly_income")
    private String monthlyIncome;

    @Column(name = "expected_move_in_date")
    private String expectedMoveInDate;

    @Column(name = "expected_duration")
    private String expectedDuration;

    @Column(name = "reason_for_renting")
    private String reasonForRenting;

    @Column(name = "occupants_count")
    private Integer occupantsCount;

    @Column(name = "relationship")
    private String relationship;

    @Column(name = "pets")
    private Boolean pets;

    @Column(name = "pet_type")
    private String petType;

    @Column(name = "number_of_pets")
    private Integer numberOfPets;

    @Column(name = "smoking_preference")
    private String smokingPreference;

    @Column(name = "document_type")
    private String documentType;

    @Lob
    @Column(name = "document_data", columnDefinition = "LONGTEXT")
    private String documentData;

    @Column(name = "document_file_name")
    private String documentFileName;

    @Column(name = "police_verification_status")
    private String policeVerificationStatus;

    @Lob
    @Column(name = "police_verification_certificate", columnDefinition = "LONGTEXT")
    private String policeVerificationCertificate;

    @Column(name = "police_certificate_file_name")
    private String policeCertificateFileName;

    @Column(name = "emergency_contact_name")
    private String emergencyContactName;

    @Column(name = "emergency_contact_relationship")
    private String emergencyContactRelationship;

    @Column(name = "emergency_contact_number")
    private String emergencyContactNumber;

    @Column(name = "consent")
    private Boolean consent;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    // Constructors
    public TenantVerification() {
    }

    public TenantVerification(Long id, Long bookingId, String fullName, String dateOfBirth, String currentCity,
                              String currentAddress, String occupation, String companyName, String monthlyIncome,
                              String expectedMoveInDate, String expectedDuration, String reasonForRenting,
                              Integer occupantsCount, String relationship, Boolean pets, String petType,
                              Integer numberOfPets, String smokingPreference, String documentType,
                              String documentData, String documentFileName, String policeVerificationStatus,
                              String policeVerificationCertificate, String policeCertificateFileName,
                              String emergencyContactName, String emergencyContactRelationship,
                              String emergencyContactNumber, Boolean consent, LocalDateTime createdAt) {
        this.id = id;
        this.bookingId = bookingId;
        this.fullName = fullName;
        this.dateOfBirth = dateOfBirth;
        this.currentCity = currentCity;
        this.currentAddress = currentAddress;
        this.occupation = occupation;
        this.companyName = companyName;
        this.monthlyIncome = monthlyIncome;
        this.expectedMoveInDate = expectedMoveInDate;
        this.expectedDuration = expectedDuration;
        this.reasonForRenting = reasonForRenting;
        this.occupantsCount = occupantsCount;
        this.relationship = relationship;
        this.pets = pets;
        this.petType = petType;
        this.numberOfPets = numberOfPets;
        this.smokingPreference = smokingPreference;
        this.documentType = documentType;
        this.documentData = documentData;
        this.documentFileName = documentFileName;
        this.policeVerificationStatus = policeVerificationStatus;
        this.policeVerificationCertificate = policeVerificationCertificate;
        this.policeCertificateFileName = policeCertificateFileName;
        this.emergencyContactName = emergencyContactName;
        this.emergencyContactRelationship = emergencyContactRelationship;
        this.emergencyContactNumber = emergencyContactNumber;
        this.consent = consent;
        this.createdAt = createdAt;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getBookingId() { return bookingId; }
    public void setBookingId(Long bookingId) { this.bookingId = bookingId; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getDateOfBirth() { return dateOfBirth; }
    public void setDateOfBirth(String dateOfBirth) { this.dateOfBirth = dateOfBirth; }

    public String getCurrentCity() { return currentCity; }
    public void setCurrentCity(String currentCity) { this.currentCity = currentCity; }

    public String getCurrentAddress() { return currentAddress; }
    public void setCurrentAddress(String currentAddress) { this.currentAddress = currentAddress; }

    public String getOccupation() { return occupation; }
    public void setOccupation(String occupation) { this.occupation = occupation; }

    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }

    public String getMonthlyIncome() { return monthlyIncome; }
    public void setMonthlyIncome(String monthlyIncome) { this.monthlyIncome = monthlyIncome; }

    public String getExpectedMoveInDate() { return expectedMoveInDate; }
    public void setExpectedMoveInDate(String expectedMoveInDate) { this.expectedMoveInDate = expectedMoveInDate; }

    public String getExpectedDuration() { return expectedDuration; }
    public void setExpectedDuration(String expectedDuration) { this.expectedDuration = expectedDuration; }

    public String getReasonForRenting() { return reasonForRenting; }
    public void setReasonForRenting(String reasonForRenting) { this.reasonForRenting = reasonForRenting; }

    public Integer getOccupantsCount() { return occupantsCount; }
    public void setOccupantsCount(Integer occupantsCount) { this.occupantsCount = occupantsCount; }

    public String getRelationship() { return relationship; }
    public void setRelationship(String relationship) { this.relationship = relationship; }

    public Boolean getPets() { return pets; }
    public void setPets(Boolean pets) { this.pets = pets; }

    public String getPetType() { return petType; }
    public void setPetType(String petType) { this.petType = petType; }

    public Integer getNumberOfPets() { return numberOfPets; }
    public void setNumberOfPets(Integer numberOfPets) { this.numberOfPets = numberOfPets; }

    public String getSmokingPreference() { return smokingPreference; }
    public void setSmokingPreference(String smokingPreference) { this.smokingPreference = smokingPreference; }

    public String getDocumentType() { return documentType; }
    public void setDocumentType(String documentType) { this.documentType = documentType; }

    public String getDocumentData() { return documentData; }
    public void setDocumentData(String documentData) { this.documentData = documentData; }

    public String getDocumentFileName() { return documentFileName; }
    public void setDocumentFileName(String documentFileName) { this.documentFileName = documentFileName; }

    public String getPoliceVerificationStatus() { return policeVerificationStatus; }
    public void setPoliceVerificationStatus(String policeVerificationStatus) { this.policeVerificationStatus = policeVerificationStatus; }

    public String getPoliceVerificationCertificate() { return policeVerificationCertificate; }
    public void setPoliceVerificationCertificate(String policeVerificationCertificate) { this.policeVerificationCertificate = policeVerificationCertificate; }

    public String getPoliceCertificateFileName() { return policeCertificateFileName; }
    public void setPoliceCertificateFileName(String policeCertificateFileName) { this.policeCertificateFileName = policeCertificateFileName; }

    public String getEmergencyContactName() { return emergencyContactName; }
    public void setEmergencyContactName(String emergencyContactName) { this.emergencyContactName = emergencyContactName; }

    public String getEmergencyContactRelationship() { return emergencyContactRelationship; }
    public void setEmergencyContactRelationship(String emergencyContactRelationship) { this.emergencyContactRelationship = emergencyContactRelationship; }

    public String getEmergencyContactNumber() { return emergencyContactNumber; }
    public void setEmergencyContactNumber(String emergencyContactNumber) { this.emergencyContactNumber = emergencyContactNumber; }

    public Boolean getConsent() { return consent; }
    public void setConsent(Boolean consent) { this.consent = consent; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
