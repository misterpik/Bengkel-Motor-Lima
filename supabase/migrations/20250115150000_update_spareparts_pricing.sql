-- Add new columns for purchase and selling price
ALTER TABLE spareparts ADD COLUMN IF NOT EXISTS purchase_price DECIMAL(12,2);
ALTER TABLE spareparts ADD COLUMN IF NOT EXISTS selling_price DECIMAL(12,2);

-- Migrate existing price data to selling_price
UPDATE spareparts SET selling_price = price WHERE price IS NOT NULL;

-- The old price column can be kept for backward compatibility or dropped later
-- ALTER TABLE spareparts DROP COLUMN price;