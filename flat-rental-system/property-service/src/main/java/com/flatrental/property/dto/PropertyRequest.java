package com.flatrental.property.dto;

import com.flatrental.property.entity.PropertyType;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;

public class PropertyRequest {

    @NotBlank(message = "Title is required")
    @Size(min = 3, max = 150, message = "Title must be between 3 and 150 characters")
    private String title;

    @Size(max = 2000, message = "Description cannot exceed 2000 characters")
    private String description;

    @NotBlank(message = "Address is required")
    @Size(min = 3, max = 255, message = "Address must be between 3 and 255 characters")
    private String address;

    @NotBlank(message = "City is required")
    @Size(min = 2, max = 100, message = "City must be between 2 and 100 characters")
    private String city;

    @NotNull(message = "Rent amount is required")
    @DecimalMin(value = "1.00", message = "Rent amount must be at least ₹1")
    @DecimalMax(value = "10000000.00", message = "Rent amount cannot exceed ₹1,00,00,000")
    private BigDecimal rentAmount;

    private PropertyType propertyType;

    @Min(value = 1, message = "Bedrooms must be at least 1")
    @Max(value = 50, message = "Bedrooms cannot exceed 50")
    private Integer bedrooms;

    @Min(value = 1, message = "Bathrooms must be at least 1")
    @Max(value = 50, message = "Bathrooms cannot exceed 50")
    private Integer bathrooms;

    @Size(max = 150, message = "Locality cannot exceed 150 characters")
    private String locality;

    @Size(max = 50, message = "Furnishing cannot exceed 50 characters")
    private String furnishing;

    @Min(value = 10, message = "Area must be at least 10 sqft")
    @Max(value = 100000, message = "Area cannot exceed 1,00,000 sqft")
    private Integer area;

    @DecimalMin(value = "0.00", message = "Security deposit cannot be negative")
    @DecimalMax(value = "50000000.00", message = "Security deposit cannot exceed ₹5,00,00,000")
    private BigDecimal securityDeposit;

    private String imageUrls;

    @Size(max = 1000, message = "Amenities cannot exceed 1000 characters")
    private String amenities;

    @Size(max = 100, message = "State cannot exceed 100 characters")
    private String state;

    private Double latitude;

    private Double longitude;

    private Boolean available;

    // -------------------------------------------------------------------------
    // No-arg constructor
    // -------------------------------------------------------------------------

    public PropertyRequest() {
    }

    // -------------------------------------------------------------------------
    // Getters
    // -------------------------------------------------------------------------

    public String getTitle() {
        return title;
    }

    public String getDescription() {
        return description;
    }

    public String getAddress() {
        return address;
    }

    public String getCity() {
        return city;
    }

    public BigDecimal getRentAmount() {
        return rentAmount;
    }

    public PropertyType getPropertyType() {
        return propertyType;
    }

    public Integer getBedrooms() {
        return bedrooms;
    }

    public Integer getBathrooms() {
        return bathrooms;
    }

    public String getLocality() {
        return locality;
    }

    public String getFurnishing() {
        return furnishing;
    }

    public Integer getArea() {
        return area;
    }

    public BigDecimal getSecurityDeposit() {
        return securityDeposit;
    }

    public String getImageUrls() {
        return imageUrls;
    }

    public String getAmenities() {
        return amenities;
    }

    public String getState() {
        return state;
    }

    public Double getLatitude() {
        return latitude;
    }

    public Double getLongitude() {
        return longitude;
    }

    public Boolean getAvailable() {
        return available;
    }

    // -------------------------------------------------------------------------
    // Setters
    // -------------------------------------------------------------------------

    public void setTitle(String title) {
        this.title = title;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public void setRentAmount(BigDecimal rentAmount) {
        this.rentAmount = rentAmount;
    }

    public void setPropertyType(PropertyType propertyType) {
        this.propertyType = propertyType;
    }

    public void setBedrooms(Integer bedrooms) {
        this.bedrooms = bedrooms;
    }

    public void setBathrooms(Integer bathrooms) {
        this.bathrooms = bathrooms;
    }

    public void setLocality(String locality) {
        this.locality = locality;
    }

    public void setFurnishing(String furnishing) {
        this.furnishing = furnishing;
    }

    public void setArea(Integer area) {
        this.area = area;
    }

    public void setSecurityDeposit(BigDecimal securityDeposit) {
        this.securityDeposit = securityDeposit;
    }

    public void setImageUrls(String imageUrls) {
        this.imageUrls = imageUrls;
    }

    public void setAmenities(String amenities) {
        this.amenities = amenities;
    }

    public void setState(String state) {
        this.state = state;
    }

    public void setLatitude(Double latitude) {
        this.latitude = latitude;
    }

    public void setLongitude(Double longitude) {
        this.longitude = longitude;
    }

    public void setAvailable(Boolean available) {
        this.available = available;
    }
}
