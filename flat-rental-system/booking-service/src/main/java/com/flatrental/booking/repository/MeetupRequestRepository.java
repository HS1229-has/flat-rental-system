package com.flatrental.booking.repository;

import com.flatrental.booking.entity.MeetupRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MeetupRequestRepository extends JpaRepository<MeetupRequest, Long> {

    List<MeetupRequest> findByBookingId(Long bookingId);
}
