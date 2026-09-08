package com.flatrental.auth.entity;

/**
 * Roles supported by the Flat Rental System.
 * TENANT  - can browse properties and make bookings
 * OWNER   - can list and manage properties
 * ADMIN   - full administrative access
 */
public enum Role {
    ROLE_TENANT,
    ROLE_OWNER,
    ROLE_ADMIN
}
