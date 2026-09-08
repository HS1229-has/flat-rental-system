package com.flatrental.booking.client;

import com.flatrental.booking.dto.PropertyDto;

public interface PropertyClient {
    PropertyDto getPropertyById(Long propertyId);
}
