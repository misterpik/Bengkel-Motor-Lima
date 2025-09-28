import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '../../../supabase/supabase';
import { useAuth } from '../../../supabase/auth';
import { useToast } from '@/components/ui/use-toast';

interface AddSparepartModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSparepartAdded: () => void;
}

export default function AddSparepartModal({ open, onOpenChange, onSparepartAdded }: AddSparepartModalProps) {
  const { tenantId } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    brand: '',
    stock: '',
    minimumStock: '',
    purchasePrice: '',
    sellingPrice: '',
    supplier: '',
    location: '',
    imageUrl: ''
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

  const generateSparepartCode = () => {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `SP${year}${month}${random}`;
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
      const sparepartCode = generateSparepartCode();
      
      const { error } = await supabase
        .from('spareparts')
        .insert({
          tenant_id: tenantId,
          code: sparepartCode,
          name: formData.name,
          category: formData.category,
          brand: formData.brand,
          stock: formData.stock ? parseInt(formData.stock) : 0,
          minimum_stock: formData.minimumStock ? parseInt(formData.minimumStock) : 0,
          purchase_price: formData.purchasePrice ? parseFloat(formData.purchasePrice) : null,
          selling_price: formData.sellingPrice ? parseFloat(formData.sellingPrice) : null,
          supplier: formData.supplier || null,
          location: formData.location || null,
          image_url: formData.imageUrl || null
        });

      if (error) throw error;

      toast({
        title: "Berhasil",
        description: "Sparepart baru berhasil ditambahkan",
      });

      // Reset form
      setFormData({
        name: '',
        category: '',
        brand: '',
        stock: '',
        minimumStock: '',
        purchasePrice: '',
        sellingPrice: '',
        supplier: '',
        location: '',
        imageUrl: ''
      });

      onSparepartAdded();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Gagal menambahkan sparepart",
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
          <DialogTitle>Tambah Sparepart Baru</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nama Sparepart *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="brand">Brand/Merk</Label>
              <Input
                id="brand"
                value={formData.brand}
                onChange={(e) => handleInputChange('brand', e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Kategori</Label>
              <Select onValueChange={(value) => handleInputChange('category', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih kategori" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="location">Lokasi Rak</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="Rak A-1"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="stock">Stok Awal</Label>
              <Input
                id="stock"
                type="number"
                min="0"
                value={formData.stock}
                onChange={(e) => handleInputChange('stock', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="minimumStock">Stok Minimum</Label>
              <Input
                id="minimumStock"
                type="number"
                min="0"
                value={formData.minimumStock}
                onChange={(e) => handleInputChange('minimumStock', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="supplier">Supplier</Label>
              <Input
                id="supplier"
                value={formData.supplier}
                onChange={(e) => handleInputChange('supplier', e.target.value)}
                placeholder="Nama supplier/distributor"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="purchasePrice">Harga Beli (Rp)</Label>
              <Input
                id="purchasePrice"
                type="number"
                min="0"
                value={formData.purchasePrice}
                onChange={(e) => handleInputChange('purchasePrice', e.target.value)}
                placeholder="0"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="sellingPrice">Harga Jual (Rp)</Label>
              <Input
                id="sellingPrice"
                type="number"
                min="0"
                value={formData.sellingPrice}
                onChange={(e) => handleInputChange('sellingPrice', e.target.value)}
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
              {loading ? 'Menyimpan...' : 'Simpan Sparepart'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}