package com.flatrental.property.service;

import com.flatrental.property.dto.PropertyRequest;
import com.flatrental.property.dto.PropertyResponse;
import com.flatrental.property.entity.Property;
import com.flatrental.property.entity.PropertyType;
import com.flatrental.property.exception.ResourceNotFoundException;
import com.flatrental.property.exception.UnauthorizedActionException;
import com.flatrental.property.repository.PropertyRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PropertyServiceTest {

    @Mock
    private PropertyRepository propertyRepository;

    @InjectMocks
    private PropertyService propertyService;

    private Property sampleProperty;

    @BeforeEach
    void setUp() {
        sampleProperty = Property.builder()
                .id(1L)
                .ownerId(10L)
                .title("Luxury 2BHK Apartment")
                .description("Spacious flat in city center")
                .address("Sector 62")
                .city("Noida")
                .rentAmount(new BigDecimal("25000.00"))
                .propertyType(PropertyType.TWO_BHK)
                .bedrooms(2)
                .bathrooms(2)
                .available(true)
                .securityDeposit(new BigDecimal("50000.00"))
                .build();
    }

    @Test
    @DisplayName("Should successfully create a new property listing")
    void testCreateProperty_Success() {
        PropertyRequest request = new PropertyRequest();
        request.setTitle("Luxury 2BHK Apartment");
        request.setDescription("Spacious flat in city center");
        request.setAddress("Sector 62");
        request.setCity("Noida");
        request.setRentAmount(new BigDecimal("25000.00"));
        request.setPropertyType(PropertyType.TWO_BHK);
        request.setBedrooms(2);
        request.setBathrooms(2);
        request.setSecurityDeposit(new BigDecimal("50000.00"));

        when(propertyRepository.save(any(Property.class))).thenAnswer(inv -> {
            Property p = inv.getArgument(0);
            p.setId(1L);
            return p;
        });

        PropertyResponse response = propertyService.createProperty(request, 10L);

        assertNotNull(response);
        assertEquals(1L, response.getId());
        assertEquals("Luxury 2BHK Apartment", response.getTitle());
        assertEquals("Noida", response.getCity());
        assertTrue(response.isAvailable());
        verify(propertyRepository, times(1)).save(any(Property.class));
    }

    @Test
    @DisplayName("Should return all properties")
    void testGetAllProperties() {
        when(propertyRepository.findAll()).thenReturn(List.of(sampleProperty));

        List<PropertyResponse> results = propertyService.getAllProperties();

        assertNotNull(results);
        assertEquals(1, results.size());
        assertEquals("Luxury 2BHK Apartment", results.get(0).getTitle());
    }

    @Test
    @DisplayName("Should return property by ID when it exists")
    void testGetPropertyById_Success() {
        when(propertyRepository.findById(1L)).thenReturn(Optional.of(sampleProperty));

        PropertyResponse response = propertyService.getPropertyById(1L);

        assertNotNull(response);
        assertEquals(1L, response.getId());
        assertEquals("Noida", response.getCity());
    }

    @Test
    @DisplayName("Should throw ResourceNotFoundException when property not found")
    void testGetPropertyById_NotFound() {
        when(propertyRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> propertyService.getPropertyById(999L));
    }

    @Test
    @DisplayName("Should return properties filtered by city")
    void testGetPropertiesByCity() {
        when(propertyRepository.findByCityIgnoreCase("noida")).thenReturn(List.of(sampleProperty));

        List<PropertyResponse> results = propertyService.getPropertiesByCity("noida");

        assertNotNull(results);
        assertEquals(1, results.size());
        assertEquals("Noida", results.get(0).getCity());
    }

    @Test
    @DisplayName("Should return properties filtered by owner ID")
    void testGetPropertiesByOwner() {
        when(propertyRepository.findByOwnerId(10L)).thenReturn(List.of(sampleProperty));

        List<PropertyResponse> results = propertyService.getPropertiesByOwner(10L);

        assertNotNull(results);
        assertEquals(1, results.size());
        assertEquals(10L, results.get(0).getOwnerId());
    }

    @Test
    @DisplayName("Should successfully update property when requested by owner")
    void testUpdateProperty_Success() {
        PropertyRequest updateReq = new PropertyRequest();
        updateReq.setTitle("Updated Title");
        updateReq.setDescription("Updated Desc");
        updateReq.setAddress("Sector 63");
        updateReq.setCity("Noida");
        updateReq.setRentAmount(new BigDecimal("30000.00"));
        updateReq.setPropertyType(PropertyType.TWO_BHK);
        updateReq.setBedrooms(2);
        updateReq.setBathrooms(2);

        when(propertyRepository.findById(1L)).thenReturn(Optional.of(sampleProperty));
        when(propertyRepository.save(any(Property.class))).thenAnswer(inv -> inv.getArgument(0));

        PropertyResponse updated = propertyService.updateProperty(1L, updateReq, 10L);

        assertNotNull(updated);
        assertEquals("Updated Title", updated.getTitle());
        assertEquals(new BigDecimal("30000.00"), updated.getRentAmount());
    }

    @Test
    @DisplayName("Should throw UnauthorizedActionException when non-owner tries to update property")
    void testUpdateProperty_Unauthorized() {
        PropertyRequest updateReq = new PropertyRequest();

        when(propertyRepository.findById(1L)).thenReturn(Optional.of(sampleProperty));

        assertThrows(UnauthorizedActionException.class, () -> propertyService.updateProperty(1L, updateReq, 999L));
        verify(propertyRepository, never()).save(any(Property.class));
    }

    @Test
    @DisplayName("Should successfully delete property when requested by owner")
    void testDeleteProperty_Success() {
        when(propertyRepository.findById(1L)).thenReturn(Optional.of(sampleProperty));

        propertyService.deleteProperty(1L, 10L);

        verify(propertyRepository, times(1)).delete(sampleProperty);
    }

    @Test
    @DisplayName("Should throw UnauthorizedActionException when non-owner tries to delete property")
    void testDeleteProperty_Unauthorized() {
        when(propertyRepository.findById(1L)).thenReturn(Optional.of(sampleProperty));

        assertThrows(UnauthorizedActionException.class, () -> propertyService.deleteProperty(1L, 888L));
        verify(propertyRepository, never()).delete(any(Property.class));
    }
}
