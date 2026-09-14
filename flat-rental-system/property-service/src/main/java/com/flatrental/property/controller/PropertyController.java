package com.flatrental.property.controller;

import com.flatrental.property.dto.PropertyRequest;
import com.flatrental.property.dto.PropertyResponse;
import com.flatrental.property.dto.RentEstimationRequest;
import com.flatrental.property.dto.RentEstimationResponse;
import com.flatrental.property.service.PropertyService;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Base64;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/properties")
public class PropertyController {

    private final PropertyService propertyService;

    public PropertyController(PropertyService propertyService) {
        this.propertyService = propertyService;
    }

    @PostMapping
    public ResponseEntity<PropertyResponse> createProperty(@Valid @RequestBody PropertyRequest request,
                                                             @RequestHeader("X-User-Id") Long ownerId) {
        PropertyResponse response = propertyService.createProperty(request, ownerId);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<List<PropertyResponse>> getAllProperties(
            @RequestParam(required = false) String city) {
        if (city != null && !city.isBlank()) {
            return ResponseEntity.ok(propertyService.getPropertiesByCity(city));
        }
        return ResponseEntity.ok(propertyService.getAllProperties());
    }

    @GetMapping("/{id}")
    public ResponseEntity<PropertyResponse> getPropertyById(@PathVariable Long id) {
        return ResponseEntity.ok(propertyService.getPropertyById(id));
    }

    @GetMapping("/owner/{ownerId}")
    public ResponseEntity<List<PropertyResponse>> getPropertiesByOwner(@PathVariable Long ownerId) {
        return ResponseEntity.ok(propertyService.getPropertiesByOwner(ownerId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PropertyResponse> updateProperty(@PathVariable Long id,
                                                           @Valid @RequestBody PropertyRequest request,
                                                           @RequestHeader("X-User-Id") Long currentUserId) {
        return ResponseEntity.ok(propertyService.updateProperty(id, request, currentUserId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProperty(@PathVariable Long id,
                                               @RequestHeader("X-User-Id") Long currentUserId) {
        propertyService.deleteProperty(id, currentUserId);
        return ResponseEntity.noContent().build();
    }

    /**
     * Serve the first image for a property as a binary image response.
     * Handles base64 data URIs stored in imageUrls.
     */
    @GetMapping("/{id}/image")
    public ResponseEntity<byte[]> getPropertyImage(@PathVariable Long id,
                                                    @RequestParam(value = "index", defaultValue = "0") int index) {
        String imageUrls = propertyService.getPropertyImageUrls(id);
        if (imageUrls == null || imageUrls.isBlank()) {
            return ResponseEntity.notFound().build();
        }

        // Split by | delimiter, fallback to treating as single entry
        String[] images;
        if (imageUrls.contains("|")) {
            images = imageUrls.split("\\|");
        } else {
            images = new String[]{imageUrls};
        }

        if (index < 0 || index >= images.length) {
            return ResponseEntity.notFound().build();
        }

        String img = images[index].trim();

        // If it's a base64 data URI, decode and serve as binary
        if (img.startsWith("data:image")) {
            // Extract media type and base64 data
            // Format: data:image/png;base64,iVBOR...
            int commaIdx = img.indexOf(',');
            if (commaIdx < 0) return ResponseEntity.notFound().build();

            String meta = img.substring(0, commaIdx); // "data:image/png;base64"
            String base64Data = img.substring(commaIdx + 1);

            // Parse content type
            String contentType = "image/jpeg";
            if (meta.startsWith("data:")) {
                String afterData = meta.substring(5); // "image/png;base64"
                int semiIdx = afterData.indexOf(';');
                if (semiIdx > 0) {
                    contentType = afterData.substring(0, semiIdx);
                }
            }

            try {
                byte[] imageBytes = Base64.getDecoder().decode(base64Data);
                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.parseMediaType(contentType));
                headers.setCacheControl("public, max-age=86400");
                return new ResponseEntity<>(imageBytes, headers, HttpStatus.OK);
            } catch (IllegalArgumentException e) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
            }
        }

        // If it's a URL, redirect to it
        HttpHeaders headers = new HttpHeaders();
        headers.set("Location", img);
        return new ResponseEntity<>(headers, HttpStatus.FOUND);
    }

    /**
     * Return image count for a property (useful for lazy-loading images).
     */
    @GetMapping("/{id}/image-info")
    public ResponseEntity<Map<String, Object>> getPropertyImageInfo(@PathVariable Long id) {
        String imageUrls = propertyService.getPropertyImageUrls(id);
        int count = 0;
        boolean hasBase64 = false;
        if (imageUrls != null && !imageUrls.isBlank()) {
            String[] images = imageUrls.contains("|") ? imageUrls.split("\\|") : new String[]{imageUrls};
            count = images.length;
            hasBase64 = imageUrls.startsWith("data:image");
        }
        return ResponseEntity.ok(Map.of("count", count, "hasBase64", hasBase64));
    }

    /**
     * AI-Powered Rent Estimation API for market valuation.
     */
    @PostMapping("/estimate-rent")
    public ResponseEntity<RentEstimationResponse> estimateRent(@Valid @RequestBody RentEstimationRequest request) {
        return ResponseEntity.ok(propertyService.estimateRent(request));
    }
}
