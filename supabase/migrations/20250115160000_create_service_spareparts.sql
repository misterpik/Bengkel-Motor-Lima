-- Create table for service spareparts
CREATE TABLE IF NOT EXISTS service_spareparts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  sparepart_id UUID NOT NULL REFERENCES spareparts(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(12,2) NOT NULL,
  total_price DECIMAL(12,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add service fee column to services table
ALTER TABLE services ADD COLUMN IF NOT EXISTS service_fee DECIMAL(12,2) DEFAULT 0;
ALTER TABLE services ADD COLUMN IF NOT EXISTS spareparts_total DECIMAL(12,2) DEFAULT 0;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_service_spareparts_service_id ON service_spareparts(service_id);
CREATE INDEX IF NOT EXISTS idx_service_spareparts_sparepart_id ON service_spareparts(sparepart_id);

-- Enable realtime
alter publication supabase_realtime add table service_spareparts;

-- Add trigger for updated_at
CREATE TRIGGER update_service_spareparts_updated_at BEFORE UPDATE ON service_spareparts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();