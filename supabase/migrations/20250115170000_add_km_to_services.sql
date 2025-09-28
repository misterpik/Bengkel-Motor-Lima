-- Add KM column to services table
ALTER TABLE services ADD COLUMN IF NOT EXISTS vehicle_km INTEGER;