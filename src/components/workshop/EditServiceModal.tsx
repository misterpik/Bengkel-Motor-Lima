import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Plus, 
  Trash2, 
  Package, 
  DollarSign,
  Calculator
} from 'lucide-react';
import { supabase } from '../../../supabase/supabase';
import { useAuth } from '../../../supabase/auth';
import { useToast } from '@/components/ui/use-toast';

interface Service {
  id: string;
  service_number: string;
  customer_name: string;
  customer_phone: string | null;
  vehicle_brand: string | null;
  vehicle_model: string | null;
  vehicle_year: number | null;
  license_plate: string | null;
  vehicle_km: number | null;
  complaint: string | null;
  status: string;
  technician: string | null;
  estimated_cost: number | null;
  actual_cost: number | null;
  service_fee: number | null;
  spareparts_total: number | null;
  progress: number;
}

interface Sparepart {
  id: string;
  code: string;
  name: string;
  selling_price: number | null;
  price: number | null; // fallback
  stock: number;
}

interface ServiceSparepart {
  id?: string;
  sparepart_id: string;
  sparepart_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

interface EditServiceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  serviceId: string | null;
  onServiceUpdated: () => void;
}

export default function EditServiceModal({ open, onOpenChange, serviceId, onServiceUpdated }: EditServiceModalProps) {
  const { tenantId } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [spareparts, setSpareparts] = useState<Sparepart[]>([]);
  const [serviceSpareparts, setServiceSpareparts] = useState<ServiceSparepart[]>([]);
  const [serviceTaxRate, setServiceTaxRate] = useState(0);
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    vehicleBrand: '',
    vehicleModel: '',
    vehicleYear: '',
    licensePlate: '',
    vehicleKm: '',
    complaint: '',
    technician: '',
    estimatedCost: '',
    serviceFee: '',
    status: '',
    progress: ''
  });

  const statusOptions = [
    'Antrian',
    'Dalam Proses', 
    'Menunggu Sparepart',
    'Selesai'
  ];

  const fetchSpareparts = async () => {
    if (!tenantId) return;
    
    try {
      const { data, error } = await supabase
        .from('spareparts')
        .select('id, code, name, selling_price, price, stock')
        .eq('tenant_id', tenantId)
        .gt('stock', 0)
        .order('name');

      if (error) throw error;
      setSpareparts(data || []);
    } catch (error: any) {
      console.error('Error fetching spareparts:', error);
    }
  };

  const fetchServiceData = async () => {
    if (!serviceId) return;
    
    setFetchLoading(true);
    try {
      // Fetch service data
      const { data: serviceData, error: serviceError } = await supabase
        .from('services')
        .select('*')
        .eq('id', serviceId)
        .single();

      if (serviceError) throw serviceError;

      // Fetch tenant tax rate
      const { data: tenantData, error: tenantError } = await supabase
        .from('tenants')
        .select('service_tax_rate')
        .eq('id', tenantId)
        .single();

      if (tenantError) throw tenantError;
      setServiceTaxRate(tenantData?.service_tax_rate || 0);

      // Fetch service spareparts
      const { data: sparepartsData, error: sparepartsError } = await supabase
        .from('service_spareparts')
        .select(`
          id,
          sparepart_id,
          quantity,
          unit_price,
          total_price,
          spareparts (name)
        `)
        .eq('service_id', serviceId);

      if (sparepartsError) throw sparepartsError;

      setFormData({
        customerName: serviceData.customer_name || '',
        customerPhone: serviceData.customer_phone || '',
        vehicleBrand: serviceData.vehicle_brand || '',
        vehicleModel: serviceData.vehicle_model || '',
        vehicleYear: serviceData.vehicle_year?.toString() || '',
        licensePlate: serviceData.license_plate || '',
        vehicleKm: serviceData.vehicle_km?.toString() || '',
        complaint: serviceData.complaint || '',
        technician: serviceData.technician || '',
        estimatedCost: serviceData.estimated_cost?.toString() || '',
        serviceFee: serviceData.service_fee?.toString() || '0',
        status: serviceData.status || '',
        progress: serviceData.progress?.toString() || '0'
      });

      // Set service spareparts
      const formattedSpareparts = sparepartsData.map(item => ({
        id: item.id,
        sparepart_id: item.sparepart_id,
        sparepart_name: item.spareparts?.name || 'Unknown',
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.total_price
      }));
      setServiceSpareparts(formattedSpareparts);

    } catch (error: any) {
      toast({
        title: "Error",
        description: "Gagal memuat data servis",
        variant: "destructive",
      });
    } finally {
      setFetchLoading(false);
    }
  };

  useEffect(() => {
    if (open && serviceId) {
      fetchServiceData();
      fetchSpareparts();
    }
  }, [open, serviceId]);

  const addSparepart = () => {
    setServiceSpareparts([...serviceSpareparts, {
      sparepart_id: '',
      sparepart_name: '',
      quantity: 1,
      unit_price: 0,
      total_price: 0
    }]);
  };

  const removeSparepart = (index: number) => {
    const newSpareparts = serviceSpareparts.filter((_, i) => i !== index);
    setServiceSpareparts(newSpareparts);
  };

  const updateSparepart = (index: number, field: string, value: any) => {
    const newSpareparts = [...serviceSpareparts];
    
    if (field === 'sparepart_id') {
      const selectedSparepart = spareparts.find(sp => sp.id === value);
      if (selectedSparepart) {
        newSpareparts[index].sparepart_id = value;
        newSpareparts[index].sparepart_name = selectedSparepart.name;
        newSpareparts[index].unit_price = selectedSparepart.selling_price || selectedSparepart.price || 0;
        newSpareparts[index].total_price = newSpareparts[index].quantity * (selectedSparepart.selling_price || selectedSparepart.price || 0);
      }
    } else if (field === 'quantity') {
      const quantity = parseInt(value) || 1;
      const selectedSparepart = spareparts.find(sp => sp.id === newSpareparts[index].sparepart_id);
      
      // Check stock availability
      if (selectedSparepart && quantity > selectedSparepart.stock) {
        toast({
          title: "Stok Tidak Cukup",
          description: `Stok ${selectedSparepart.name} hanya tersisa ${selectedSparepart.stock} unit`,
          variant: "destructive",
        });
        return;
      }
      
      newSpareparts[index].quantity = quantity;
      newSpareparts[index].total_price = newSpareparts[index].quantity * newSpareparts[index].unit_price;
    } else if (field === 'unit_price') {
      newSpareparts[index].unit_price = parseFloat(value) || 0;
      newSpareparts[index].total_price = newSpareparts[index].quantity * parseFloat(value || '0');
    }
    
    setServiceSpareparts(newSpareparts);
  };

  const calculateTotals = () => {
    const sparepartsTotal = serviceSpareparts.reduce((sum, item) => sum + item.total_price, 0);
    const serviceFee = parseFloat(formData.serviceFee) || 0;
    const subtotal = sparepartsTotal + serviceFee;
    const taxAmount = (subtotal * serviceTaxRate) / 100;
    const actualCost = subtotal + taxAmount;
    
    return { sparepartsTotal, serviceFee, subtotal, taxAmount, actualCost };
  };

  const { sparepartsTotal, subtotal, taxAmount, actualCost } = calculateTotals();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceId || !tenantId) {
      toast({
        title: "Error",
        description: "Data tidak lengkap",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { sparepartsTotal, actualCost } = calculateTotals();

      // Update service data
      const { error: serviceError } = await supabase
        .from('services')
        .update({
          customer_name: formData.customerName,
          customer_phone: formData.customerPhone || null,
          vehicle_brand: formData.vehicleBrand || null,
          vehicle_model: formData.vehicleModel || null,
          vehicle_year: formData.vehicleYear ? parseInt(formData.vehicleYear) : null,
          license_plate: formData.licensePlate || null,
          vehicle_km: formData.vehicleKm ? parseInt(formData.vehicleKm) : null,
          complaint: formData.complaint || null,
          technician: formData.technician || null,
          estimated_cost: formData.estimatedCost ? parseFloat(formData.estimatedCost) : null,
          service_fee: parseFloat(formData.serviceFee) || 0,
          spareparts_total: sparepartsTotal,
          base_cost: subtotal,
          tax_rate: serviceTaxRate,
          tax_amount: taxAmount,
          actual_cost: actualCost,
          status: formData.status,
          progress: formData.progress ? parseInt(formData.progress) : 0,
          updated_at: new Date().toISOString()
        })
        .eq('id', serviceId)
        .eq('tenant_id', tenantId);

      if (serviceError) throw serviceError;

      // Delete existing service spareparts
      const { error: deleteError } = await supabase
        .from('service_spareparts')
        .delete()
        .eq('service_id', serviceId);

      if (deleteError) throw deleteError;

      // Insert new service spareparts
      if (serviceSpareparts.length > 0) {
        const sparepartsToInsert = serviceSpareparts
          .filter(sp => sp.sparepart_id && sp.quantity > 0)
          .map(sp => ({
            service_id: serviceId,
            sparepart_id: sp.sparepart_id,
            quantity: sp.quantity,
            unit_price: sp.unit_price,
            total_price: sp.total_price
          }));

        if (sparepartsToInsert.length > 0) {
          const { error: insertError } = await supabase
            .from('service_spareparts')
            .insert(sparepartsToInsert);

          if (insertError) throw insertError;
        }
      }

      toast({
        title: "Berhasil",
        description: "Data servis berhasil diperbarui",
      });

      onServiceUpdated();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Gagal memperbarui servis",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (fetchLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-200 rounded w-1/3"></div>
            <div className="space-y-3">
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Servis</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Service Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informasi Dasar Servis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
                  <Select 
                    value={formData.vehicleBrand} 
                    onValueChange={(value) => handleInputChange('vehicleBrand', value)}
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
                  <Label htmlFor="status">Status *</Label>
                  <Select 
                    value={formData.status} 
                    onValueChange={(value) => handleInputChange('status', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih status" />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map(status => (
                        <SelectItem key={status} value={status}>{status}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                
                <div className="space-y-2">
                  <Label htmlFor="progress">Progress (%)</Label>
                  <Input
                    id="progress"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.progress}
                    onChange={(e) => handleInputChange('progress', e.target.value)}
                    placeholder="0"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Spareparts Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Package className="h-5 w-5 text-blue-600" />
                Biaya Sparepart
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {serviceSpareparts.map((sparepart, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">Sparepart {index + 1}</h4>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeSparepart(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label>Sparepart</Label>
                      <Select 
                        value={sparepart.sparepart_id} 
                        onValueChange={(value) => updateSparepart(index, 'sparepart_id', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih sparepart" />
                        </SelectTrigger>
                        <SelectContent>
                          {spareparts.map(sp => (
                            <SelectItem key={sp.id} value={sp.id} disabled={sp.stock === 0}>
                              <div className="flex justify-between items-center w-full">
                                <span>{sp.name}</span>
                                <Badge variant={sp.stock > 0 ? "default" : "destructive"} className="ml-2">
                                  Stok: {sp.stock}
                                </Badge>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Jumlah</Label>
                      <Input
                        type="number"
                        min="1"
                        max={spareparts.find(sp => sp.id === sparepart.sparepart_id)?.stock || 999}
                        value={sparepart.quantity}
                        onChange={(e) => updateSparepart(index, 'quantity', e.target.value)}
                        placeholder="1"
                      />
                      {sparepart.sparepart_id && (
                        <p className="text-xs text-gray-500">
                          Stok tersedia: {spareparts.find(sp => sp.id === sparepart.sparepart_id)?.stock || 0}
                        </p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Harga Satuan (Rp)</Label>
                      <Input
                        type="number"
                        min="0"
                        value={sparepart.unit_price}
                        onChange={(e) => updateSparepart(index, 'unit_price', e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Total Harga (Rp)</Label>
                      <div className="flex items-center h-10 px-3 bg-gray-50 border rounded-md">
                        <span className="font-medium text-green-600">
                          {sparepart.total_price.toLocaleString('id-ID')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              <Button
                type="button"
                variant="outline"
                onClick={addSparepart}
                className="w-full flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Tambah Sparepart
              </Button>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-blue-900">Total Biaya Sparepart:</span>
                  <span className="text-xl font-bold text-blue-600">
                    Rp {sparepartsTotal.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Service Fee and Total Cost */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                Biaya Jasa & Total
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="serviceFee">Biaya Jasa (Rp)</Label>
                <Input
                  id="serviceFee"
                  type="number"
                  min="0"
                  value={formData.serviceFee}
                  onChange={(e) => handleInputChange('serviceFee', e.target.value)}
                  placeholder="0"
                />
              </div>
              
              <Separator />
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Biaya Sparepart:</span>
                  <span className="font-medium">Rp {sparepartsTotal.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Biaya Jasa:</span>
                  <span className="font-medium">Rp {(parseFloat(formData.serviceFee) || 0).toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium">Rp {subtotal.toLocaleString('id-ID')}</span>
                </div>
                {serviceTaxRate > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Pajak ({serviceTaxRate}%):</span>
                    <span className="font-medium">Rp {taxAmount.toLocaleString('id-ID')}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between items-center bg-green-50 p-3 rounded-lg">
                  <span className="text-lg font-semibold text-green-900 flex items-center gap-2">
                    <Calculator className="h-5 w-5" />
                    Biaya Aktual (Total):
                  </span>
                  <span className="text-2xl font-bold text-green-600">
                    Rp {actualCost.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

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
              {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}