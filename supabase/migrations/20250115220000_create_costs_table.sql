-- Create costs table for recording business expenses
CREATE TABLE IF NOT EXISTS costs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cost_name VARCHAR(255) NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  cost_date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_costs_tenant_id ON costs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_costs_date ON costs(cost_date);
CREATE INDEX IF NOT EXISTS idx_costs_name ON costs(cost_name);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE costs;