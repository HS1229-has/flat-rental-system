package com.flatrental.property.entity;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;


@Entity
@Table(name = "properties")
public class Property {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // References the User.id from auth-service (no cross-service FK - services own their own data)
    @Column(name = "owner_id", nullable = false)
    private Long ownerId;

    @Column(nullable = false, length = 150)
    private String title;

    @Column(length = 2000)
    private String description;

    @Column(nullable = false, length = 255)
    private String address;

    @Column(nullable = false, length = 100)
    private String city;

    @Column(name = "rent_amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal rentAmount;

    @Enumerated(EnumType.STRING)
    @Column(name = "property_type", length = 20)
    private PropertyType propertyType;

    private Integer bedrooms;

    private Integer bathrooms;

    @Column(nullable = false)
    private boolean available = true;

    @Column(length = 150)
    private String locality;

    @Column(length = 50)
    private String furnishing;

    private Integer area;

    @Column(name = "security_deposit", precision = 10, scale = 2)
    private BigDecimal securityDeposit;

    @Lob
    @Column(name = "image_urls", columnDefinition = "LONGTEXT")
    private String imageUrls;

    @Column(length = 1000)
    private String amenities;

    @Column(length = 100)
    private String state;

    private Double latitude;

    private Double longitude;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // ── JPA required no-arg constructor ──────────────────────────────────────
    public Property() {}

    // ── All-args constructor ──────────────────────────────────────────────────
    public Property(Long id, Long ownerId, String title, String description, String address,
                    String city, BigDecimal rentAmount, PropertyType propertyType,
                    Integer bedrooms, Integer bathrooms, boolean available,
                    String locality, String furnishing, Integer area, BigDecimal securityDeposit,
                    String imageUrls, String amenities, String state, Double latitude, Double longitude,
                    LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.ownerId = ownerId;
        this.title = title;
        this.description = description;
        this.address = address;
        this.city = city;
        this.rentAmount = rentAmount;
        this.propertyType = propertyType;
        this.bedrooms = bedrooms;
        this.bathrooms = bathrooms;
        this.available = available;
        this.locality = locality;
        this.furnishing = furnishing;
        this.area = area;
        this.securityDeposit = securityDeposit;
        this.imageUrls = imageUrls;
        this.amenities = amenities;
        this.state = state;
        this.latitude = latitude;
        this.longitude = longitude;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    // ── Getters ───────────────────────────────────────────────────────────────
    public Long getId() { return id; }
    public Long getOwnerId() { return ownerId; }
    public String getTitle() { return title; }
    public String getDescription() { return description; }
    public String getAddress() { return address; }
    public String getCity() { return city; }
    public BigDecimal getRentAmount() { return rentAmount; }
    public PropertyType getPropertyType() { return propertyType; }
    public Integer getBedrooms() { return bedrooms; }
    public Integer getBathrooms() { return bathrooms; }
    public boolean isAvailable() { return available; }
    public String getLocality() { return locality; }
    public String getFurnishing() { return furnishing; }
    public Integer getArea() { return area; }
    public BigDecimal getSecurityDeposit() { return securityDeposit; }
    public String getImageUrls() { return imageUrls; }
    public String getAmenities() { return amenities; }
    public String getState() { return state; }
    public Double getLatitude() { return latitude; }
    public Double getLongitude() { return longitude; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }

    // ── Setters ───────────────────────────────────────────────────────────────
    public void setId(Long id) { this.id = id; }
    public void setOwnerId(Long ownerId) { this.ownerId = ownerId; }
    public void setTitle(String title) { this.title = title; }
    public void setDescription(String description) { this.description = description; }
    public void setAddress(String address) { this.address = address; }
    public void setCity(String city) { this.city = city; }
    public void setRentAmount(BigDecimal rentAmount) { this.rentAmount = rentAmount; }
    public void setPropertyType(PropertyType propertyType) { this.propertyType = propertyType; }
    public void setBedrooms(Integer bedrooms) { this.bedrooms = bedrooms; }
    public void setBathrooms(Integer bathrooms) { this.bathrooms = bathrooms; }
    public void setAvailable(boolean available) { this.available = available; }
    public void setLocality(String locality) { this.locality = locality; }
    public void setFurnishing(String furnishing) { this.furnishing = furnishing; }
    public void setArea(Integer area) { this.area = area; }
    public void setSecurityDeposit(BigDecimal securityDeposit) { this.securityDeposit = securityDeposit; }
    public void setImageUrls(String imageUrls) { this.imageUrls = imageUrls; }
    public void setAmenities(String amenities) { this.amenities = amenities; }
    public void setState(String state) { this.state = state; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    // ── Lifecycle ─────────────────────────────────────────────────────────────
    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    // ── Static builder ────────────────────────────────────────────────────────
    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private Long id;
        private Long ownerId;
        private String title;
        private String description;
        private String address;
        private String city;
        private BigDecimal rentAmount;
        private PropertyType propertyType;
        private Integer bedrooms;
        private Integer bathrooms;
        private boolean available = true;
        private String locality;
        private String furnishing;
        private Integer area;
        private BigDecimal securityDeposit;
        private String imageUrls;
        private String amenities;
        private String state;
        private Double latitude;
        private Double longitude;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        public Builder id(Long id) { this.id = id; return this; }
        public Builder ownerId(Long ownerId) { this.ownerId = ownerId; return this; }
        public Builder title(String title) { this.title = title; return this; }
        public Builder description(String description) { this.description = description; return this; }
        public Builder address(String address) { this.address = address; return this; }
        public Builder city(String city) { this.city = city; return this; }
        public Builder rentAmount(BigDecimal rentAmount) { this.rentAmount = rentAmount; return this; }
        public Builder propertyType(PropertyType propertyType) { this.propertyType = propertyType; return this; }
        public Builder bedrooms(Integer bedrooms) { this.bedrooms = bedrooms; return this; }
        public Builder bathrooms(Integer bathrooms) { this.bathrooms = bathrooms; return this; }
        public Builder available(boolean available) { this.available = available; return this; }
        public Builder locality(String locality) { this.locality = locality; return this; }
        public Builder furnishing(String furnishing) { this.furnishing = furnishing; return this; }
        public Builder area(Integer area) { this.area = area; return this; }
        public Builder securityDeposit(BigDecimal securityDeposit) { this.securityDeposit = securityDeposit; return this; }
        public Builder imageUrls(String imageUrls) { this.imageUrls = imageUrls; return this; }
        public Builder amenities(String amenities) { this.amenities = amenities; return this; }
        public Builder state(String state) { this.state = state; return this; }
        public Builder latitude(Double latitude) { this.latitude = latitude; return this; }
        public Builder longitude(Double longitude) { this.longitude = longitude; return this; }
        public Builder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
        public Builder updatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; return this; }

        public Property build() {
            return new Property(id, ownerId, title, description, address, city,
                    rentAmount, propertyType, bedrooms, bathrooms, available,
                    locality, furnishing, area, securityDeposit, imageUrls, amenities,
                    state, latitude, longitude, createdAt, updatedAt);
        }
    }
}
