import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Package, 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  AlertTriangle,
  Grid,
  List,
  ShoppingCart,
  RefreshCw
} from 'lucide-react';
import AddSparepartModal from './AddSparepartModal';
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
  supplier: string | null;
  location: string | null;
  image_url: string | null;
  created_at: string;
}

interface KatalogSparepartProps {
  isLoading?: boolean;
}

export default function KatalogSparepart({ isLoading = false }: KatalogSparepartProps) {
  const { tenantId } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [categoryFilter, setCategoryFilter] = useState('Semua');
  const [spareparts, setSpareparts] = useState<Sparepart[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  const categories = ['Semua', 'Oli & Pelumas', 'Ban & Velg', 'Rem', 'Filter', 'Kelistrikan', 'Transmisi', 'Mesin', 'Body & Aksesoris', 'Lainnya'];

  const fetchSpareparts = async () => {
    if (!tenantId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('spareparts')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSpareparts(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Gagal memuat data sparepart",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSpareparts();
  }, [tenantId]);

  const getStockStatus = (stock: number, minimum: number) => {
    if (stock === 0) return { status: 'Habis', color: 'bg-red-100 text-red-800' };
    if (stock <= minimum * 0.3) return { status: 'Kritis', color: 'bg-red-100 text-red-800' };
    if (stock <= minimum) return { status: 'Menipis', color: 'bg-yellow-100 text-yellow-800' };
    return { status: 'Aman', color: 'bg-green-100 text-green-800' };
  };

  const filteredSpareparts = spareparts.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (item.brand && item.brand.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (item.category && item.category.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         item.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'Semua' || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const getStats = () => {
    const total = spareparts.length;
    const kritis = spareparts.filter(item => item.stock <= item.minimum_stock * 0.3).length;
    const menipis = spareparts.filter(item => item.stock <= item.minimum_stock && item.stock > item.minimum_stock * 0.3).length;
    const totalValue = spareparts.reduce((total, item) => total + ((item.price || 0) * item.stock), 0);
    
    return { total, kritis, menipis, totalValue };
  };

  const stats = getStats();

  if (isLoading || loading) {
    return (
      <div className="space-y-6 bg-white min-h-screen p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-64 bg-gray-200 rounded"></div>
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Katalog Sparepart</h1>
          <p className="text-gray-600">Kelola inventori sparepart bengkel</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={fetchSpareparts}
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
            Tambah Sparepart
          </Button>
        </div>
      </div>

      {/* Search and Filter */}
      <Card className="shadow-lg">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Cari sparepart berdasarkan nama, brand, kode, atau kategori..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <select 
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filter Stok
              </Button>
              <div className="flex border border-gray-300 rounded-md">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="rounded-r-none"
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="rounded-l-none"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="shadow-lg">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
            <div className="text-sm text-gray-600">Total Item</div>
          </CardContent>
        </Card>
        <Card className="shadow-lg">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{stats.kritis}</div>
            <div className="text-sm text-gray-600">Stok Kritis</div>
          </CardContent>
        </Card>
        <Card className="shadow-lg">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">{stats.menipis}</div>
            <div className="text-sm text-gray-600">Stok Menipis</div>
          </CardContent>
        </Card>
        <Card className="shadow-lg">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              Rp {stats.totalValue.toLocaleString('id-ID')}
            </div>
            <div className="text-sm text-gray-600">Nilai Stok</div>
          </CardContent>
        </Card>
      </div>

      {/* Spareparts Grid/List */}
      {filteredSpareparts.length === 0 ? (
        <Card className="shadow-lg">
          <CardContent className="p-12 text-center">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">
              {searchTerm || categoryFilter !== 'Semua' 
                ? 'Tidak ada sparepart yang sesuai dengan filter'
                : 'Belum ada data sparepart'
              }
            </p>
            {!searchTerm && categoryFilter === 'Semua' && (
              <Button 
                className="mt-4 bg-blue-600 hover:bg-blue-700"
                onClick={() => setShowAddModal(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Tambah Sparepart Pertama
              </Button>
            )}
          </CardContent>
        </Card>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSpareparts.map((item) => {
            const stockStatus = getStockStatus(item.stock, item.minimum_stock);
            return (
              <Card key={item.id} className="shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <img 
                      src={item.image_url || 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&q=80'} 
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <Badge className={stockStatus.color}>
                      {stockStatus.status}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900">{item.name}</h3>
                      <span className="text-xs text-gray-500">{item.code}</span>
                    </div>
                    <p className="text-sm text-gray-600">{item.brand} • {item.category}</p>
                    <p className="text-sm text-gray-500">Lokasi: {item.location || '-'}</p>
                    
                    <div className="flex justify-between items-center pt-2">
                      <div>
                        <p className="text-lg font-bold text-blue-600">
                          Rp {(item.price || 0).toLocaleString('id-ID')}
                        </p>
                        <p className="text-sm text-gray-500">
                          Stok: {item.stock} / Min: {item.minimum_stock}
                        </p>
                      </div>
                      {item.stock <= item.minimum_stock && (
                        <AlertTriangle className="h-5 w-5 text-orange-500" />
                      )}
                    </div>
                    
                    <div className="flex gap-2 pt-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button size="sm" className="flex-1 bg-green-600 hover:bg-green-700">
                        <ShoppingCart className="h-4 w-4 mr-1" />
                        Restock
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="shadow-lg">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sparepart
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Kategori
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stok
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Harga
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredSpareparts.map((item) => {
                    const stockStatus = getStockStatus(item.stock, item.minimum_stock);
                    return (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <img 
                              src={item.image_url || 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&q=80'} 
                              alt={item.name}
                              className="w-10 h-10 object-cover rounded-lg mr-3"
                            />
                            <div>
                              <div className="text-sm font-medium text-gray-900">{item.name}</div>
                              <div className="text-sm text-gray-500">{item.brand} • {item.code}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.category || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.stock} / {item.minimum_stock}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                          Rp {(item.price || 0).toLocaleString('id-ID')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge className={stockStatus.color}>
                            {stockStatus.status}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button size="sm" className="bg-green-600 hover:bg-green-700">
                              <ShoppingCart className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      <AddSparepartModal
        open={showAddModal}
        onOpenChange={setShowAddModal}
        onSparepartAdded={fetchSpareparts}
      />
    </div>
  );
}