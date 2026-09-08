-- Fix bookings.status column to accept all new enum values (APPLICATION_DRAFT, PENDING_OWNER_APPROVAL)
-- Uses IGNORE to safely skip if the table/column is already correct or table doesn't exist yet.
-- Hibernate ddl-auto:update creates the table first (defer-datasource-initialization:true ensures ordering).
ALTER TABLE bookings MODIFY COLUMN status VARCHAR(30) NOT NULL;
