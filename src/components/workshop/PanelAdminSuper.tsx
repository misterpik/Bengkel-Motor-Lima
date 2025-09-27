import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Plus, 
  Search, 
  Building, 
  Calendar,
  DollarSign,
  Activity,
  Settings,
  Eye,
  Edit,
  Trash2,
  Crown,
  RefreshCw
} from 'lucide-react';
import { supabase } from '../../../supabase/supabase';
import { useAuth } from '../../../supabase/auth';
import { useToast } from '@/components/ui/use-toast';

interface Tenant {
  id: string;
  name: string;
  owner_name: string;
  email: string;
  phone: string | null;
  address: string | null;
  package: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface PanelAdminSuperProps {
  isLoading?: boolean;
}

export default function PanelAdminSuper({ isLoading = false }: PanelAdminSuperProps) {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);

  // Check if user is super admin
  const isSuperAdmin = profile?.role === 'super_admin' || profile?.email?.includes('admin');

  const fetchTenants = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('tenants')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTenants(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Gagal memuat data tenant",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isSuperAdmin) {
      fetchTenants();
    }
  }, [isSuperAdmin]);

  const packages = [
    {
      name: 'Basic',
      price: 299000,
      features: ['Max 50 servis/bulan', '1 user', 'Dashboard dasar', 'Support email'],
      tenants: tenants.filter(t => t.package === 'Basic').length
    },
    {
      name: 'Standard',
      price: 599000,
      features: ['Max 150 servis/bulan', '3 users', 'Laporan lengkap', 'Support chat'],
      tenants: tenants.filter(t => t.package === 'Standard').length
    },
    {
      name: 'Premium',
      price: 999000,
      features: ['Unlimited servis', '10 users', 'Analytics advanced', 'Support prioritas'],
      tenants: tenants.filter(t => t.package === 'Premium').length
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Aktif':
        return 'bg-green-100 text-green-800';
      case 'Trial':
        return 'bg-blue-100 text-blue-800';
      case 'Suspended':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPackageColor = (packageName: string) => {
    switch (packageName) {
      case 'Basic':
        return 'bg-gray-100 text-gray-800';
      case 'Standard':
        return 'bg-blue-100 text-blue-800';
      case 'Premium':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const activeTenants = tenants.filter(t => t.status === 'Aktif').length;
  const trialTenants = tenants.filter(t => t.status === 'Trial').length;
  const totalRevenue = tenants.reduce((sum, tenant) => {
    const packagePrice = packages.find(p => p.name === tenant.package)?.price || 0;
    return tenant.status === 'Aktif' ? sum + packagePrice : sum;
  }, 0);

  const filteredTenants = tenants.filter(tenant =>
    tenant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tenant.owner_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tenant.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // If not super admin, show access denied
  if (!isSuperAdmin) {
    return (
      <div className="space-y-6 bg-white min-h-screen p-6">
        <div className="text-center py-16">
          <Crown className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Akses Terbatas</h2>
          <p className="text-gray-600">Anda tidak memiliki akses ke Panel Admin Super</p>
        </div>
      </div>
    );
  }

  if (isLoading || loading) {
    return (
      <div className="space-y-6 bg-white min-h-screen p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
            <Crown className="h-8 w-8 text-yellow-500" />
            Panel Admin Super
          </h1>
          <p className="text-gray-600">Kelola semua tenant dan paket berlangganan</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={fetchTenants}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            <Plus className="h-4 w-4 mr-2" />
            Tambah Tenant Baru
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Tenant</p>
                <p className="text-3xl font-bold text-blue-600">{tenants.length}</p>
              </div>
              <Building className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tenant Aktif</p>
                <p className="text-3xl font-bold text-green-600">{activeTenants}</p>
              </div>
              <Activity className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Trial</p>
                <p className="text-3xl font-bold text-orange-600">{trialTenants}</p>
              </div>
              <Calendar className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Revenue Bulanan</p>
                <p className="text-3xl font-bold text-purple-600">
                  Rp {totalRevenue.toLocaleString('id-ID')}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-purple-600" />
            </div>
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
                placeholder="Cari tenant berdasarkan nama, email, atau pemilik..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline">Filter Status</Button>
              <Button variant="outline">Filter Paket</Button>
              <Button variant="outline">Export Data</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tenants List */}
      <div className="space-y-4">
        {filteredTenants.length === 0 ? (
          <Card className="shadow-lg">
            <CardContent className="p-12 text-center">
              <Building className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">
                {searchTerm ? 'Tidak ada tenant yang sesuai dengan pencarian' : 'Belum ada data tenant'}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredTenants.map((tenant) => (
            <Card key={tenant.id} className="shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="font-bold text-lg text-blue-600">{tenant.id.slice(0, 8)}</span>
                      <Badge className={getStatusColor(tenant.status)}>
                        {tenant.status}
                      </Badge>
                      <Badge className={getPackageColor(tenant.package)}>
                        {tenant.package}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Bengkel</p>
                        <p className="font-semibold text-gray-900">{tenant.name}</p>
                        <p className="text-sm text-gray-600">{tenant.owner_name}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-500">Kontak</p>
                        <p className="font-semibold text-gray-900">{tenant.email}</p>
                        <p className="text-sm text-gray-600">{tenant.phone || '-'}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-500">Bergabung</p>
                        <p className="font-semibold text-gray-900">
                          {new Date(tenant.created_at).toLocaleDateString('id-ID')}
                        </p>
                        <p className="text-sm text-gray-600">
                          {Math.floor((Date.now() - new Date(tenant.created_at).getTime()) / (1000 * 60 * 60 * 24))} hari lalu
                        </p>
                      </div>
                    </div>
                    
                    {tenant.address && (
                      <div className="mt-4">
                        <p className="text-sm text-gray-500 mb-1">Alamat</p>
                        <p className="text-gray-900">{tenant.address}</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-col gap-2 lg:ml-6">
                    <div className="text-right mb-2">
                      <p className="text-sm text-gray-500">Revenue Bulanan</p>
                      <p className="text-xl font-bold text-green-600">
                        Rp {(packages.find(p => p.name === tenant.package)?.price || 0).toLocaleString('id-ID')}
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
                      <Button variant="outline" size="sm" className="flex items-center gap-2">
                        <Settings className="h-4 w-4" />
                        Pengaturan
                      </Button>
                      {tenant.status === 'Suspended' && (
                        <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white flex items-center gap-2">
                          <Trash2 className="h-4 w-4" />
                          Hapus
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

      {/* Subscription Packages */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-blue-600" />
            Paket Berlangganan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {packages.map((pkg, index) => (
              <Card key={index} className="border-2 hover:border-blue-300 transition-colors">
                <CardContent className="p-6">
                  <div className="text-center mb-4">
                    <h3 className="text-xl font-bold text-gray-900">{pkg.name}</h3>
                    <p className="text-3xl font-bold text-blue-600 mt-2">
                      Rp {pkg.price.toLocaleString('id-ID')}
                    </p>
                    <p className="text-sm text-gray-500">per bulan</p>
                  </div>
                  
                  <ul className="space-y-2 mb-6">
                    {pkg.features.map((feature, idx) => (
                      <li key={idx} className="text-sm text-gray-600 flex items-center">
                        <span className="w-2 h-2 bg-blue-600 rounded-full mr-2"></span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  
                  <div className="text-center">
                    <p className="text-sm text-gray-500 mb-2">
                      {pkg.tenants} tenant menggunakan
                    </p>
                    <Button variant="outline" size="sm" className="w-full">
                      Edit Paket
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}