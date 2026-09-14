-- Production Schema for LuxeFlats Booking Service (Version 1)
-- Managed by Flyway Database Migrations

CREATE TABLE IF NOT EXISTS bookings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    property_id BIGINT NOT NULL,
    tenant_id BIGINT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    token_payment_reference VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_bookings_tenant (tenant_id),
    INDEX idx_bookings_property (property_id),
    INDEX idx_bookings_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS police_verifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    tenant_id BIGINT NOT NULL UNIQUE,
    verification_type VARCHAR(50) DEFAULT 'CCTNS',
    status VARCHAR(50) DEFAULT 'SUBMITTED',
    document_data LONGTEXT,
    document_file_name VARCHAR(255),
    verification_reference_number VARCHAR(100),
    verification_provider VARCHAR(100),
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    verified_at TIMESTAMP NULL,
    rejection_reason VARCHAR(500),
    last_updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_pv_tenant (tenant_id),
    INDEX idx_pv_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS tenant_kyc_verifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    tenant_id BIGINT NOT NULL,
    aadhaar_masked VARCHAR(20),
    pan_number VARCHAR(20),
    cibil_score INT,
    credit_rating VARCHAR(50),
    employment_verified BOOLEAN DEFAULT TRUE,
    company_name VARCHAR(150),
    monthly_income DECIMAL(12, 2),
    kyc_status VARCHAR(50) DEFAULT 'VERIFIED',
    risk_level VARCHAR(20) DEFAULT 'LOW',
    verified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_kyc_tenant (tenant_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
