-- Fix foreign key constraint for costs table
-- Drop the existing foreign key constraint
ALTER TABLE costs DROP CONSTRAINT IF EXISTS costs_tenant_id_fkey;

-- Add the correct foreign key constraint to tenants table
ALTER TABLE costs ADD CONSTRAINT costs_tenant_id_fkey 
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;