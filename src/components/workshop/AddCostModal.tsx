import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Save, X } from 'lucide-react';
import { supabase } from '../../../supabase/supabase';
import { useAuth } from '../../../supabase/auth';
import { useToast } from '@/components/ui/use-toast';

interface AddCostModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCostAdded: () => void;
}

const PREDEFINED_COSTS = [
  'Gaji Karyawan',
  'Biaya Listrik',
  'Biaya Air',
  'Biaya Internet',
  'Biaya Sewa Tempat',
  'Biaya Maintenance Alat',
  'Biaya Marketing'
];

export default function AddCostModal({ open, onOpenChange, onCostAdded }: AddCostModalProps) {
  const { tenantId, user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    cost_name: '',
    amount: '',
    cost_date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  // Use user.id as fallback if tenantId is not available
  const effectiveTenantId = tenantId || user?.id;

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!effectiveTenantId) return;

    if (!formData.cost_name.trim() || !formData.amount.trim()) {
      toast({
        title: "Error",
        description: "Nama biaya dan jumlah harus diisi",
        variant: "destructive",
      });
      return;
    }

    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Error",
        description: "Jumlah biaya harus berupa angka positif",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('costs')
        .insert({
          tenant_id: effectiveTenantId,
          cost_name: formData.cost_name.trim(),
          amount: amount,
          cost_date: formData.cost_date,
          notes: formData.notes.trim() || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      toast({
        title: "Berhasil",
        description: "Biaya berhasil ditambahkan",
      });

      // Reset form
      setFormData({
        cost_name: '',
        amount: '',
        cost_date: new Date().toISOString().split('T')[0],
        notes: ''
      });

      onCostAdded();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Gagal menambahkan biaya",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Tambah Biaya
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cost_name">Nama Biaya *</Label>
            <Select value={formData.cost_name} onValueChange={(value) => handleInputChange('cost_name', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih jenis biaya" />
              </SelectTrigger>
              <SelectContent>
                {PREDEFINED_COSTS.map((cost) => (
                  <SelectItem key={cost} value={cost}>
                    {cost}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Jumlah Biaya (Rp) *</Label>
            <Input
              id="amount"
              type="number"
              min="0"
              step="0.01"
              value={formData.amount}
              onChange={(e) => handleInputChange('amount', e.target.value)}
              placeholder="0"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cost_date">Tanggal Biaya</Label>
            <Input
              id="cost_date"
              type="date"
              value={formData.cost_date}
              onChange={(e) => handleInputChange('cost_date', e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Catatan</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Catatan tambahan (opsional)"
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
              {loading ? 'Menyimpan...' : 'Simpan Biaya'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}