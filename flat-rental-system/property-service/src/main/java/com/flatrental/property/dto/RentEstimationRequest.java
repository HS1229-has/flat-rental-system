package com.flatrental.property.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class RentEstimationRequest {

    @NotBlank(message = "City is required for rent estimation")
    private String city;

    private String locality;

    private String propertyType;

    @NotNull(message = "Number of bedrooms is required")
    @Min(value = 1, message = "Bedrooms must be at least 1")
    private Integer bedrooms;

    private Integer bathrooms;

    @NotNull(message = "Area in sqft is required")
    @Min(value = 50, message = "Area must be at least 50 sqft")
    private Integer area;

    private String furnishing; // "Furnished", "Semi-Furnished", "Unfurnished"

    private boolean hasParking;
    private boolean hasGym;
    private boolean hasPowerBackup;
    private boolean hasSecurity;

    public RentEstimationRequest() {}

    public RentEstimationRequest(String city, String locality, String propertyType, Integer bedrooms,
                                 Integer bathrooms, Integer area, String furnishing, boolean hasParking,
                                 boolean hasGym, boolean hasPowerBackup, boolean hasSecurity) {
        this.city = city;
        this.locality = locality;
        this.propertyType = propertyType;
        this.bedrooms = bedrooms;
        this.bathrooms = bathrooms;
        this.area = area;
        this.furnishing = furnishing;
        this.hasParking = hasParking;
        this.hasGym = hasGym;
        this.hasPowerBackup = hasPowerBackup;
        this.hasSecurity = hasSecurity;
    }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public String getLocality() { return locality; }
    public void setLocality(String locality) { this.locality = locality; }

    public String getPropertyType() { return propertyType; }
    public void setPropertyType(String propertyType) { this.propertyType = propertyType; }

    public Integer getBedrooms() { return bedrooms; }
    public void setBedrooms(Integer bedrooms) { this.bedrooms = bedrooms; }

    public Integer getBathrooms() { return bathrooms; }
    public void setBathrooms(Integer bathrooms) { this.bathrooms = bathrooms; }

    public Integer getArea() { return area; }
    public void setArea(Integer area) { this.area = area; }

    public String getFurnishing() { return furnishing; }
    public void setFurnishing(String furnishing) { this.furnishing = furnishing; }

    public boolean isHasParking() { return hasParking; }
    public void setHasParking(boolean hasParking) { this.hasParking = hasParking; }

    public boolean isHasGym() { return hasGym; }
    public void setHasGym(boolean hasGym) { this.hasGym = hasGym; }

    public boolean isHasPowerBackup() { return hasPowerBackup; }
    public void setHasPowerBackup(boolean hasPowerBackup) { this.hasPowerBackup = hasPowerBackup; }

    public boolean isHasSecurity() { return hasSecurity; }
    public void setHasSecurity(boolean hasSecurity) { this.hasSecurity = hasSecurity; }
}
