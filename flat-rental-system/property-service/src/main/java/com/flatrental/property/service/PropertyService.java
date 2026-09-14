package com.flatrental.property.service;

import com.flatrental.property.dto.PropertyRequest;
import com.flatrental.property.dto.PropertyResponse;
import com.flatrental.property.dto.RentEstimationRequest;
import com.flatrental.property.dto.RentEstimationResponse;
import com.flatrental.property.entity.Property;
import com.flatrental.property.exception.ResourceNotFoundException;
import com.flatrental.property.exception.UnauthorizedActionException;
import com.flatrental.property.repository.PropertyRepository;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
public class PropertyService {

    private final PropertyRepository propertyRepository;

    public PropertyService(PropertyRepository propertyRepository) {
        this.propertyRepository = propertyRepository;
    }

    @Transactional
    @CacheEvict(value = {"properties", "property"}, allEntries = true)
    public PropertyResponse createProperty(PropertyRequest request, Long ownerId) {
        Property property = Property.builder()
                .ownerId(ownerId)
                .title(request.getTitle())
                .description(request.getDescription())
                .address(request.getAddress())
                .city(request.getCity())
                .rentAmount(request.getRentAmount())
                .propertyType(request.getPropertyType())
                .bedrooms(request.getBedrooms())
                .bathrooms(request.getBathrooms())
                .locality(request.getLocality())
                .furnishing(request.getFurnishing())
                .area(request.getArea())
                .securityDeposit(request.getSecurityDeposit())
                .imageUrls(request.getImageUrls())
                .amenities(request.getAmenities())
                .state(request.getState())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .available(true)
                .build();

        Property saved = propertyRepository.save(property);
        return toListResponse(saved);
    }

    @Cacheable(value = "properties", key = "'all'")
    public List<PropertyResponse> getAllProperties() {
        return propertyRepository.findAll().stream()
                .map(this::toListResponse)
                .toList();
    }

    @Cacheable(value = "property", key = "#id")
    public PropertyResponse getPropertyById(Long id) {
        Property property = propertyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Property not found with id: " + id));
        return toListResponse(property);
    }

    @Cacheable(value = "properties", key = "#city")
    public List<PropertyResponse> getPropertiesByCity(String city) {
        return propertyRepository.findByCityIgnoreCase(city).stream()
                .map(this::toListResponse)
                .toList();
    }

    public List<PropertyResponse> getPropertiesByOwner(Long ownerId) {
        return propertyRepository.findByOwnerId(ownerId).stream()
                .map(this::toListResponse)
                .toList();
    }

    /**
     * Returns the raw imageUrls string for a property (used by the image serving endpoint).
     */
    public String getPropertyImageUrls(Long id) {
        Property property = propertyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Property not found with id: " + id));
        return property.getImageUrls();
    }

    @Transactional
    @CacheEvict(value = {"properties", "property"}, allEntries = true)
    public PropertyResponse updateProperty(Long id, PropertyRequest request, Long currentUserId) {
        Property property = propertyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Property not found with id: " + id));

        if (!property.getOwnerId().equals(currentUserId)) {
            throw new UnauthorizedActionException("Unauthorized: You do not own this property.");
        }

        property.setTitle(request.getTitle());
        property.setDescription(request.getDescription());
        property.setAddress(request.getAddress());
        property.setCity(request.getCity());
        property.setRentAmount(request.getRentAmount());
        property.setPropertyType(request.getPropertyType());
        property.setBedrooms(request.getBedrooms());
        property.setBathrooms(request.getBathrooms());
        property.setLocality(request.getLocality());
        property.setFurnishing(request.getFurnishing());
        property.setArea(request.getArea());
        property.setSecurityDeposit(request.getSecurityDeposit());
        
        // Resolve updated images to restore original base64 from lightweight references if they were kept
        String resolvedImages = resolveUpdatedImageUrls(request.getImageUrls(), property.getImageUrls());
        property.setImageUrls(resolvedImages);
        
        property.setAmenities(request.getAmenities());
        property.setState(request.getState());
        property.setLatitude(request.getLatitude());
        property.setLongitude(request.getLongitude());

        Property updated = propertyRepository.save(property);
        return toListResponse(updated);
    }

