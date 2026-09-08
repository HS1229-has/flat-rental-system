package com.flatrental.auth.dto;

public class ContactUpdateRequest {
    private String contactPhone;
    private String contactEmail;
    private String preferredContactMethod;

    public ContactUpdateRequest() {
    }

    public ContactUpdateRequest(String contactPhone, String contactEmail, String preferredContactMethod) {
        this.contactPhone = contactPhone;
        this.contactEmail = contactEmail;
        this.preferredContactMethod = preferredContactMethod;
    }

    public String getContactPhone() {
        return contactPhone;
    }

    public void setContactPhone(String contactPhone) {
        this.contactPhone = contactPhone;
    }

    public String getContactEmail() {
        return contactEmail;
    }

    public void setContactEmail(String contactEmail) {
        this.contactEmail = contactEmail;
    }

    public String getPreferredContactMethod() {
        return preferredContactMethod;
    }

    public void setPreferredContactMethod(String preferredContactMethod) {
        this.preferredContactMethod = preferredContactMethod;
    }
}
