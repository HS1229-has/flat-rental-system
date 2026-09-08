package com.flatrental.booking.client;

import com.flatrental.booking.dto.PropertyDto;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

@Component
public class PropertyClientImpl implements PropertyClient {

    private final WebClient propertyServiceWebClient;

    public PropertyClientImpl(WebClient propertyServiceWebClient) {
        this.propertyServiceWebClient = propertyServiceWebClient;
    }

    @Override
    public PropertyDto getPropertyById(Long propertyId) {
        return propertyServiceWebClient.get()
                .uri("/api/properties/{id}", propertyId)
                .retrieve()
                .bodyToMono(PropertyDto.class)
                .block();
    }
}
