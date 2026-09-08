package com.flatrental.booking.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;

/**
 * Foundation for direct service-to-service HTTP calls (no service discovery
 * / API gateway hop needed for internal calls). Day 1 only wires the beans;
 * PropertyClient shows how they will be used once booking business rules
 * are implemented.
 */
@Configuration
public class WebClientConfig {

    @Value("${services.property-service.base-url}")
    private String propertyServiceBaseUrl;

    @Bean
    public WebClient propertyServiceWebClient() {
        return WebClient.builder()
                .baseUrl(propertyServiceBaseUrl)
                .exchangeStrategies(org.springframework.web.reactive.function.client.ExchangeStrategies.builder()
                        .codecs(configurer -> configurer.defaultCodecs().maxInMemorySize(50 * 1024 * 1024))
                        .build())
                .build();
    }
}
