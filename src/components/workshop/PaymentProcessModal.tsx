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
  CreditCard, 
  Banknote, 
  Smartphone,
  Receipt,
  CheckCircle,
  AlertCircle,
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
  actual_cost: number | null;
  service_fee: number | null;
  spareparts_total: number | null;
  payment_status: string | null;
  payment_date: string | null;
}

interface Payment {
  id: string;
  payment_number: string;
  payment_date: string;
  amount: number;
  payment_method: string;
  payment_status: string;
  notes: string | null;
}

interface PaymentProcessModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  serviceId: string | null;
  onPaymentProcessed: () => void;
}

export default function PaymentProcessModal({ open, onOpenChange, serviceId, onPaymentProcessed }: PaymentProcessModalProps) {
  const { tenantId } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [service, setService] = useState<Service | null>(null);
  const [existingPayments, setExistingPayments] = useState<Payment[]>([]);
  const [formData, setFormData] = useState({
    amount: '',
    paymentMethod: '',
    cashReceived: '',
    notes: ''
  });

  const paymentMethods = [
    { value: 'Tunai', label: 'Tunai', icon: Banknote },
    { value: 'Transfer Bank', label: 'Transfer Bank', icon: CreditCard },
    { value: 'E-Wallet', label: 'E-Wallet (OVO, GoPay, DANA)', icon: Smartphone },
    { value: 'Kartu Kredit', label: 'Kartu Kredit', icon: CreditCard },
    { value: 'Kartu Debit', label: 'Kartu Debit', icon: CreditCard }
  ];

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

      // Fetch existing payments
      const { data: paymentsData, error: paymentsError } = await supabase
        .from('payments')
        .select('*')
        .eq('service_id', serviceId)
        .order('created_at', { ascending: false });

      if (paymentsError) throw paymentsError;

      setService(serviceData);
      setExistingPayments(paymentsData || []);
      
      // Set default amount to remaining balance
      const totalPaid = (paymentsData || []).reduce((sum, payment) => sum + payment.amount, 0);
      const remainingAmount = (serviceData.actual_cost || 0) - totalPaid;
      setFormData(prev => ({
        ...prev,
        amount: remainingAmount > 0 ? remainingAmount.toString() : '0'
      }));

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
    }
  }, [open, serviceId]);

  const generatePaymentNumber = () => {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `PAY${year}${month}${day}${random}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceId || !tenantId || !service) {
      toast({
        title: "Error",
        description: "Data tidak lengkap",
        variant: "destructive",
      });
      return;
    }

    const amount = parseFloat(formData.amount);
    if (amount <= 0) {
      toast({
        title: "Error",
        description: "Jumlah pembayaran harus lebih dari 0",
        variant: "destructive",
      });
      return;
    }

    // Validate cash payment
    if (formData.paymentMethod === 'Tunai') {
      const cashReceived = parseFloat(formData.cashReceived);
      if (!cashReceived || cashReceived < amount) {
        toast({
          title: "Error",
          description: "Jumlah uang yang diterima harus lebih besar atau sama dengan jumlah pembayaran",
          variant: "destructive",
        });
        return;
      }
    }

    setLoading(true);
    try {
      const paymentNumber = generatePaymentNumber();
      
      // Insert payment record
      const { error: paymentError } = await supabase
        .from('payments')
        .insert({
          tenant_id: tenantId,
          service_id: serviceId,
          payment_number: paymentNumber,
          amount: amount,
          payment_method: formData.paymentMethod,
          payment_status: 'Completed',
          notes: formData.notes || null
        });

      if (paymentError) throw paymentError;

      // Calculate total paid amount
      const totalPaid = existingPayments.reduce((sum, payment) => sum + payment.amount, 0) + amount;
      const totalCost = service.actual_cost || 0;
      
      // Determine payment status
      let paymentStatus = 'Belum Bayar';
      if (totalPaid >= totalCost) {
        paymentStatus = 'Lunas';
      } else if (totalPaid > 0) {
        paymentStatus = 'Sebagian';
      }

      // Update service payment status
      const { error: serviceError } = await supabase
        .from('services')
        .update({
          payment_status: paymentStatus,
          payment_date: paymentStatus === 'Lunas' ? new Date().toISOString() : null,
          updated_at: new Date().toISOString()
        })
        .eq('id', serviceId)
        .eq('tenant_id', tenantId);

      if (serviceError) throw serviceError;

      // Show success message with change info for cash payments
      let successMessage = `Pembayaran sebesar Rp ${amount.toLocaleString('id-ID')} berhasil diproses`;
      if (formData.paymentMethod === 'Tunai') {
        const cashReceived = parseFloat(formData.cashReceived);
        const change = cashReceived - amount;
        if (change > 0) {
          successMessage += `\nKembalian: Rp ${change.toLocaleString('id-ID')}`;
        }
      }

      toast({
        title: "Berhasil",
        description: successMessage,
      });

      // Reset form
      setFormData({
        amount: '',
        paymentMethod: '',
        cashReceived: '',
        notes: ''
      });

      onPaymentProcessed();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Gagal memproses pembayaran",
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
        <DialogContent className="max-w-2xl">
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

  if (!service) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl">
          <div className="text-center py-8">
            <p className="text-gray-500">Data servis tidak ditemukan</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const totalPaid = existingPayments.reduce((sum, payment) => sum + payment.amount, 0);
  const totalCost = service.actual_cost || 0;
  const remainingAmount = totalCost - totalPaid;
  const isFullyPaid = remainingAmount <= 0;

  // Calculate change for cash payments
  const paymentAmount = parseFloat(formData.amount) || 0;
  const cashReceived = parseFloat(formData.cashReceived) || 0;
  const changeAmount = formData.paymentMethod === 'Tunai' && cashReceived > 0 ? cashReceived - paymentAmount : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Receipt className="h-6 w-6 text-green-600" />
            Proses Pembayaran - {service.service_number}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Service Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Ringkasan Servis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Pelanggan:</span>
                <span className="font-semibold">{service.customer_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Kendaraan:</span>
                <span className="font-semibold">
                  {service.vehicle_brand} {service.vehicle_model} {service.vehicle_year}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Plat Nomor:</span>
                <span className="font-mono">{service.license_plate || '-'}</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-gray-600">Biaya Sparepart:</span>
                <span>Rp {(service.spareparts_total || 0).toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Biaya Jasa:</span>
                <span>Rp {(service.service_fee || 0).toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between text-lg font-bold">
                <span>Total Biaya:</span>
                <span className="text-green-600">Rp {totalCost.toLocaleString('id-ID')}</span>
              </div>
            </CardContent>
          </Card>

          {/* Payment Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Status Pembayaran</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Sudah Dibayar:</span>
                <span className="font-semibold text-blue-600">
                  Rp {totalPaid.toLocaleString('id-ID')}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Sisa Pembayaran:</span>
                <span className={`font-semibold ${remainingAmount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  Rp {Math.max(0, remainingAmount).toLocaleString('id-ID')}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Status:</span>
                <Badge className={
                  isFullyPaid 
                    ? 'bg-green-100 text-green-800' 
                    : totalPaid > 0 
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                }>
                  {isFullyPaid ? (
                    <>
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Lunas
                    </>
                  ) : totalPaid > 0 ? (
                    <>
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Sebagian
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Belum Bayar
                    </>
                  )}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Existing Payments */}
          {existingPayments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Riwayat Pembayaran</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {existingPayments.map((payment) => (
                    <div key={payment.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-semibold">{payment.payment_number}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(payment.payment_date).toLocaleDateString('id-ID')} - {payment.payment_method}
                        </p>
                        {payment.notes && (
                          <p className="text-sm text-gray-500">{payment.notes}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-green-600">
                          Rp {payment.amount.toLocaleString('id-ID')}
                        </p>
                        <Badge variant="outline" className="text-xs">
                          {payment.payment_status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Payment Form */}
          {!isFullyPaid && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Tambah Pembayaran</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount">Jumlah Pembayaran (Rp) *</Label>
                    <div className="relative">
                      <Calculator className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        id="amount"
                        type="number"
                        min="1"
                        max={remainingAmount}
                        value={formData.amount}
                        onChange={(e) => handleInputChange('amount', e.target.value)}
                        className="pl-10"
                        placeholder="0"
                        required
                      />
                    </div>
                    <p className="text-xs text-gray-500">
                      Maksimal: Rp {remainingAmount.toLocaleString('id-ID')}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="paymentMethod">Metode Pembayaran *</Label>
                    <Select 
                      value={formData.paymentMethod} 
                      onValueChange={(value) => handleInputChange('paymentMethod', value)}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih metode pembayaran" />
                      </SelectTrigger>
                      <SelectContent>
                        {paymentMethods.map((method) => {
                          const IconComponent = method.icon;
                          return (
                            <SelectItem key={method.value} value={method.value}>
                              <div className="flex items-center gap-2">
                                <IconComponent className="h-4 w-4" />
                                {method.label}
                              </div>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Cash Payment Fields */}
                  {formData.paymentMethod === 'Tunai' && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="cashReceived">Jumlah Uang Diterima (Rp) *</Label>
                        <div className="relative">
                          <Banknote className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                          <Input
                            id="cashReceived"
                            type="number"
                            min={paymentAmount}
                            value={formData.cashReceived}
                            onChange={(e) => handleInputChange('cashReceived', e.target.value)}
                            className="pl-10"
                            placeholder="0"
                            required
                          />
                        </div>
                        <p className="text-xs text-gray-500">
                          Minimal: Rp {paymentAmount.toLocaleString('id-ID')}
                        </p>
                      </div>

                      {/* Change Calculation Display */}
                      {cashReceived > 0 && paymentAmount > 0 && (
                        <Card className={`border-2 ${changeAmount >= 0 ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                          <CardContent className="p-4">
                            <div className="space-y-2">
                              <div className="flex justify-between items-center">
                                <span className="text-sm font-medium text-gray-700">Jumlah Pembayaran:</span>
                                <span className="font-semibold">Rp {paymentAmount.toLocaleString('id-ID')}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-sm font-medium text-gray-700">Uang Diterima:</span>
                                <span className="font-semibold">Rp {cashReceived.toLocaleString('id-ID')}</span>
                              </div>
                              <Separator />
                              <div className="flex justify-between items-center">
                                <span className="text-lg font-bold text-gray-900">Kembalian:</span>
                                <span className={`text-xl font-bold ${changeAmount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                  Rp {Math.max(0, changeAmount).toLocaleString('id-ID')}
                                </span>
                              </div>
                              {changeAmount < 0 && (
                                <div className="flex items-center gap-2 text-red-600 text-sm">
                                  <AlertCircle className="h-4 w-4" />
                                  <span>Uang yang diterima kurang dari jumlah pembayaran</span>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="notes">Catatan (Opsional)</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => handleInputChange('notes', e.target.value)}
                      placeholder="Catatan tambahan untuk pembayaran ini..."
                      rows={3}
                    />
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
                    <Button 
                      type="submit" 
                      disabled={loading}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {loading ? 'Memproses...' : 'Proses Pembayaran'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {isFullyPaid && (
            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-6 text-center">
                <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-green-800 mb-2">
                  Pembayaran Sudah Lunas
                </h3>
                <p className="text-green-700">
                  Semua pembayaran untuk servis ini telah diselesaikan.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}