import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Wrench, 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Printer,
  Clock,
  CheckCircle,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import AddServiceModal from './AddServiceModal';
import ServiceDetailModal from './ServiceDetailModal';
import EditServiceModal from './EditServiceModal';
import InvoicePrintModal from './InvoicePrintModal';
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
  progress: number;
  created_at: string;
}

interface ManajemenServisProps {
  isLoading?: boolean;
}

export default function ManajemenServis({ isLoading = false }: ManajemenServisProps) {
  const { tenantId } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Semua');
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);

  const fetchServices = async () => {
    if (!tenantId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setServices(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Gagal memuat data servis",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, [tenantId]);

  const handleViewDetail = (serviceId: string) => {
    setSelectedServiceId(serviceId);
    setShowDetailModal(true);
  };

  const handleEditService = (serviceId: string) => {
    setSelectedServiceId(serviceId);
    setShowEditModal(true);
  };

  const handlePrintInvoice = (serviceId: string) => {
    setSelectedServiceId(serviceId);
    setShowInvoiceModal(true);
  };

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

  const filteredServices = services.filter(service => {
    const matchesSearch = 
      service.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.service_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (service.license_plate && service.license_plate.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'Semua' || service.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getServiceStats = () => {
    const total = services.length;
    const selesai = services.filter(s => s.status === 'Selesai').length;
    const proses = services.filter(s => s.status === 'Dalam Proses').length;
    const antrian = services.filter(s => s.status === 'Antrian').length;
    
    return { total, selesai, proses, antrian };
  };

  const stats = getServiceStats();

  if (isLoading || loading) {
    return (
      <div className="space-y-6 bg-white min-h-screen p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 bg-white min-h-screen p-6">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Manajemen Servis & Transaksi</h1>
          <p className="text-gray-600">Kelola semua servis dan transaksi bengkel</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={fetchServices}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Button 
            className="bg-blue-600 hover:bg-blue-700 text-white"
            onClick={() => setShowAddModal(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Tambah Servis Baru
          </Button>
        </div>
      </div>

      {/* Search and Filter */}
      <Card className="shadow-lg">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Cari berdasarkan nama, plat nomor, atau ID servis..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Semua">Semua Status</option>
                <option value="Antrian">Antrian</option>
                <option value="Dalam Proses">Dalam Proses</option>
                <option value="Menunggu Sparepart">Menunggu Sparepart</option>
                <option value="Selesai">Selesai</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Services List */}
      <div className="space-y-4">
        {filteredServices.length === 0 ? (
          <Card className="shadow-lg">
            <CardContent className="p-12 text-center">
              <Wrench className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">
                {searchTerm || statusFilter !== 'Semua' 
                  ? 'Tidak ada servis yang sesuai dengan filter'
                  : 'Belum ada data servis'
                }
              </p>
              {!searchTerm && statusFilter === 'Semua' && (
                <Button 
                  className="mt-4 bg-blue-600 hover:bg-blue-700"
                  onClick={() => setShowAddModal(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah Servis Pertama
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredServices.map((service) => (
            <Card key={service.id} className="shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="font-bold text-lg text-blue-600">{service.service_number}</span>
                      <Badge className={`${getStatusColor(service.status)} flex items-center gap-1`}>
                        {getStatusIcon(service.status)}
                        {service.status}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Pelanggan</p>
                        <p className="font-semibold text-gray-900">{service.customer_name}</p>
                        <p className="text-sm text-gray-600">{service.customer_phone || '-'}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-500">Kendaraan</p>
                        <p className="font-semibold text-gray-900">
                          {service.vehicle_brand} {service.vehicle_model} {service.vehicle_year}
                        </p>
                        <p className="text-sm text-gray-600">{service.license_plate || '-'}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-500">Teknisi</p>
                        <p className="font-semibold text-gray-900">{service.technician || 'Belum ditentukan'}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(service.created_at).toLocaleDateString('id-ID')}
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <p className="text-sm text-gray-500 mb-1">Keluhan</p>
                      <p className="text-gray-900">{service.complaint || '-'}</p>
                    </div>
                    
                    <div className="mt-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-500">Progress</span>
                        <span className="text-sm font-medium">{service.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${service.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2 lg:ml-6">
                    <div className="text-right mb-2">
                      <p className="text-sm text-gray-500">Estimasi Biaya</p>
                      <p className="text-xl font-bold text-green-600">
                        {service.estimated_cost 
                          ? `Rp ${service.estimated_cost.toLocaleString('id-ID')}`
                          : 'Belum ditentukan'
                        }
                      </p>
                    </div>
                    
                    <div className="flex flex-col gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex items-center gap-2"
                        onClick={() => handleViewDetail(service.id)}
                      >
                        <Eye className="h-4 w-4" />
                        Detail
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex items-center gap-2"
                        onClick={() => handleEditService(service.id)}
                      >
                        <Edit className="h-4 w-4" />
                        Edit
                      </Button>
                      {service.status === 'Selesai' && (
                        <Button 
                          size="sm" 
                          className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
                          onClick={() => handlePrintInvoice(service.id)}
                        >
                          <Printer className="h-4 w-4" />
                          Cetak Nota
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
        <Card className="shadow-lg">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
            <div className="text-sm text-gray-600">Total Servis</div>
          </CardContent>
        </Card>
        <Card className="shadow-lg">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{stats.selesai}</div>
            <div className="text-sm text-gray-600">Selesai</div>
          </CardContent>
        </Card>
        <Card className="shadow-lg">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">{stats.proses}</div>
            <div className="text-sm text-gray-600">Dalam Proses</div>
          </CardContent>
        </Card>
        <Card className="shadow-lg">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-gray-600">{stats.antrian}</div>
            <div className="text-sm text-gray-600">Antrian</div>
          </CardContent>
        </Card>
      </div>

      {/* Modals */}
      <AddServiceModal
        open={showAddModal}
        onOpenChange={setShowAddModal}
        onServiceAdded={fetchServices}
      />

      <ServiceDetailModal
        open={showDetailModal}
        onOpenChange={setShowDetailModal}
        serviceId={selectedServiceId}
        onEdit={handleEditService}
        onPrintInvoice={handlePrintInvoice}
      />

      <EditServiceModal
        open={showEditModal}
        onOpenChange={setShowEditModal}
        serviceId={selectedServiceId}
        onServiceUpdated={fetchServices}
      />

      <InvoicePrintModal
        open={showInvoiceModal}
        onOpenChange={setShowInvoiceModal}
        serviceId={selectedServiceId}
      />
    </div>
  );
}