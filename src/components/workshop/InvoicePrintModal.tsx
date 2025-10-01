import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  Printer, 
  Download, 
  Wrench, 
  Calendar,
  User,
  Car,
  Phone,
  MapPin
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
  complaint: string | null;
  status: string;
  technician: string | null;
  estimated_cost: number | null;
  actual_cost: number | null;
  service_fee: number | null;
  spareparts_total: number | null;
  progress: number;
  created_at: string;
  updated_at: string;
}

interface ServiceSparepart {
  id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  spareparts: {
    name: string;
    code: string;
  };
}

interface Tenant {
  id: string;
  name: string;
  owner_name: string;
  email: string;
  phone: string | null;
  address: string | null;
  service_tax_rate: number | null;
}

interface InvoicePrintModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  serviceId: string | null;
}

export default function InvoicePrintModal({ open, onOpenChange, serviceId }: InvoicePrintModalProps) {
  const { tenantId } = useAuth();
  const { toast } = useToast();
  const [service, setService] = useState<Service | null>(null);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [serviceSpareparts, setServiceSpareparts] = useState<ServiceSparepart[]>([]);
  const [loading, setLoading] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const fetchData = async () => {
    if (!serviceId || !tenantId) return;
    
    setLoading(true);
    try {
      // Fetch service data
      const { data: serviceData, error: serviceError } = await supabase
        .from('services')
        .select('*')
        .eq('id', serviceId)
        .single();

      if (serviceError) throw serviceError;

      // Fetch tenant data
      const { data: tenantData, error: tenantError } = await supabase
        .from('tenants')
        .select('*')
        .eq('id', tenantId)
        .single();

      if (tenantError) throw tenantError;

      // Fetch service spareparts
      const { data: sparepartsData, error: sparepartsError } = await supabase
        .from('service_spareparts')
        .select(`
          id,
          quantity,
          unit_price,
          total_price,
          spareparts (name, code)
        `)
        .eq('service_id', serviceId);

      if (sparepartsError) throw sparepartsError;

      setService(serviceData);
      setTenant(tenantData);
      setServiceSpareparts(sparepartsData || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Gagal memuat data untuk invoice",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && serviceId) {
      fetchData();
    }
  }, [open, serviceId]);

  const handlePrint = () => {
    if (printRef.current) {
      const printContent = printRef.current.innerHTML;
      const originalContent = document.body.innerHTML;
      
      document.body.innerHTML = `
        <html>
          <head>
            <title>Invoice ${service?.service_number}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              .invoice-container { max-width: 800px; margin: 0 auto; }
              .header { text-align: center; margin-bottom: 30px; }
              .company-info { text-align: center; margin-bottom: 20px; }
              .invoice-details { margin: 20px 0; }
              .customer-info { margin: 20px 0; }
              .service-details { margin: 20px 0; }
              .cost-summary { margin: 20px 0; }
              .separator { border-top: 2px solid #000; margin: 20px 0; }
              .row { display: flex; justify-content: space-between; margin: 5px 0; }
              .label { font-weight: bold; }
              .total { font-size: 18px; font-weight: bold; }
              @media print {
                body { margin: 0; }
                .no-print { display: none; }
              }
            </style>
          </head>
          <body>
            ${printContent}
          </body>
        </html>
      `;
      
      window.print();
      document.body.innerHTML = originalContent;
      window.location.reload();
    }
  };

  const handleDownloadPDF = () => {
    toast({
      title: "Fitur Download PDF",
      description: "Fitur download PDF akan segera tersedia",
    });
  };

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-200 rounded w-1/3"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!service || !tenant) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl">
          <div className="text-center py-8">
            <p className="text-gray-500">Data tidak ditemukan</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const invoiceDate = new Date().toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const serviceDate = new Date(service.created_at).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Use stored tax values from service instead of calculating automatically
  const sparepartsTotal = service.spareparts_total || 0;
  const serviceFee = service.service_fee || 0;
  const subtotal = service.base_cost || (sparepartsTotal + serviceFee);
  const taxRate = service.tax_rate || 0;
  const taxAmount = service.tax_amount || 0;
  const grandTotal = service.actual_cost || (subtotal + taxAmount);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Printer className="h-6 w-6 text-blue-600" />
            Invoice Servis {service.service_number}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Print Preview */}
          <div ref={printRef} className="invoice-container bg-white p-8 border rounded-lg">
            {/* Header */}
            <div className="header text-center mb-8">
              <div className="flex items-center justify-center gap-3 mb-4">
                <Wrench className="h-8 w-8 text-blue-600" />
                <h1 className="text-3xl font-bold text-gray-900">INVOICE SERVIS</h1>
              </div>
              <div className="company-info">
                <h2 className="text-xl font-bold text-blue-600">{tenant.name}</h2>
                <p className="text-gray-600">{tenant.address || 'Alamat bengkel'}</p>
                <p className="text-gray-600">
                  Telp: {tenant.phone || '-'} | Email: {tenant.email}
                </p>
              </div>
            </div>

            <Separator className="my-6" />

            {/* Invoice Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div className="invoice-details">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  Detail Invoice
                </h3>
                <div className="space-y-2">
                  <div className="row flex justify-between">
                    <span className="label">No. Invoice:</span>
                    <span>{service.service_number}</span>
                  </div>
                  <div className="row flex justify-between">
                    <span className="label">Tanggal Invoice:</span>
                    <span>{invoiceDate}</span>
                  </div>
                  <div className="row flex justify-between">
                    <span className="label">Tanggal Servis:</span>
                    <span>{serviceDate}</span>
                  </div>
                  <div className="row flex justify-between">
                    <span className="label">Status:</span>
                    <span className="font-semibold text-green-600">{service.status}</span>
                  </div>
                </div>
              </div>

              <div className="customer-info">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <User className="h-5 w-5 text-blue-600" />
                  Informasi Pelanggan
                </h3>
                <div className="space-y-2">
                  <div className="row flex justify-between">
                    <span className="label">Nama:</span>
                    <span>{service.customer_name}</span>
                  </div>
                  {service.customer_phone && (
                    <div className="row flex justify-between">
                      <span className="label">Telepon:</span>
                      <span>{service.customer_phone}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <Separator className="my-6" />

            {/* Vehicle Information */}
            <div className="service-details mb-8">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Car className="h-5 w-5 text-blue-600" />
                Informasi Kendaraan & Servis
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="row flex justify-between">
                    <span className="label">Kendaraan:</span>
                    <span>{service.vehicle_brand} {service.vehicle_model} {service.vehicle_year}</span>
                  </div>
                  {service.license_plate && (
                    <div className="row flex justify-between">
                      <span className="label">Plat Nomor:</span>
                      <span className="font-mono">{service.license_plate}</span>
                    </div>
                  )}
                  {service.technician && (
                    <div className="row flex justify-between">
                      <span className="label">Teknisi:</span>
                      <span>{service.technician}</span>
                    </div>
                  )}
                </div>
                <div>
                  <div className="label mb-2">Keluhan/Masalah:</div>
                  <div className="bg-gray-50 p-3 rounded border">
                    {service.complaint || 'Tidak ada keluhan yang dicatat'}
                  </div>
                </div>
              </div>
            </div>

            <Separator className="my-6" />

            {/* Cost Summary */}
            <div className="cost-summary mb-8">
              <h3 className="text-lg font-semibold mb-4">Rincian Biaya</h3>
              
              {/* Spareparts Detail */}
              {serviceSpareparts.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-medium mb-3">Detail Sparepart:</h4>
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-3 py-2 text-left">Nama Sparepart</th>
                          <th className="px-3 py-2 text-center">Qty</th>
                          <th className="px-3 py-2 text-right">Harga Satuan</th>
                          <th className="px-3 py-2 text-right">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {serviceSpareparts.map((item, index) => (
                          <tr key={index} className="border-t">
                            <td className="px-3 py-2">{item.spareparts?.name || 'Unknown'}</td>
                            <td className="px-3 py-2 text-center">{item.quantity}</td>
                            <td className="px-3 py-2 text-right">Rp {item.unit_price.toLocaleString('id-ID')}</td>
                            <td className="px-3 py-2 text-right">Rp {item.total_price.toLocaleString('id-ID')}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              
              {/* Cost Summary */}
              <div className="space-y-3">
                <div className="row flex justify-between text-lg">
                  <span className="label">Biaya Sparepart:</span>
                  <span>Rp {sparepartsTotal.toLocaleString('id-ID')}</span>
                </div>
                <div className="row flex justify-between text-lg">
                  <span className="label">Biaya Jasa:</span>
                  <span>Rp {serviceFee.toLocaleString('id-ID')}</span>
                </div>
                <div className="row flex justify-between text-lg border-t pt-2">
                  <span className="label">Subtotal:</span>
                  <span>Rp {subtotal.toLocaleString('id-ID')}</span>
                </div>
                {taxRate > 0 && (
                  <div className="row flex justify-between text-lg">
                    <span className="label">Pajak ({taxRate}%):</span>
                    <span>Rp {taxAmount.toLocaleString('id-ID')}</span>
                  </div>
                )}
                <Separator />
                <div className="row flex justify-between text-xl total">
                  <span className="label">TOTAL:</span>
                  <span className="text-green-600">
                    Rp {grandTotal.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>
            </div>

            <Separator className="my-6" />

            {/* Footer */}
            <div className="text-center text-gray-600 mt-8">
              <p className="mb-2">Terima kasih atas kepercayaan Anda!</p>
              <p className="text-sm">Invoice ini dicetak pada {new Date().toLocaleString('id-ID')}</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t no-print">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Tutup
            </Button>
            <Button
              variant="outline"
              onClick={handleDownloadPDF}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Download PDF
            </Button>
            <Button
              onClick={handlePrint}
              className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
            >
              <Printer className="h-4 w-4" />
              Cetak Invoice
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}