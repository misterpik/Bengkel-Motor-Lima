-- Add tax-related columns to services table
ALTER TABLE services 
ADD COLUMN IF NOT EXISTS base_cost DECIMAL(12,2),
ADD COLUMN IF NOT EXISTS tax_rate DECIMAL(5,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS tax_amount DECIMAL(12,2);

-- Update existing services to have base_cost equal to estimated_cost
UPDATE services 
SET base_cost = estimated_cost 
WHERE base_cost IS NULL AND estimated_cost IS NOT NULL;