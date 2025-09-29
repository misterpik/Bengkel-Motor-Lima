import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { ShoppingCart, Plus, Minus, Package, Save, X } from 'lucide-react';
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
}

interface RestockSparepartModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sparepart: Sparepart | null;
  onSparepartUpdated: () => void;
}

export default function RestockSparepartModal({ open, onOpenChange, sparepart, onSparepartUpdated }: RestockSparepartModalProps) {
  const { tenantId } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [restockData, setRestockData] = useState({
    quantity: '',
    purchase_price: '',
    supplier: '',
    notes: ''
  });

  useEffect(() => {
    if (sparepart && open) {
      setRestockData({
        quantity: '',
        purchase_price: sparepart.purchase_price?.toString() || '',
        supplier: sparepart.supplier || '',
        notes: ''
      });
    }
  }, [sparepart, open]);

  const handleInputChange = (field: string, value: string) => {
    setRestockData(prev => ({ ...prev, [field]: value }));
  };

  const handleQuantityChange = (increment: boolean) => {
    const currentQty = parseInt(restockData.quantity) || 0;
    const newQty = increment ? currentQty + 1 : Math.max(0, currentQty - 1);
    setRestockData(prev => ({ ...prev, quantity: newQty.toString() }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sparepart || !tenantId) return;

    const quantity = parseInt(restockData.quantity);
    if (!quantity || quantity <= 0) {
      toast({
        title: "Error",
        description: "Jumlah restock harus lebih dari 0",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Update stock in spareparts table
      const newStock = sparepart.stock + quantity;
      const { error: updateError } = await supabase
        .from('spareparts')
        .update({
          stock: newStock,
          purchase_price: parseFloat(restockData.purchase_price) || sparepart.purchase_price,
          supplier: restockData.supplier || sparepart.supplier,
          updated_at: new Date().toISOString()
        })
        .eq('id', sparepart.id)
        .eq('tenant_id', tenantId);

      if (updateError) throw updateError;

      // Create restock history record (optional - you can create this table later)
      // This helps track restock history for inventory management
      try {
        await supabase
          .from('restock_history')
          .insert({
            tenant_id: tenantId,
            sparepart_id: sparepart.id,
            quantity: quantity,
            purchase_price: parseFloat(restockData.purchase_price) || null,
            supplier: restockData.supplier || null,
            notes: restockData.notes || null,
            previous_stock: sparepart.stock,
            new_stock: newStock,
            created_at: new Date().toISOString()
          });
      } catch (historyError) {
        // If restock_history table doesn't exist, just continue
        console.log('Restock history not recorded:', historyError);
      }

      toast({
        title: "Berhasil",
        description: `Stok ${sparepart.name} berhasil ditambah ${quantity} unit. Stok sekarang: ${newStock}`,
      });

      onSparepartUpdated();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Gagal melakukan restock",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!sparepart) return null;

  const newStock = sparepart.stock + (parseInt(restockData.quantity) || 0);
  const totalCost = (parseInt(restockData.quantity) || 0) * (parseFloat(restockData.purchase_price) || 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Restock Sparepart
          </DialogTitle>
        </DialogHeader>

        {/* Sparepart Info */}
        <Card className="bg-gray-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <img 
                src={sparepart.image_url || 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&q=80'} 
                alt={sparepart.name}
                className="w-12 h-12 object-cover rounded-lg"
              />
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{sparepart.name}</h3>
                <p className="text-sm text-gray-600">{sparepart.brand} • {sparepart.code}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Package className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">
                    Stok saat ini: <span className="font-semibold">{sparepart.stock}</span>
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Quantity Input */}
          <div className="space-y-2">
            <Label htmlFor="quantity">Jumlah Restock *</Label>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleQuantityChange(false)}
                disabled={parseInt(restockData.quantity) <= 0}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={restockData.quantity}
                onChange={(e) => handleInputChange('quantity', e.target.value)}
                placeholder="0"
                className="text-center"
                required
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleQuantityChange(true)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Purchase Price */}
          <div className="space-y-2">
            <Label htmlFor="purchase_price">Harga Beli per Unit</Label>
            <Input
              id="purchase_price"
              type="number"
              min="0"
              step="0.01"
              value={restockData.purchase_price}
              onChange={(e) => handleInputChange('purchase_price', e.target.value)}
              placeholder="0"
            />
          </div>

          {/* Supplier */}
          <div className="space-y-2">
            <Label htmlFor="supplier">Supplier</Label>
            <Input
              id="supplier"
              value={restockData.supplier}
              onChange={(e) => handleInputChange('supplier', e.target.value)}
              placeholder="Nama supplier"
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Catatan</Label>
            <Textarea
              id="notes"
              value={restockData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Catatan restock..."
              rows={2}
            />
          </div>

          {/* Summary */}
          {parseInt(restockData.quantity) > 0 && (
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <h4 className="font-semibold text-blue-900 mb-2">Ringkasan Restock</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-blue-700">Jumlah:</span>
                    <span className="font-semibold text-blue-900">{restockData.quantity} unit</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">Stok baru:</span>
                    <span className="font-semibold text-blue-900">{newStock} unit</span>
                  </div>
                  {totalCost > 0 && (
                    <div className="flex justify-between">
                      <span className="text-blue-700">Total biaya:</span>
                      <span className="font-semibold text-blue-900">
                        Rp {totalCost.toLocaleString('id-ID')}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

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
              {loading ? 'Memproses...' : 'Konfirmasi Restock'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}