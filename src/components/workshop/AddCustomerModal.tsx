import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '../../../supabase/supabase';
import { useAuth } from '../../../supabase/auth';
import { useToast } from '@/components/ui/use-toast';

interface AddCustomerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCustomerAdded: () => void;
}

export default function AddCustomerModal({ open, onOpenChange, onCustomerAdded }: AddCustomerModalProps) {
  const { tenantId } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    dateOfBirth: '',
    gender: '',
    notes: '',
    // Vehicle data
    vehicleBrand: '',
    vehicleModel: '',
    vehicleYear: '',
    licensePlate: '',
    engineNumber: '',
    chassisNumber: '',
    color: ''
  });

  const generateCustomerCode = () => {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `CUST${year}${month}${random}`;
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
      const customerCode = generateCustomerCode();
      
      // Insert customer
      const { data: customer, error: customerError } = await supabase
        .from('customers')
        .insert({
          tenant_id: tenantId,
          customer_code: customerCode,
          name: formData.name,
          phone: formData.phone || null,
          email: formData.email || null,
          address: formData.address || null,
          date_of_birth: formData.dateOfBirth || null,
          gender: formData.gender || null,
          notes: formData.notes || null
        })
        .select()
        .single();

      if (customerError) throw customerError;

      // Insert vehicle if provided
      if (formData.vehicleBrand || formData.vehicleModel || formData.licensePlate) {
        const { error: vehicleError } = await supabase
          .from('customer_vehicles')
          .insert({
            customer_id: customer.id,
            brand: formData.vehicleBrand || null,
            model: formData.vehicleModel || null,
            year: formData.vehicleYear ? parseInt(formData.vehicleYear) : null,
            license_plate: formData.licensePlate || null,
            engine_number: formData.engineNumber || null,
            chassis_number: formData.chassisNumber || null,
            color: formData.color || null,
            is_primary: true
          });

        if (vehicleError) throw vehicleError;
      }

      toast({
        title: "Berhasil",
        description: "Pelanggan baru berhasil ditambahkan",
      });

      // Reset form
      setFormData({
        name: '',
        phone: '',
        email: '',
        address: '',
        dateOfBirth: '',
        gender: '',
        notes: '',
        vehicleBrand: '',
        vehicleModel: '',
        vehicleYear: '',
        licensePlate: '',
        engineNumber: '',
        chassisNumber: '',
        color: ''
      });

      onCustomerAdded();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Gagal menambahkan pelanggan",
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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Tambah Pelanggan Baru</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Customer Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Informasi Pelanggan</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nama Lengkap *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">No. Telepon</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="081234567890"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="nama@email.com"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="gender">Jenis Kelamin</Label>
                <Select onValueChange={(value) => handleInputChange('gender', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih jenis kelamin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Laki-laki">Laki-laki</SelectItem>
                    <SelectItem value="Perempuan">Perempuan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Tanggal Lahir</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="address">Alamat</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="Alamat lengkap pelanggan"
                  rows={2}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Catatan</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Catatan tambahan tentang pelanggan"
                rows={2}
              />
            </div>
          </div>

          {/* Vehicle Information */}
          <div className="space-y-4 border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900">Informasi Kendaraan (Opsional)</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="vehicleBrand">Merk</Label>
                <Select onValueChange={(value) => handleInputChange('vehicleBrand', value)}>
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
                  placeholder="Beat, Vario, Mio, dll"
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
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="color">Warna</Label>
                <Input
                  id="color"
                  value={formData.color}
                  onChange={(e) => handleInputChange('color', e.target.value)}
                  placeholder="Merah, Hitam, Putih, dll"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="engineNumber">No. Mesin</Label>
                <Input
                  id="engineNumber"
                  value={formData.engineNumber}
                  onChange={(e) => handleInputChange('engineNumber', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="chassisNumber">No. Rangka</Label>
                <Input
                  id="chassisNumber"
                  value={formData.chassisNumber}
                  onChange={(e) => handleInputChange('chassisNumber', e.target.value)}
                />
              </div>
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
              {loading ? 'Menyimpan...' : 'Simpan Pelanggan'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}