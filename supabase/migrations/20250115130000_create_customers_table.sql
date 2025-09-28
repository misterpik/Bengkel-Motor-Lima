CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  customer_code VARCHAR(20) NOT NULL,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  email VARCHAR(255),
  address TEXT,
  date_of_birth DATE,
  gender VARCHAR(10),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(tenant_id, customer_code)
);

CREATE TABLE IF NOT EXISTS customer_vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  brand VARCHAR(100),
  model VARCHAR(100),
  year INTEGER,
  license_plate VARCHAR(20),
  engine_number VARCHAR(50),
  chassis_number VARCHAR(50),
  color VARCHAR(50),
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

alter publication supabase_realtime add table customers;
alter publication supabase_realtime add table customer_vehicles;

CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_customer_vehicles_updated_at BEFORE UPDATE ON customer_vehicles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE services ADD COLUMN IF NOT EXISTS customer_id UUID REFERENCES customers(id);