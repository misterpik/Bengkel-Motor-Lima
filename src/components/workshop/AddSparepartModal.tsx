import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
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
  const [openSuggestions, setOpenSuggestions] = useState(false);
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

  // Common motorcycle sparepart names in Indonesia
  const sparepartSuggestions = [
    // Oli & Pelumas
    'Oli Mesin 4T SAE 20W-50',
    'Oli Mesin 4T SAE 10W-40',
    'Oli Transmisi SAE 90',
    'Oli Gardan SAE 140',
    'Oli Rem DOT 3',
    'Oli Rem DOT 4',
    'Gemuk/Grease',
    
    // Filter
    'Filter Udara',
    'Filter Oli',
    'Filter Bensin',
    'Saringan Udara Karburator',
    
    // Ban & Velg
    'Ban Depan 70/90-17',
    'Ban Belakang 80/90-17',
    'Ban Depan 90/90-14',
    'Ban Belakang 100/90-14',
    'Ban Tubeless 110/70-17',
    'Ban Tubeless 140/70-17',
    'Velg Racing 17 inch',
    'Velg Standard',
    'Pentil Ban',
    'Lem Ban',
    
    // Rem
    'Kampas Rem Depan',
    'Kampas Rem Belakang',
    'Kampas Rem Tromol',
    'Minyak Rem',
    'Selang Rem',
    'Master Rem Depan',
    'Master Rem Belakang',
    'Kaliper Rem',
    'Piringan Rem/Disc Brake',
    
    // Kelistrikan
    'Aki/Accu 12V 5Ah',
    'Aki/Accu 12V 7Ah',
    'Busi NGK',
    'Busi Denso',
    'Busi Iridium',
    'Lampu Depan H4',
    'Lampu Depan LED',
    'Lampu Belakang',
    'Lampu Sen',
    'Klakson',
    'CDI',
    'Koil Pengapian',
    'Kiprok/Regulator',
    'Dinamo Starter',
    'Alternator/Spul',
    'Kabel Body',
    'Sekring/Fuse',
    
    // Transmisi
    'V-Belt',
    'Roller CVT',
    'Sliding Piece CVT',
    'Kampas Kopling',
    'Per Kopling',
    'Rumah Kopling',
    'Gir Depan',
    'Gir Belakang',
    'Rantai',
    'Tensioner Rantai',
    
    // Mesin
    'Piston Kit',
    'Ring Piston',
    'Pin Piston',
    'Gasket Head',
    'Gasket Blok',
    'Klep In',
    'Klep Ex',
    'Per Klep',
    'Noken As',
    'Bearing Kruk As',
    'Seal Klep',
    'Seal Water Pump',
    'Radiator',
    'Thermostat',
    'Water Pump',
    'Karburator',
    'Membran Karburator',
    'Jarum Skep',
    'Main Jet',
    'Pilot Jet',
    
    // Suspensi & Kemudi
    'Shock Depan',
    'Shock Belakang',
    'Per Shock',
    'Bushing Shock',
    'Bearing Stang',
    'Komstir',
    'Stang Seher',
    'Grip Stang',
    'Spion',
    
    // Body & Aksesoris
    'Spakbor Depan',
    'Spakbor Belakang',
    'Jok/Seat',
    'Cover Jok',
    'Windshield',
    'Box Motor',
    'Bracket Box',
    'Kaca Spion',
    'Handle Rem',
    'Handle Gas',
    'Pedal Rem',
    'Footstep',
    'Standar Tengah',
    'Standar Samping',
    
    // Lainnya
    'Kunci Kontak',
    'Speedometer',
    'Kabel Speedometer',
    'Kabel Gas',
    'Kabel Rem',
    'Kabel Kopling',
    'Selang Bensin',
    'Tutup Tangki',
    'Kran Bensin',
    'Knalpot',
    'Paking Knalpot',
    'Baut & Mur Set'
  ];

  const categories = [
    'Oli & Pelumas',
    'Ban & Velg',
    'Rem',
    'Filter',
    'Kelistrikan',
    'Transmisi',
    'Mesin',
    'Suspensi & Kemudi',
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
              <Popover open={openSuggestions} onOpenChange={setOpenSuggestions}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openSuggestions}
                    className="w-full justify-between"
                  >
                    {formData.name || "Pilih atau ketik nama sparepart..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput 
                      placeholder="Cari nama sparepart..." 
                      value={formData.name}
                      onValueChange={(value) => handleInputChange('name', value)}
                    />
                    <CommandList>
                      <CommandEmpty>Tidak ada sparepart yang ditemukan.</CommandEmpty>
                      <CommandGroup>
                        {sparepartSuggestions
                          .filter(item => 
                            item.toLowerCase().includes(formData.name.toLowerCase())
                          )
                          .slice(0, 10)
                          .map((suggestion) => (
                            <CommandItem
                              key={suggestion}
                              value={suggestion}
                              onSelect={(currentValue) => {
                                handleInputChange('name', currentValue);
                                setOpenSuggestions(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  formData.name === suggestion ? "opacity-100" : "opacity-0"
                                )}
                              />
                              {suggestion}
                            </CommandItem>
                          ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              <p className="text-xs text-gray-500">
                Pilih dari saran atau ketik nama sparepart sendiri
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="brand">Brand/Merk</Label>
              <Input
                id="brand"
                value={formData.brand}
                onChange={(e) => handleInputChange('brand', e.target.value)}
                placeholder="Honda, Yamaha, Suzuki, dll"
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