package com.flatrental.booking.dto;

import java.time.LocalDateTime;

public class TenantVerificationDto {
    private Long id;
    private Long bookingId;
    private String fullName;
    private String dateOfBirth;
    private String currentCity;
    private String currentAddress;
    private String occupation;
    private String companyName;
    private String monthlyIncome;
    private String expectedMoveInDate;
    private String expectedDuration;
    private String reasonForRenting;
    private Integer occupantsCount;
    private String relationship;
    private Boolean pets;
    private String petType;
    private Integer numberOfPets;
    private String smokingPreference;
    private String documentType;
    private String documentData;
    private String documentFileName;
    private String policeVerificationStatus;
    private String policeVerificationCertificate;
    private String policeCertificateFileName;
    private String emergencyContactName;
    private String emergencyContactRelationship;
    private String emergencyContactNumber;
    private Boolean consent;
    private LocalDateTime createdAt;

    // Constructors
    public TenantVerificationDto() {
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
