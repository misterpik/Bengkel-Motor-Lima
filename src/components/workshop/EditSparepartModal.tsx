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

interface Sparepart {
  id: string;
  code: string;
  name: string;
  category: string | null;
  brand: string | null;
  stock: number;
  minimum_stock: number;
  price: number | null;
  purchase_price: number | null;
  selling_price: number | null;
  supplier: string | null;
  location: string | null;
  image_url: string | null;
  description: string | null;
}

interface EditSparepartModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sparepart: Sparepart | null;
  onSparepartUpdated: () => void;
}

export default function EditSparepartModal({ open, onOpenChange, sparepart, onSparepartUpdated }: EditSparepartModalProps) {
  const { tenantId } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    category: '',
    brand: '',
    stock: '',
    minimum_stock: '',
    purchase_price: '',
    selling_price: '',
    supplier: '',
    location: '',
    image_url: '',
    description: ''
  });

  const categories = [
    'Oli & Pelumas',
    'Ban & Velg', 
    'Rem',
    'Filter',
    'Kelistrikan',
    'Transmisi',
    'Mesin',
    'Body & Aksesoris',
    'Lainnya'
  ];

  useEffect(() => {
    if (sparepart && open) {
      setFormData({
        code: sparepart.code || '',
        name: sparepart.name || '',
        category: sparepart.category || '',
        brand: sparepart.brand || '',
        stock: sparepart.stock?.toString() || '',
        minimum_stock: sparepart.minimum_stock?.toString() || '',
        purchase_price: sparepart.purchase_price?.toString() || '',
        selling_price: (sparepart.selling_price || sparepart.price)?.toString() || '',
        supplier: sparepart.supplier || '',
        location: sparepart.location || '',
        image_url: sparepart.image_url || '',
        description: sparepart.description || ''
      });
    }
  }, [sparepart, open]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sparepart || !tenantId) return;

    if (!formData.name.trim() || !formData.code.trim()) {
      toast({
        title: "Error",
        description: "Nama dan kode sparepart harus diisi",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('spareparts')
        .update({
          code: formData.code.trim(),
          name: formData.name.trim(),
          category: formData.category || null,
          brand: formData.brand || null,
          stock: parseInt(formData.stock) || 0,
          minimum_stock: parseInt(formData.minimum_stock) || 0,
          purchase_price: parseFloat(formData.purchase_price) || null,
          selling_price: parseFloat(formData.selling_price) || null,
          supplier: formData.supplier || null,
          location: formData.location || null,
          image_url: formData.image_url || null,
          description: formData.description || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', sparepart.id)
        .eq('tenant_id', tenantId);

      if (error) throw error;

      toast({
        title: "Berhasil",
        description: "Data sparepart berhasil diperbarui",
      });

      onSparepartUpdated();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Gagal memperbarui sparepart",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5" />
            Edit Sparepart
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="code">Kode Sparepart *</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => handleInputChange('code', e.target.value)}
                placeholder="SP001"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Nama Sparepart *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Oli Mesin 10W-40"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Kategori</Label>
              <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih kategori" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="brand">Brand/Merk</Label>
              <Input
                id="brand"
                value={formData.brand}
                onChange={(e) => handleInputChange('brand', e.target.value)}
                placeholder="Honda, Yamaha, dll"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="stock">Stok Saat Ini</Label>
              <Input
                id="stock"
                type="number"
                min="0"
                value={formData.stock}
                onChange={(e) => handleInputChange('stock', e.target.value)}
                placeholder="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="minimum_stock">Stok Minimum</Label>
              <Input
                id="minimum_stock"
                type="number"
                min="0"
                value={formData.minimum_stock}
                onChange={(e) => handleInputChange('minimum_stock', e.target.value)}
                placeholder="5"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="purchase_price">Harga Beli</Label>
              <Input
                id="purchase_price"
                type="number"
                min="0"
                step="0.01"
                value={formData.purchase_price}
                onChange={(e) => handleInputChange('purchase_price', e.target.value)}
                placeholder="50000"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="selling_price">Harga Jual</Label>
              <Input
                id="selling_price"
                type="number"
                min="0"
                step="0.01"
                value={formData.selling_price}
                onChange={(e) => handleInputChange('selling_price', e.target.value)}
                placeholder="75000"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="supplier">Supplier</Label>
              <Input
                id="supplier"
                value={formData.supplier}
                onChange={(e) => handleInputChange('supplier', e.target.value)}
                placeholder="PT. Supplier ABC"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Lokasi Penyimpanan</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="Rak A-1"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="image_url">URL Gambar</Label>
            <Input
              id="image_url"
              value={formData.image_url}
              onChange={(e) => handleInputChange('image_url', e.target.value)}
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Deskripsi</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Deskripsi sparepart..."
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