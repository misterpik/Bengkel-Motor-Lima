-- Add description column to spareparts table
ALTER TABLE spareparts ADD COLUMN IF NOT EXISTS description TEXT;