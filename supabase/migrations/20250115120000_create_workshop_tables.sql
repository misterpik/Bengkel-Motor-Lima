CREATE TABLE IF NOT EXISTS tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  owner_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  address TEXT,
  package VARCHAR(50) DEFAULT 'Basic',
  status VARCHAR(20) DEFAULT 'Trial',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  role VARCHAR(20) DEFAULT 'bengkel_staff',
  full_name VARCHAR(255),
  phone VARCHAR(20),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  service_number VARCHAR(20) NOT NULL,
  customer_name VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(20),
  vehicle_brand VARCHAR(100),
  vehicle_model VARCHAR(100),
  vehicle_year INTEGER,
  license_plate VARCHAR(20),
  complaint TEXT,
  status VARCHAR(50) DEFAULT 'Antrian',
  technician VARCHAR(255),
  estimated_cost DECIMAL(12,2),
  actual_cost DECIMAL(12,2),
  progress INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(tenant_id, service_number)
);

CREATE TABLE IF NOT EXISTS spareparts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  code VARCHAR(20) NOT NULL,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  brand VARCHAR(100),
  stock INTEGER DEFAULT 0,
  minimum_stock INTEGER DEFAULT 0,
  price DECIMAL(12,2),
  supplier VARCHAR(255),
  location VARCHAR(100),
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(tenant_id, code)
);

CREATE TABLE IF NOT EXISTS service_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  sparepart_id UUID REFERENCES spareparts(id),
  item_name VARCHAR(255) NOT NULL,
  quantity INTEGER DEFAULT 1,
  unit_price DECIMAL(12,2),
  total_price DECIMAL(12,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

alter publication supabase_realtime add table tenants;
alter publication supabase_realtime add table profiles;
alter publication supabase_realtime add table services;
alter publication supabase_realtime add table spareparts;
alter publication supabase_realtime add table service_items;

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_tenants_updated_at BEFORE UPDATE ON tenants FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_spareparts_updated_at BEFORE UPDATE ON spareparts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

INSERT INTO tenants (name, owner_name, email, phone, address, package, status) VALUES
('Bengkel Motor Jaya', 'Budi Santoso', 'budi@bengkeljaya.com', '081234567890', 'Jl. Raya No. 123, Jakarta', 'Premium', 'Aktif'),
('Service Center Maju', 'Siti Aminah', 'siti@servicemaju.com', '081234567891', 'Jl. Sudirman No. 456, Bandung', 'Basic', 'Aktif'),
('Bengkel Sejahtera', 'Ahmad Rizki', 'ahmad@sejahtera.com', '081234567892', 'Jl. Merdeka No. 789, Surabaya', 'Premium', 'Trial'),
('Motor Care Plus', 'Maya Sari', 'maya@motorcareplus.com', '081234567893', 'Jl. Gatot Subroto No. 321, Medan', 'Standard', 'Suspended');