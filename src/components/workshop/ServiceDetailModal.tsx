import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  User, 
  Car, 
  Phone, 
  Calendar,
  DollarSign,
  FileText,
  Wrench,
  Edit,
  Printer
} from 'lucide-react';
import { supabase } from '../../../supabase/supabase';
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

interface ServiceDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  serviceId: string | null;
  onEdit: (serviceId: string) => void;
  onPrintInvoice?: (serviceId: string) => void;
}

export default function ServiceDetailModal({ open, onOpenChange, serviceId, onEdit, onPrintInvoice }: ServiceDetailModalProps) {
  const { toast } = useToast();
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchServiceDetail = async () => {
    if (!serviceId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('id', serviceId)
        .single();

      if (error) throw error;
      setService(data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Gagal memuat detail servis",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && serviceId) {
      fetchServiceDetail();
    }
  }, [open, serviceId]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Selesai':
        return 'bg-green-100 text-green-800';
      case 'Dalam Proses':
        return 'bg-blue-100 text-blue-800';
      case 'Menunggu Sparepart':
        return 'bg-yellow-100 text-yellow-800';
      case 'Antrian':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Selesai':
        return <CheckCircle className="h-4 w-4" />;
      case 'Dalam Proses':
        return <Clock className="h-4 w-4" />;
      case 'Menunggu Sparepart':
        return <AlertCircle className="h-4 w-4" />;
      case 'Antrian':
        return <Clock className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const handlePrintInvoice = () => {
    if (onPrintInvoice && service) {
      onPrintInvoice(service.id);
    }
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

  if (!service) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl">
          <div className="text-center py-8">
            <p className="text-gray-500">Data servis tidak ditemukan</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Wrench className="h-6 w-6 text-blue-600" />
            Detail Servis {service.service_number}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status and Progress */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Badge className={`${getStatusColor(service.status)} flex items-center gap-2 text-base px-3 py-1`}>
                  {getStatusIcon(service.status)}
                  {service.status}
                </Badge>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Progress</p>
                  <p className="text-2xl font-bold text-blue-600">{service.progress}%</p>
                </div>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${service.progress}%` }}
                ></div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Customer Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-blue-600" />
                  Informasi Pelanggan
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Nama Pelanggan</p>
                  <p className="font-semibold text-lg">{service.customer_name}</p>
                </div>
                {service.customer_phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-700">{service.customer_phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-700">
                    {new Date(service.created_at).toLocaleDateString('id-ID', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Vehicle Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Car className="h-5 w-5 text-blue-600" />
                  Informasi Kendaraan
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Kendaraan</p>
                  <p className="font-semibold text-lg">
                    {service.vehicle_brand} {service.vehicle_model} {service.vehicle_year}
                  </p>
                </div>
                {service.license_plate && (
                  <div>
                    <p className="text-sm text-gray-500">Plat Nomor</p>
                    <p className="font-mono text-lg bg-gray-100 px-2 py-1 rounded inline-block">
                      {service.license_plate}
                    </p>
                  </div>
                )}
                {service.technician && (
                  <div>
                    <p className="text-sm text-gray-500">Teknisi</p>
                    <p className="font-semibold">{service.technician}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Complaint and Notes */}
          {service.complaint && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  Keluhan & Masalah
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">{service.complaint}</p>
              </CardContent>
            </Card>
          )}

          {/* Cost Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-blue-600" />
                Informasi Biaya
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-500">Estimasi Biaya</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {service.estimated_cost 
                      ? `Rp ${service.estimated_cost.toLocaleString('id-ID')}`
                      : 'Belum ditentukan'
                    }
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Biaya Aktual</p>
                  <p className="text-2xl font-bold text-green-600">
                    {service.actual_cost 
                      ? `Rp ${service.actual_cost.toLocaleString('id-ID')}`
                      : 'Belum ditentukan'
                    }
                  </p>
                </div>
              </div>
              
              {(service.service_fee || service.spareparts_total) && (
                <div className="mt-6 pt-4 border-t">
                  <h4 className="font-semibold mb-3">Rincian Biaya:</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Biaya Sparepart:</span>
                      <span className="font-medium">
                        Rp {(service.spareparts_total || 0).toLocaleString('id-ID')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Biaya Jasa:</span>
                      <span className="font-medium">
                        Rp {(service.service_fee || 0).toLocaleString('id-ID')}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Tutup
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                onEdit(service.id);
                onOpenChange(false);
              }}
              className="flex items-center gap-2"
            >
              <Edit className="h-4 w-4" />
              Edit Servis
            </Button>
            {service.status === 'Selesai' && (
              <Button
                onClick={handlePrintInvoice}
                className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
              >
                <Printer className="h-4 w-4" />
                Cetak Invoice
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}