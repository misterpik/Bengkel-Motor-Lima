-- Insert sample customers for existing tenants
DO $$
DECLARE
    tenant_record RECORD;
    customer_id UUID;
BEGIN
    -- Loop through each tenant and insert sample customers
    FOR tenant_record IN SELECT id FROM tenants LIMIT 1 LOOP
        -- Insert customers
        INSERT INTO customers (tenant_id, customer_code, name, phone, email, address, gender, notes) VALUES
        (tenant_record.id, 'CUST0001', 'Budi Santoso', '081234567890', 'budi@email.com', 'Jl. Merdeka No. 123, Jakarta Pusat', 'Laki-laki', 'Pelanggan setia sejak 2020'),
        (tenant_record.id, 'CUST0002', 'Siti Aminah', '081234567891', 'siti@email.com', 'Jl. Sudirman No. 456, Jakarta Selatan', 'Perempuan', 'Sering servis rutin setiap 3 bulan'),
        (tenant_record.id, 'CUST0003', 'Ahmad Rizki', '081234567892', 'ahmad@email.com', 'Jl. Thamrin No. 789, Jakarta Barat', 'Laki-laki', 'Pemilik bengkel kecil, sering beli sparepart'),
        (tenant_record.id, 'CUST0004', 'Maya Sari', '081234567893', 'maya@email.com', 'Jl. Gatot Subroto No. 321, Jakarta Timur', 'Perempuan', 'Mahasiswa, motor untuk kuliah'),
        (tenant_record.id, 'CUST0005', 'Joko Widodo', '081234567894', 'joko@email.com', 'Jl. Ahmad Yani No. 654, Jakarta Utara', 'Laki-laki', 'Ojek online, motor sering dipakai'),
        (tenant_record.id, 'CUST0006', 'Rina Susanti', '081234567895', 'rina@email.com', 'Jl. Diponegoro No. 987, Depok', 'Perempuan', 'Ibu rumah tangga, motor untuk belanja');
        
        -- Insert vehicles for each customer
        INSERT INTO customer_vehicles (customer_id, brand, model, year, license_plate, color, is_primary)
        SELECT 
            c.id,
            CASE 
                WHEN c.customer_code = 'CUST0001' THEN 'Honda'
                WHEN c.customer_code = 'CUST0002' THEN 'Yamaha'
                WHEN c.customer_code = 'CUST0003' THEN 'Suzuki'
                WHEN c.customer_code = 'CUST0004' THEN 'Honda'
                WHEN c.customer_code = 'CUST0005' THEN 'Yamaha'
                WHEN c.customer_code = 'CUST0006' THEN 'Honda'
            END,
            CASE 
                WHEN c.customer_code = 'CUST0001' THEN 'Beat'
                WHEN c.customer_code = 'CUST0002' THEN 'Mio'
                WHEN c.customer_code = 'CUST0003' THEN 'Satria'
                WHEN c.customer_code = 'CUST0004' THEN 'Vario'
                WHEN c.customer_code = 'CUST0005' THEN 'NMAX'
                WHEN c.customer_code = 'CUST0006' THEN 'Scoopy'
            END,
            CASE 
                WHEN c.customer_code = 'CUST0001' THEN 2020
                WHEN c.customer_code = 'CUST0002' THEN 2019
                WHEN c.customer_code = 'CUST0003' THEN 2021
                WHEN c.customer_code = 'CUST0004' THEN 2022
                WHEN c.customer_code = 'CUST0005' THEN 2020
                WHEN c.customer_code = 'CUST0006' THEN 2021
            END,
            CASE 
                WHEN c.customer_code = 'CUST0001' THEN 'B 1234 ABC'
                WHEN c.customer_code = 'CUST0002' THEN 'B 5678 DEF'
                WHEN c.customer_code = 'CUST0003' THEN 'B 9012 GHI'
                WHEN c.customer_code = 'CUST0004' THEN 'B 3456 JKL'
                WHEN c.customer_code = 'CUST0005' THEN 'B 7890 MNO'
                WHEN c.customer_code = 'CUST0006' THEN 'B 2468 PQR'
            END,
            CASE 
                WHEN c.customer_code = 'CUST0001' THEN 'Merah'
                WHEN c.customer_code = 'CUST0002' THEN 'Hitam'
                WHEN c.customer_code = 'CUST0003' THEN 'Biru'
                WHEN c.customer_code = 'CUST0004' THEN 'Putih'
                WHEN c.customer_code = 'CUST0005' THEN 'Abu-abu'
                WHEN c.customer_code = 'CUST0006' THEN 'Pink'
            END,
            true
        FROM customers c
        WHERE c.tenant_id = tenant_record.id
        AND c.customer_code IN ('CUST0001', 'CUST0002', 'CUST0003', 'CUST0004', 'CUST0005', 'CUST0006');
    END LOOP;
END $$;