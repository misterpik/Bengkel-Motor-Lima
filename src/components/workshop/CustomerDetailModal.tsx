import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  Car, 
  Edit, 
  Plus,
  X,
  FileText
} from 'lucide-react';

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
  customer_vehicles?: Vehicle[];
}

interface Vehicle {
  id: string;
  brand: string | null;
  model: string | null;
  year: number | null;
  license_plate: string | null;
  color: string | null;
  is_primary: boolean;
}

interface CustomerDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer: Customer | null;
  onEditCustomer: (customer: Customer) => void;
  onAddService: (customer: Customer) => void;
}

export default function CustomerDetailModal({ 
  open, 
  onOpenChange, 
  customer, 
  onEditCustomer, 
  onAddService 
}: CustomerDetailModalProps) {
  if (!customer) return null;

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Detail Pelanggan - {customer.customer_code}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Customer Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informasi Pelanggan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Kode Pelanggan</label>
                  <p className="text-lg font-semibold text-blue-600">{customer.customer_code}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Nama Lengkap</label>
                  <p className="text-lg font-semibold">{customer.name}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Nomor Telepon</label>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <p>{customer.phone || 'Tidak ada'}</p>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Email</label>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <p>{customer.email || 'Tidak ada'}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Jenis Kelamin</label>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-400" />
                    {customer.gender ? (
                      <Badge className={`${
                        customer.gender === 'Laki-laki' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-pink-100 text-pink-800'
                      }`}>
                        {customer.gender}
                      </Badge>
                    ) : (
                      <p>Tidak diisi</p>
                    )}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Tanggal Lahir & Usia</label>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    {customer.date_of_birth ? (
                      <div>
                        <p>{new Date(customer.date_of_birth).toLocaleDateString('id-ID')}</p>
                        <p className="text-sm text-gray-600">({calculateAge(customer.date_of_birth)} tahun)</p>
                      </div>
                    ) : (
                      <p>Tidak diisi</p>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Alamat</label>
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-gray-400 mt-1" />
                  <p>{customer.address || 'Alamat belum diisi'}</p>
                </div>
              </div>

              {customer.notes && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Catatan</label>
                  <div className="flex items-start gap-2">
                    <FileText className="h-4 w-4 text-gray-400 mt-1" />
                    <p className="bg-gray-50 p-3 rounded-lg">{customer.notes}</p>
                  </div>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-gray-500">Tanggal Terdaftar</label>
                <p>{new Date(customer.created_at).toLocaleDateString('id-ID', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}</p>
              </div>
            </CardContent>
          </Card>

          {/* Vehicles */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Car className="h-5 w-5" />
                Kendaraan Terdaftar ({customer.customer_vehicles?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {customer.customer_vehicles && customer.customer_vehicles.length > 0 ? (
                <div className="space-y-4">
                  {customer.customer_vehicles.map((vehicle) => (
                    <div key={vehicle.id} className="border rounded-lg p-4 bg-gray-50">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-lg">
                          {vehicle.brand} {vehicle.model} {vehicle.year}
                        </h4>
                        {vehicle.is_primary && (
                          <Badge className="bg-green-100 text-green-800">
                            Kendaraan Utama
                          </Badge>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                        <p><span className="font-medium">Plat Nomor:</span> {vehicle.license_plate || 'Tidak diisi'}</p>
                        <p><span className="font-medium">Warna:</span> {vehicle.color || 'Tidak diisi'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Car className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600">Belum ada kendaraan terdaftar</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              <X className="h-4 w-4 mr-2" />
              Tutup
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                onEditCustomer(customer);
                onOpenChange(false);
              }}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Pelanggan
            </Button>
            <Button
              className="bg-green-600 hover:bg-green-700"
              onClick={() => {
                onAddService(customer);
                onOpenChange(false);
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Tambah Servis
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}