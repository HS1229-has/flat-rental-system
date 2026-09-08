package com.flatrental.property.service;

import com.flatrental.property.dto.PropertyRequest;
import com.flatrental.property.dto.PropertyResponse;
import com.flatrental.property.entity.Property;
import com.flatrental.property.exception.ResourceNotFoundException;
import com.flatrental.property.exception.UnauthorizedActionException;
import com.flatrental.property.repository.PropertyRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class PropertyService {

    private final PropertyRepository propertyRepository;

    public PropertyService(PropertyRepository propertyRepository) {
        this.propertyRepository = propertyRepository;
    }

    @Transactional
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

    public List<PropertyResponse> getAllProperties() {
        return propertyRepository.findAll().stream()
                .map(this::toListResponse)
                .toList();
    }

    public PropertyResponse getPropertyById(Long id) {
        Property property = propertyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Property not found with id: " + id));
        return toListResponse(property);
    }

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
}
