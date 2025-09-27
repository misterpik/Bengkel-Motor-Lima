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

interface AddServiceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onServiceAdded: () => void;
}

export default function AddServiceModal({ open, onOpenChange, onServiceAdded }: AddServiceModalProps) {
  const { tenantId } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    vehicleBrand: '',
    vehicleModel: '',
    vehicleYear: '',
    licensePlate: '',
    complaint: '',
    technician: '',
    estimatedCost: ''
  });

  const generateServiceNumber = () => {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `SRV${year}${month}${day}${random}`;
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
      
      const { error } = await supabase
        .from('services')
        .insert({
          tenant_id: tenantId,
          service_number: serviceNumber,
          customer_name: formData.customerName,
          customer_phone: formData.customerPhone,
          vehicle_brand: formData.vehicleBrand,
          vehicle_model: formData.vehicleModel,
          vehicle_year: formData.vehicleYear ? parseInt(formData.vehicleYear) : null,
          license_plate: formData.licensePlate,
          complaint: formData.complaint,
          technician: formData.technician || null,
          estimated_cost: formData.estimatedCost ? parseFloat(formData.estimatedCost) : null,
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
        customerName: '',
        customerPhone: '',
        vehicleBrand: '',
        vehicleModel: '',
        vehicleYear: '',
        licensePlate: '',
        complaint: '',
        technician: '',
        estimatedCost: ''
      });

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
              <Label htmlFor="customerName">Nama Pelanggan *</Label>
              <Input
                id="customerName"
                value={formData.customerName}
                onChange={(e) => handleInputChange('customerName', e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="customerPhone">No. Telepon</Label>
              <Input
                id="customerPhone"
                value={formData.customerPhone}
                onChange={(e) => handleInputChange('customerPhone', e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="vehicleBrand">Merk Kendaraan</Label>
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
              <Label htmlFor="estimatedCost">Estimasi Biaya (Rp)</Label>
              <Input
                id="estimatedCost"
                type="number"
                min="0"
                value={formData.estimatedCost}
                onChange={(e) => handleInputChange('estimatedCost', e.target.value)}
                placeholder="0"
              />
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