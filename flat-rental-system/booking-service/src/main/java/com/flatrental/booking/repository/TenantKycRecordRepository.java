package com.flatrental.booking.repository;

import com.flatrental.booking.entity.TenantKycRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TenantKycRecordRepository extends JpaRepository<TenantKycRecord, Long> {

    Optional<TenantKycRecord> findByTenantId(Long tenantId);
}
