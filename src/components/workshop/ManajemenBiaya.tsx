import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Plus, 
  Search, 
  Calendar, 
  DollarSign,
  TrendingDown,
  Filter,
  RefreshCw,
  Edit,
  Trash2
} from 'lucide-react';
import { supabase } from '../../../supabase/supabase';
import { useAuth } from '../../../supabase/auth';
import { useToast } from '@/components/ui/use-toast';
import AddCostModal from './AddCostModal';

interface Cost {
  id: string;
  cost_name: string;
  amount: number;
  cost_date: string;
  notes: string | null;
  created_at: string;
}

export default function ManajemenBiaya() {
  const { tenantId, user } = useAuth();
  const { toast } = useToast();
  const [costs, setCosts] = useState<Cost[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCostName, setFilterCostName] = useState('all');
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

  // Use user.id as fallback if tenantId is not available
  const effectiveTenantId = tenantId || user?.id;

  const PREDEFINED_COSTS = [
    'Gaji Karyawan',
    'Biaya Listrik',
    'Biaya Air',
    'Biaya Internet',
    'Biaya Sewa Tempat',
    'Biaya Maintenance Alat',
    'Biaya Marketing'
  ];

  const fetchCosts = async () => {
    if (!effectiveTenantId) {
      console.log('No tenantId available');
      setLoading(false);
      return;
    }
    
    setLoading(true);
    try {
      console.log('Fetching costs for tenant:', effectiveTenantId);
      const { data, error } = await supabase
        .from('costs')
        .select('*')
        .eq('tenant_id', effectiveTenantId)
        .order('cost_date', { ascending: false });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      console.log('Fetched costs:', data);
      setCosts(data || []);
    } catch (error: any) {
      console.error('Error fetching costs:', error);
      toast({
        title: "Error",
        description: "Gagal memuat data biaya",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCosts();
  }, [effectiveTenantId]);

  const filteredCosts = costs.filter(cost => {
    const matchesSearch = cost.cost_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cost.notes?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterCostName === 'all' || cost.cost_name === filterCostName;
    const matchesMonth = cost.cost_date.startsWith(selectedMonth);
    
    return matchesSearch && matchesFilter && matchesMonth;
  });

  const totalCosts = filteredCosts.reduce((sum, cost) => sum + cost.amount, 0);
  const costsByCategory = PREDEFINED_COSTS.map(category => ({
    name: category,
    total: filteredCosts
      .filter(cost => cost.cost_name === category)
      .reduce((sum, cost) => sum + cost.amount, 0),
    count: filteredCosts.filter(cost => cost.cost_name === category).length
  })).filter(category => category.count > 0);

  const formatCurrency = (amount: number) => {
    return `Rp ${amount.toLocaleString('id-ID')}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Manajemen Biaya</h1>
            <p className="text-gray-600">Kelola dan pantau pengeluaran operasional bengkel</p>
          </div>
          
          <Button onClick={() => setShowAddModal(true)} className="mt-4 md:mt-0">
            <Plus className="h-4 w-4 mr-2" />
            Tambah Biaya
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card className="border-red-200 bg-red-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2 text-red-800">
                <TrendingDown className="h-5 w-5" />
                Total Biaya Bulan Ini
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-red-600">
                {formatCurrency(totalCosts)}
              </p>
              <p className="text-sm text-red-700 mt-1">
                {filteredCosts.length} transaksi biaya
              </p>
            </CardContent>
          </Card>

          <Card className="border-blue-200 bg-blue-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2 text-blue-800">
                <DollarSign className="h-5 w-5" />
                Rata-rata per Transaksi
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-blue-600">
                {filteredCosts.length > 0 ? formatCurrency(totalCosts / filteredCosts.length) : 'Rp 0'}
              </p>
              <p className="text-sm text-blue-700 mt-1">
                Periode: {new Date(selectedMonth).toLocaleDateString('id-ID', { year: 'numeric', month: 'long' })}
              </p>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-green-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2 text-green-800">
                <Calendar className="h-5 w-5" />
                Kategori Terbanyak
              </CardTitle>
            </CardHeader>
            <CardContent>
              {costsByCategory.length > 0 ? (
                <>
                  <p className="text-lg font-bold text-green-600">
                    {costsByCategory.sort((a, b) => b.total - a.total)[0].name}
                  </p>
                  <p className="text-sm text-green-700 mt-1">
                    {formatCurrency(costsByCategory.sort((a, b) => b.total - a.total)[0].total)}
                  </p>
                </>
              ) : (
                <p className="text-lg text-gray-500">Belum ada data</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Cari biaya atau catatan..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={filterCostName} onValueChange={setFilterCostName}>
                <SelectTrigger>
                  <SelectValue placeholder="Semua kategori" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua kategori</SelectItem>
                  {PREDEFINED_COSTS.map((cost) => (
                    <SelectItem key={cost} value={cost}>
                      {cost}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
              />
              
              <Button onClick={fetchCosts} disabled={loading} variant="outline">
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Costs List */}
        <Card>
          <CardHeader>
            <CardTitle>Daftar Biaya ({filteredCosts.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2 text-gray-400" />
                <p className="text-gray-600">Memuat data biaya...</p>
              </div>
            ) : filteredCosts.length === 0 ? (
              <div className="text-center py-8">
                <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">Belum ada data biaya untuk periode ini</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredCosts.map((cost) => (
                  <div key={cost.id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg">{cost.cost_name}</h3>
                          <Badge variant="outline">
                            {formatDate(cost.cost_date)}
                          </Badge>
                        </div>
                        
                        <p className="text-2xl font-bold text-red-600 mb-2">
                          {formatCurrency(cost.amount)}
                        </p>
                        
                        {cost.notes && (
                          <p className="text-gray-600 text-sm bg-gray-100 p-2 rounded">
                            {cost.notes}
                          </p>
                        )}
                        
                        <p className="text-xs text-gray-500 mt-2">
                          Ditambahkan: {new Date(cost.created_at).toLocaleDateString('id-ID', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Category Summary */}
        {costsByCategory.length > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Ringkasan per Kategori</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {costsByCategory.map((category) => (
                  <div key={category.name} className="border rounded-lg p-4">
                    <h4 className="font-semibold mb-2">{category.name}</h4>
                    <p className="text-xl font-bold text-red-600">
                      {formatCurrency(category.total)}
                    </p>
                    <p className="text-sm text-gray-600">
                      {category.count} transaksi
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <AddCostModal
        open={showAddModal}
        onOpenChange={setShowAddModal}
        onCostAdded={fetchCosts}
      />
    </div>
  );
}