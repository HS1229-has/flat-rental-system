-- Production Schema for LuxeFlats Property Service (Version 1)
-- Managed by Flyway Database Migrations

CREATE TABLE IF NOT EXISTS properties (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    owner_id BIGINT NOT NULL,
    title VARCHAR(150) NOT NULL,
    description VARCHAR(2000),
    address VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    rent_amount DECIMAL(10, 2) NOT NULL,
    property_type VARCHAR(20),
    bedrooms INT,
    bathrooms INT,
    available BOOLEAN NOT NULL DEFAULT TRUE,
    locality VARCHAR(150),
    furnishing VARCHAR(50),
    area INT,
    security_deposit DECIMAL(10, 2),
    image_urls LONGTEXT,
    amenities VARCHAR(500),
    state VARCHAR(50),
    latitude DOUBLE,
    longitude DOUBLE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_properties_city (city),
    INDEX idx_properties_owner (owner_id),
    INDEX idx_properties_available (available)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
