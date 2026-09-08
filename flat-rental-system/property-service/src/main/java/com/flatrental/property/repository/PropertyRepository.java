package com.flatrental.property.repository;

import com.flatrental.property.entity.Property;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PropertyRepository extends JpaRepository<Property, Long> {

    List<Property> findByCityIgnoreCase(String city);

    List<Property> findByOwnerId(Long ownerId);

    List<Property> findByAvailableTrue();
}