    @Transactional
    @CacheEvict(value = {"properties", "property"}, allEntries = true)
    public void deleteProperty(Long id, Long currentUserId) {
        Property property = propertyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Property not found with id: " + id));

        if (!property.getOwnerId().equals(currentUserId)) {
            throw new UnauthorizedActionException("Unauthorized: You do not own this property.");
        }
        propertyRepository.delete(property);
    }

    /**
     * Resolves the frontend-sent imageUrls (which might contain relative/absolute serving URLs like
     * /api/properties/{id}/image?index={idx}) back to the original base64 data from the database.
     */
    private String resolveUpdatedImageUrls(String requestImageUrls, String existingImageUrls) {
        if (requestImageUrls == null || requestImageUrls.isBlank()) {
            return requestImageUrls;
        }
        if (existingImageUrls == null || existingImageUrls.isBlank()) {
            return requestImageUrls;
        }

        String[] existingImages = existingImageUrls.split("\\|");
        String[] requestedImages = requestImageUrls.split("\\|");
        java.util.List<String> resolvedImages = new java.util.ArrayList<>();

        java.util.regex.Pattern pattern = java.util.regex.Pattern.compile(".*/api/properties/\\d+/image(\\?index=(\\d+))?");

        for (String reqImg : requestedImages) {
            reqImg = reqImg.trim();
            java.util.regex.Matcher matcher = pattern.matcher(reqImg);
            if (matcher.matches()) {
                int index = 0;
                String indexStr = matcher.group(2);
                if (indexStr != null) {
                    try {
                        index = Integer.parseInt(indexStr);
                    } catch (NumberFormatException e) {
                        index = 0;
                    }
                }
                if (index >= 0 && index < existingImages.length) {
                    resolvedImages.add(existingImages[index].trim());
                } else {
                    resolvedImages.add(reqImg);
                }
            } else {
                resolvedImages.add(reqImg);
            }
        }

        return String.join("|", resolvedImages);
    }

    /**
     * Lightweight response for all JSON API endpoints — replaces base64 image data with
     * serving URLs (/api/properties/{id}/image) to prevent massive JSON payloads.
     */
    private PropertyResponse toListResponse(Property property) {
        String imageUrls = property.getImageUrls();

        if (imageUrls != null && imageUrls.startsWith("data:image")) {
            String[] images = imageUrls.contains("|") ? imageUrls.split("\\|") : new String[]{imageUrls};
            if (images.length == 1) {
                imageUrls = "/api/properties/" + property.getId() + "/image";
            } else {
                StringBuilder sb = new StringBuilder();
                for (int i = 0; i < images.length; i++) {
                    if (i > 0) sb.append("|");
                    sb.append("/api/properties/").append(property.getId()).append("/image?index=").append(i);
                }
                imageUrls = sb.toString();
            }
        }

        return PropertyResponse.builder()
                .id(property.getId())
                .ownerId(property.getOwnerId())
                .title(property.getTitle())
                .description(property.getDescription())
                .address(property.getAddress())
                .city(property.getCity())
                .rentAmount(property.getRentAmount())
                .propertyType(property.getPropertyType())
                .bedrooms(property.getBedrooms())
                .bathrooms(property.getBathrooms())
                .locality(property.getLocality())
                .furnishing(property.getFurnishing())
                .area(property.getArea())
                .securityDeposit(property.getSecurityDeposit())
                .imageUrls(imageUrls)
                .amenities(property.getAmenities())
                .state(property.getState())
                .latitude(property.getLatitude())
                .longitude(property.getLongitude())
                .available(property.isAvailable())
                .createdAt(property.getCreatedAt())
                .updatedAt(property.getUpdatedAt())
                .build();
    }

    /**
     * AI-Powered Rent Estimation Algorithm based on city index, area (sqft),
     * furnishing tier, bedroom weighting, and premium amenity additions.
     */
    public RentEstimationResponse estimateRent(RentEstimationRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("Estimation request cannot be null");
        }

