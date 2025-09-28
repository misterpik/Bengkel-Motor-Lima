import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Phone,
  Mail,
  MapPin,
  Car,
  RefreshCw,
  Calendar,
  User
} from 'lucide-react';
import AddCustomerModal from './AddCustomerModal';
import { supabase } from '../../../supabase/supabase';
import { useAuth } from '../../../supabase/auth';
import { useToast } from '@/components/ui/use-toast';

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

interface ManajemenPelangganProps {
  isLoading?: boolean;
}

export default function ManajemenPelanggan({ isLoading = false }: ManajemenPelangganProps) {
  const { tenantId } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [genderFilter, setGenderFilter] = useState('Semua');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  const fetchCustomers = async () => {
    if (!tenantId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('customers')
        .select(`
          *,
          customer_vehicles (*)
        `)
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCustomers(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Gagal memuat data pelanggan",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [tenantId]);

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = 
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.customer_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (customer.phone && customer.phone.includes(searchTerm)) ||
      (customer.email && customer.email.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesGender = genderFilter === 'Semua' || customer.gender === genderFilter;
    
    return matchesSearch && matchesGender;
  });

  const getCustomerStats = () => {
    const total = customers.length;
    const withVehicles = customers.filter(c => c.customer_vehicles && c.customer_vehicles.length > 0).length;
    const maleCustomers = customers.filter(c => c.gender === 'Laki-laki').length;
    const femaleCustomers = customers.filter(c => c.gender === 'Perempuan').length;
    
    return { total, withVehicles, maleCustomers, femaleCustomers };
  };

  const stats = getCustomerStats();

  const getPrimaryVehicle = (vehicles?: Vehicle[]) => {
    if (!vehicles || vehicles.length === 0) return null;
    return vehicles.find(v => v.is_primary) || vehicles[0];
  };

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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Manajemen Pelanggan</h1>
          <p className="text-gray-600">Kelola data pelanggan dan kendaraan mereka</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={fetchCustomers}
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
            Tambah Pelanggan
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="shadow-lg">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
            <div className="text-sm text-gray-600">Total Pelanggan</div>
          </CardContent>
        </Card>
        <Card className="shadow-lg">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{stats.withVehicles}</div>
            <div className="text-sm text-gray-600">Punya Kendaraan</div>
          </CardContent>
        </Card>
        <Card className="shadow-lg">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{stats.maleCustomers}</div>
            <div className="text-sm text-gray-600">Laki-laki</div>
          </CardContent>
        </Card>
        <Card className="shadow-lg">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-pink-600">{stats.femaleCustomers}</div>
            <div className="text-sm text-gray-600">Perempuan</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card className="shadow-lg">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Cari berdasarkan nama, kode, telepon, atau email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={genderFilter}
                onChange={(e) => setGenderFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Semua">Semua Gender</option>
                <option value="Laki-laki">Laki-laki</option>
                <option value="Perempuan">Perempuan</option>
              </select>
              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filter Lainnya
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Customers List */}
      <div className="space-y-4">
        {filteredCustomers.length === 0 ? (
          <Card className="shadow-lg">
            <CardContent className="p-12 text-center">
              <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">
                {searchTerm || genderFilter !== 'Semua' 
                  ? 'Tidak ada pelanggan yang sesuai dengan filter'
                  : 'Belum ada data pelanggan'
                }
              </p>
              {!searchTerm && genderFilter === 'Semua' && (
                <Button 
                  className="mt-4 bg-blue-600 hover:bg-blue-700"
                  onClick={() => setShowAddModal(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah Pelanggan Pertama
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredCustomers.map((customer) => {
            const primaryVehicle = getPrimaryVehicle(customer.customer_vehicles);
            return (
              <Card key={customer.id} className="shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="font-bold text-lg text-blue-600">{customer.customer_code}</span>
                        {customer.gender && (
                          <Badge className={`${
                            customer.gender === 'Laki-laki' 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-pink-100 text-pink-800'
                          }`}>
                            <User className="h-3 w-3 mr-1" />
                            {customer.gender}
                          </Badge>
                        )}
                        {customer.date_of_birth && (
                          <Badge className="bg-gray-100 text-gray-800">
                            <Calendar className="h-3 w-3 mr-1" />
                            {new Date().getFullYear() - new Date(customer.date_of_birth).getFullYear()} tahun
                          </Badge>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Informasi Pelanggan</p>
                          <p className="font-semibold text-gray-900 text-lg">{customer.name}</p>
                          {customer.phone && (
                            <div className="flex items-center gap-1 text-sm text-gray-600">
                              <Phone className="h-3 w-3" />
                              {customer.phone}
                            </div>
                          )}
                          {customer.email && (
                            <div className="flex items-center gap-1 text-sm text-gray-600">
                              <Mail className="h-3 w-3" />
                              {customer.email}
                            </div>
                          )}
                        </div>
                        
                        <div>
                          <p className="text-sm text-gray-500">Alamat</p>
                          <div className="flex items-start gap-1">
                            <MapPin className="h-3 w-3 mt-1 text-gray-400" />
                            <p className="text-sm text-gray-600">
                              {customer.address || 'Alamat belum diisi'}
                            </p>
                          </div>
                        </div>
                        
                        <div>
                          <p className="text-sm text-gray-500">Kendaraan Utama</p>
                          {primaryVehicle ? (
                            <div className="flex items-start gap-1">
                              <Car className="h-3 w-3 mt-1 text-gray-400" />
                              <div className="text-sm">
                                <p className="font-medium text-gray-900">
                                  {primaryVehicle.brand} {primaryVehicle.model} {primaryVehicle.year}
                                </p>
                                <p className="text-gray-600">{primaryVehicle.license_plate}</p>
                                {primaryVehicle.color && (
                                  <p className="text-gray-500">Warna: {primaryVehicle.color}</p>
                                )}
                              </div>
                            </div>
                          ) : (
                            <p className="text-sm text-gray-500">Belum ada kendaraan</p>
                          )}
                        </div>
                      </div>
                      
                      {customer.notes && (
                        <div className="mt-4">
                          <p className="text-sm text-gray-500 mb-1">Catatan</p>
                          <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded">{customer.notes}</p>
                        </div>
                      )}
                      
                      <div className="mt-4 text-xs text-gray-500">
                        Terdaftar: {new Date(customer.created_at).toLocaleDateString('id-ID', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-2 lg:ml-6">
                      <div className="text-right mb-2">
                        <p className="text-sm text-gray-500">Kendaraan Terdaftar</p>
                        <p className="text-xl font-bold text-green-600">
                          {customer.customer_vehicles?.length || 0}
                        </p>
                      </div>
                      
                      <div className="flex flex-col gap-2">
                        <Button variant="outline" size="sm" className="flex items-center gap-2">
                          <Eye className="h-4 w-4" />
                          Detail
                        </Button>
                        <Button variant="outline" size="sm" className="flex items-center gap-2">
                          <Edit className="h-4 w-4" />
                          Edit
                        </Button>
                        <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2">
                          <Plus className="h-4 w-4" />
                          Tambah Servis
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      <AddCustomerModal
        open={showAddModal}
        onOpenChange={setShowAddModal}
        onCustomerAdded={fetchCustomers}
      />
    </div>
  );
}