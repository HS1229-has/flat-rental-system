package com.flatrental.property.dto;

import com.flatrental.property.entity.PropertyType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public class PropertyRequest {

    @NotBlank(message = "Title is required")
    private String title;

    private String description;

    @NotBlank(message = "Address is required")
    private String address;

    @NotBlank(message = "City is required")
    private String city;

    @NotNull(message = "Rent amount is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Rent amount must be greater than 0")
    private BigDecimal rentAmount;

    private PropertyType propertyType;

    private Integer bedrooms;

    private Integer bathrooms;

    private String locality;

    private String furnishing;

    private Integer area;

    private BigDecimal securityDeposit;

    private String imageUrls;

    private String amenities;

    private String state;

    private Double latitude;

    private Double longitude;

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
}