        // 1. Determine City Base Rate per sqft (in INR)
        String city = request.getCity() != null ? request.getCity().trim().toLowerCase() : "";
        double baseRatePerSqFt;
        if (city.contains("mumbai")) {
            baseRatePerSqFt = 45.0;
        } else if (city.contains("bangalore") || city.contains("bengaluru")) {
            baseRatePerSqFt = 32.0;
        } else if (city.contains("delhi") || city.contains("gurgaon") || city.contains("noida")) {
            baseRatePerSqFt = 30.0;
        } else if (city.contains("pune")) {
            baseRatePerSqFt = 25.0;
        } else if (city.contains("hyderabad")) {
            baseRatePerSqFt = 24.0;
        } else if (city.contains("chennai")) {
            baseRatePerSqFt = 22.0;
        } else {
            baseRatePerSqFt = 18.0; // Tier 2/3 default baseline
        }

        // 2. Base Area Rent Calculation
        int area = request.getArea() != null && request.getArea() > 0 ? request.getArea() : 600;
        double calculatedBaseRent = area * baseRatePerSqFt;

        // 3. Bedroom multiplier adjustment
        int bedrooms = request.getBedrooms() != null ? request.getBedrooms() : 1;
        if (bedrooms >= 3) {
            calculatedBaseRent *= 1.15;
        } else if (bedrooms == 2) {
            calculatedBaseRent *= 1.05;
        }

        // 4. Furnishing Premium
        double furnishingPremium = 0.0;
        String furnishing = request.getFurnishing() != null ? request.getFurnishing().toLowerCase() : "";
        if (furnishing.contains("fully") || furnishing.equals("furnished")) {
            furnishingPremium = calculatedBaseRent * 0.22; // +22% for fully furnished
        } else if (furnishing.contains("semi")) {
            furnishingPremium = calculatedBaseRent * 0.10; // +10% for semi-furnished
        }

        // 5. Amenity Bonuses
        double amenityBonus = 0.0;
        if (request.isHasParking()) amenityBonus += 2000.0;
        if (request.isHasGym()) amenityBonus += 1500.0;
        if (request.isHasPowerBackup()) amenityBonus += 1200.0;
        if (request.isHasSecurity()) amenityBonus += 800.0;

        double totalRent = calculatedBaseRent + furnishingPremium + amenityBonus;
        // Round to nearest 500 for market realism
        long roundedRent = Math.round(totalRent / 500.0) * 500;
        long minRent = Math.round((roundedRent * 0.92) / 500.0) * 500;
        long maxRent = Math.round((roundedRent * 1.08) / 500.0) * 500;

        // Confidence calculation (higher for standard sqft & popular cities)
        int confidence = (city.contains("bangalore") || city.contains("mumbai") || city.contains("delhi")) ? 94 : 88;
        if (request.getLocality() != null && !request.getLocality().isBlank()) {
            confidence = Math.min(98, confidence + 3);
        }

        String demand = roundedRent > 35000 ? "High Demand (Executive Category)" : "High Demand (Quick Turnover)";

        String summary = String.format("AI Estimated Rent for %s (%d sqft, %d BHK) in %s. Market range ₹%,d - ₹%,d.",
                furnishing.isEmpty() ? "Standard" : request.getFurnishing(),
                area,
                bedrooms,
                request.getCity(),
                minRent,
                maxRent);

        return RentEstimationResponse.builder()
                .estimatedRent(BigDecimal.valueOf(roundedRent))
                .minRent(BigDecimal.valueOf(minRent))
                .maxRent(BigDecimal.valueOf(maxRent))
                .confidenceScore(confidence)
                .marketDemand(demand)
                .baseRent(BigDecimal.valueOf(Math.round(calculatedBaseRent)))
                .furnishingPremium(BigDecimal.valueOf(Math.round(furnishingPremium)))
                .amenityBonus(BigDecimal.valueOf(Math.round(amenityBonus)))
                .ratePerSqFt(BigDecimal.valueOf(baseRatePerSqFt))
                .summary(summary)
                .build();
    }
}
