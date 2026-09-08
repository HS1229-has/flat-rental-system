package com.flatrental.payment.client;

import com.flatrental.payment.dto.BookingDto;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

/**
 * Thin HTTP client for calling booking-service directly. Inter-service
 * architecture foundation for Day 1 - not yet wired into payment creation
 * logic (planned for a later day).
 */
@Component
public class BookingClient {

    private final WebClient bookingServiceWebClient;

    public BookingClient(WebClient bookingServiceWebClient) {
        this.bookingServiceWebClient = bookingServiceWebClient;
    }

    public BookingDto getBookingById(Long bookingId) {
        return bookingServiceWebClient.get()
                .uri("/api/bookings/{id}", bookingId)
                .retrieve()
                .bodyToMono(BookingDto.class)
                .block();
    }
}
