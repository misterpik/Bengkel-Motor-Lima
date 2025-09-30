import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Edit, Save, X } from 'lucide-react';
import { supabase } from '../../../supabase/supabase';
import { useAuth } from '../../../supabase/auth';
import { useToast } from '@/components/ui/use-toast';

interface Customer {
  id: string;
  customer_code: string;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  date_of_birth: string | null;
  gender: string | null;
  notes: string | null;
  created_at: string;
}

interface EditCustomerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer: Customer | null;
  onCustomerUpdated: () => void;
}

export default function EditCustomerModal({ open, onOpenChange, customer, onCustomerUpdated }: EditCustomerModalProps) {
  const { tenantId } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    date_of_birth: '',
    gender: '',
    notes: ''
  });

  useEffect(() => {
    if (customer && open) {
      setFormData({
        name: customer.name || '',
        phone: customer.phone || '',
        email: customer.email || '',
        address: customer.address || '',
        date_of_birth: customer.date_of_birth || '',
        gender: customer.gender || '',
        notes: customer.notes || ''
      });
    }
  }, [customer, open]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customer || !tenantId) return;

    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Nama pelanggan harus diisi",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('customers')
        .update({
          name: formData.name.trim(),
          phone: formData.phone.trim() || null,
          email: formData.email.trim() || null,
          address: formData.address.trim() || null,
          date_of_birth: formData.date_of_birth || null,
          gender: formData.gender || null,
          notes: formData.notes.trim() || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', customer.id)
        .eq('tenant_id', tenantId);

      if (error) throw error;

      toast({
        title: "Berhasil",
        description: "Data pelanggan berhasil diperbarui",
      });

      onCustomerUpdated();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Gagal memperbarui data pelanggan",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!customer) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5" />
            Edit Pelanggan - {customer.customer_code}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nama Lengkap *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Nama lengkap pelanggan"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Nomor Telepon</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="08123456789"
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
                placeholder="email@example.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="gender">Jenis Kelamin</Label>
              <Select value={formData.gender} onValueChange={(value) => handleInputChange('gender', value)}>
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

          <div className="space-y-2">
            <Label htmlFor="date_of_birth">Tanggal Lahir</Label>
            <Input
              id="date_of_birth"
              type="date"
              value={formData.date_of_birth}
              onChange={(e) => handleInputChange('date_of_birth', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Alamat</Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              placeholder="Alamat lengkap pelanggan"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Catatan</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Catatan tambahan tentang pelanggan"
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              <X className="h-4 w-4 mr-2" />
              Batal
            </Button>
            <Button type="submit" disabled={loading}>
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}