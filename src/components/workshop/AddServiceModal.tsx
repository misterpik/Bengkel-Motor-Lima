import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '../../../supabase/supabase';
import { useAuth } from '../../../supabase/auth';
import { useToast } from '@/components/ui/use-toast';

interface Customer {
  id: string;
  name: string;
  phone: string | null;
  customer_vehicles: Vehicle[];
}

interface Vehicle {
  id: string;
  brand: string | null;
  model: string | null;
  year: number | null;
  license_plate: string | null;
  is_primary: boolean;
}

interface AddServiceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onServiceAdded: () => void;
}

export default function AddServiceModal({ open, onOpenChange, onServiceAdded }: AddServiceModalProps) {
  const { tenantId } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [serviceTaxRate, setServiceTaxRate] = useState(0);
  const [formData, setFormData] = useState({
    customerId: '',
    customerName: '',
    customerPhone: '',
    vehicleBrand: '',
    vehicleModel: '',
    vehicleYear: '',
    licensePlate: '',
    vehicleKm: '',
    complaint: '',
    technician: '',
    estimatedCost: ''
  });

  const calculateTotalWithTax = (baseAmount: number) => {
    const taxAmount = (baseAmount * serviceTaxRate) / 100;
    return baseAmount + taxAmount;
  };

  const getTaxAmount = (baseAmount: number) => {
    return (baseAmount * serviceTaxRate) / 100;
  };

  const fetchWorkshopSettings = async () => {
    if (!tenantId) return;
    
    try {
      const { data, error } = await supabase
        .from('tenants')
        .select('service_tax_rate')
        .eq('id', tenantId)
        .single();

      if (error) throw error;
      setServiceTaxRate(data?.service_tax_rate || 0);
    } catch (error: any) {
      console.error('Error fetching workshop settings:', error);
    }
  };

  const fetchCustomers = async () => {
    if (!tenantId) return;
    
    try {
      const { data, error } = await supabase
        .from('customers')
        .select(`
          id,
          name,
          phone,
          customer_vehicles (
            id,
            brand,
            model,
            year,
            license_plate,
            is_primary
          )
        `)
        .eq('tenant_id', tenantId)
        .order('name');

      if (error) throw error;
      setCustomers(data || []);
    } catch (error: any) {
      console.error('Error fetching customers:', error);
    }
  };

  useEffect(() => {
    if (open) {
      fetchCustomers();
      fetchWorkshopSettings();
    }
  }, [open, tenantId]);

  const generateServiceNumber = () => {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `SRV${year}${month}${day}${random}`;
  };

  const handleCustomerChange = (customerId: string) => {
    const customer = customers.find(c => c.id === customerId);
    if (customer) {
      setSelectedCustomer(customer);
      
      // Get primary vehicle or first vehicle
      const primaryVehicle = customer.customer_vehicles.find(v => v.is_primary) || customer.customer_vehicles[0];
      
      setFormData(prev => ({
        ...prev,
        customerId: customer.id,
        customerName: customer.name,
        customerPhone: customer.phone || '',
        vehicleBrand: primaryVehicle?.brand || '',
        vehicleModel: primaryVehicle?.model || '',
        vehicleYear: primaryVehicle?.year?.toString() || '',
        licensePlate: primaryVehicle?.license_plate || ''
      }));
      
      setSelectedVehicle(primaryVehicle || null);
    }
  };

  const handleVehicleChange = (vehicleId: string) => {
    if (!selectedCustomer) return;
    
    const vehicle = selectedCustomer.customer_vehicles.find(v => v.id === vehicleId);
    if (vehicle) {
      setSelectedVehicle(vehicle);
      setFormData(prev => ({
        ...prev,
        vehicleBrand: vehicle.brand || '',
        vehicleModel: vehicle.model || '',
        vehicleYear: vehicle.year?.toString() || '',
        licensePlate: vehicle.license_plate || ''
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantId) {
      toast({
        title: "Error",
        description: "Tenant ID tidak ditemukan",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const serviceNumber = generateServiceNumber();
      
      const baseAmount = formData.estimatedCost ? parseFloat(formData.estimatedCost) : 0;
      
      const { error } = await supabase
        .from('services')
        .insert({
          tenant_id: tenantId,
          customer_id: formData.customerId || null,
          service_number: serviceNumber,
          customer_name: formData.customerName,
          customer_phone: formData.customerPhone || null,
          vehicle_brand: formData.vehicleBrand || null,
          vehicle_model: formData.vehicleModel || null,
          vehicle_year: formData.vehicleYear ? parseInt(formData.vehicleYear) : null,
          license_plate: formData.licensePlate || null,
          vehicle_km: formData.vehicleKm ? parseInt(formData.vehicleKm) : null,
          complaint: formData.complaint,
          technician: formData.technician || null,
          estimated_cost: baseAmount > 0 ? baseAmount : null,
          status: 'Antrian',
          progress: 0
        });

      if (error) throw error;

      toast({
        title: "Berhasil",
        description: "Servis baru berhasil ditambahkan",
      });

      // Reset form
      setFormData({
        customerId: '',
        customerName: '',
        customerPhone: '',
        vehicleBrand: '',
        vehicleModel: '',
        vehicleYear: '',
        licensePlate: '',
        vehicleKm: '',
        complaint: '',
        technician: '',
        estimatedCost: ''
      });
      setSelectedCustomer(null);
      setSelectedVehicle(null);

      onServiceAdded();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Gagal menambahkan servis",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Tambah Servis Baru</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="customer">Nama Pelanggan *</Label>
              <Select onValueChange={handleCustomerChange} value={formData.customerId}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih pelanggan" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map(customer => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.name} {customer.phone && `(${customer.phone})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {!formData.customerId && (
                <Input
                  placeholder="Atau ketik nama pelanggan baru"
                  value={formData.customerName}
                  onChange={(e) => handleInputChange('customerName', e.target.value)}
                />
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="customerPhone">No. Telepon</Label>
              <Input
                id="customerPhone"
                value={formData.customerPhone}
                onChange={(e) => handleInputChange('customerPhone', e.target.value)}
                disabled={!!formData.customerId}
              />
            </div>
          </div>

          {selectedCustomer && selectedCustomer.customer_vehicles.length > 1 && (
            <div className="space-y-2">
              <Label htmlFor="vehicle">Pilih Kendaraan</Label>
              <Select onValueChange={handleVehicleChange} value={selectedVehicle?.id || ''}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih kendaraan" />
                </SelectTrigger>
                <SelectContent>
                  {selectedCustomer.customer_vehicles.map(vehicle => (
                    <SelectItem key={vehicle.id} value={vehicle.id}>
                      {vehicle.brand} {vehicle.model} {vehicle.year} - {vehicle.license_plate}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="vehicleBrand">Merk Kendaraan</Label>
              <Select 
                value={formData.vehicleBrand} 
                onValueChange={(value) => handleInputChange('vehicleBrand', value)}
                disabled={!!formData.customerId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih merk" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Honda">Honda</SelectItem>
                  <SelectItem value="Yamaha">Yamaha</SelectItem>
                  <SelectItem value="Suzuki">Suzuki</SelectItem>
                  <SelectItem value="Kawasaki">Kawasaki</SelectItem>
                  <SelectItem value="TVS">TVS</SelectItem>
                  <SelectItem value="Lainnya">Lainnya</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="vehicleModel">Model/Tipe</Label>
              <Input
                id="vehicleModel"
                value={formData.vehicleModel}
                onChange={(e) => handleInputChange('vehicleModel', e.target.value)}
                disabled={!!formData.customerId}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="vehicleYear">Tahun</Label>
              <Input
                id="vehicleYear"
                type="number"
                min="1990"
                max="2025"
                value={formData.vehicleYear}
                onChange={(e) => handleInputChange('vehicleYear', e.target.value)}
                disabled={!!formData.customerId}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="licensePlate">Plat Nomor</Label>
              <Input
                id="licensePlate"
                value={formData.licensePlate}
                onChange={(e) => handleInputChange('licensePlate', e.target.value)}
                placeholder="B 1234 ABC"
                disabled={!!formData.customerId}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="vehicleKm">Kilometer (KM)</Label>
              <Input
                id="vehicleKm"
                type="number"
                min="0"
                value={formData.vehicleKm}
                onChange={(e) => handleInputChange('vehicleKm', e.target.value)}
                placeholder="12000"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="complaint">Keluhan/Masalah *</Label>
            <Textarea
              id="complaint"
              value={formData.complaint}
              onChange={(e) => handleInputChange('complaint', e.target.value)}
              placeholder="Deskripsikan masalah atau keluhan pelanggan..."
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="technician">Teknisi</Label>
              <Input
                id="technician"
                value={formData.technician}
                onChange={(e) => handleInputChange('technician', e.target.value)}
                placeholder="Nama teknisi yang menangani"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="estimatedCost">Estimasi Biaya Dasar (Rp)</Label>
              <Input
                id="estimatedCost"
                type="number"
                min="0"
                value={formData.estimatedCost}
                onChange={(e) => handleInputChange('estimatedCost', e.target.value)}
                placeholder="0"
              />
              <p className="text-xs text-gray-500">
                Biaya dasar tanpa pajak (pajak akan ditambahkan otomatis pada invoice)
              </p>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Batal
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Menyimpan...' : 'Simpan Servis'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}