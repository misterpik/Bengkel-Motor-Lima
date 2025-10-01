import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, Wrench, Package, Calendar, TrendingUp, AlertTriangle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { supabase } from '../../../supabase/supabase';
import { useAuth } from '../../../supabase/auth';
import { useToast } from '@/components/ui/use-toast';

interface DashboardUtamaProps {
  isLoading?: boolean;
}

interface DashboardStats {
  totalRevenue: number;
  activeServices: number;
  completedToday: number;
  lowStockItems: number;
  upcomingServices: number;
}

interface RecentService {
  id: string;
  service_number: string;
  customer_name: string;
  vehicle_brand: string | null;
  vehicle_model: string | null;
  status: string;
  created_at: string;
}

interface LowStockItem {
  id: string;
  name: string;
  stock: number;
  minimum_stock: number;
}

interface RevenueData {
  date: string;
  revenue: number;
  services: number;
}

export default function DashboardUtama({ isLoading = false }: DashboardUtamaProps) {
  const { tenantId } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalRevenue: 0,
    activeServices: 0,
    completedToday: 0,
    lowStockItems: 0,
    upcomingServices: 0
  });
  const [recentServices, setRecentServices] = useState<RecentService[]>([]);
  const [lowStockItems, setLowStockItems] = useState<LowStockItem[]>([]);
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);

  const fetchDashboardData = async () => {
    if (!tenantId) return;
    
    setLoading(true);
    try {
      // Fetch services data
      const { data: services, error: servicesError } = await supabase
        .from('services')
        .select('*')
        .eq('tenant_id', tenantId);

      if (servicesError) throw servicesError;

      // Fetch spareparts data
      const { data: spareparts, error: sparepartsError } = await supabase
        .from('spareparts')
        .select('*')
        .eq('tenant_id', tenantId);

      if (sparepartsError) throw sparepartsError;

      // Calculate stats
      const today = new Date().toISOString().split('T')[0];
      const activeServices = services?.filter(s => s.status === 'Dalam Proses').length || 0;
      
      // Count only TODAY's completed transactions
      const completedToday = services?.filter(s => {
        if (s.status !== 'Selesai' || !s.updated_at) return false;
        const serviceDate = s.updated_at.split('T')[0];
        return serviceDate === today;
      }).length || 0;
      
      // Calculate TODAY's revenue only (not total cumulative)
      const todayRevenue = services?.reduce((sum, service) => {
        if (service.status === 'Selesai' && 
            service.actual_cost && 
            service.updated_at) {
          const serviceDate = service.updated_at.split('T')[0];
          if (serviceDate === today) {
            return sum + service.actual_cost;
          }
        }
        return sum;
      }, 0) || 0;

      const lowStock = spareparts?.filter(item => item.stock <= item.minimum_stock) || [];
      
      setStats({
        totalRevenue: todayRevenue, // Now shows only today's revenue
        activeServices,
        completedToday,
        lowStockItems: lowStock.length,
        upcomingServices: services?.filter(s => s.status === 'Antrian').length || 0
      });

      // Set recent services (last 4)
      const recent = services?.slice(0, 4).map(service => ({
        id: service.id,
        service_number: service.service_number,
        customer_name: service.customer_name,
        vehicle_brand: service.vehicle_brand,
        vehicle_model: service.vehicle_model,
        status: service.status,
        created_at: service.created_at
      })) || [];
      
      setRecentServices(recent);

      // Set low stock items (first 4)
      setLowStockItems(lowStock.slice(0, 4));

      // Generate revenue data for last 7 days
      const revenueChartData = generateRevenueData(services || []);
      setRevenueData(revenueChartData);

    } catch (error: any) {
      toast({
        title: "Error",
        description: "Gagal memuat data dashboard",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateRevenueData = (services: any[]): RevenueData[] => {
    const last7Days = [];
    const today = new Date();
    
    // Generate last 7 days
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      // Calculate revenue for this specific date only
      const dayRevenue = services
        .filter(service => {
          if (service.status !== 'Selesai' || !service.actual_cost || !service.updated_at) {
            return false;
          }
          // Extract date part from updated_at and compare
          const serviceDate = service.updated_at.split('T')[0];
          return serviceDate === dateStr;
        })
        .reduce((sum, service) => sum + service.actual_cost, 0);

      // Count completed services for this specific date only
      const dayServices = services
        .filter(service => {
          if (service.status !== 'Selesai' || !service.updated_at) {
            return false;
          }
          // Extract date part from updated_at and compare
          const serviceDate = service.updated_at.split('T')[0];
          return serviceDate === dateStr;
        }).length;

      last7Days.push({
        date: date.toLocaleDateString('id-ID', { 
          day: '2-digit', 
          month: 'short' 
        }),
        revenue: dayRevenue,
        services: dayServices
      });
    }
    
    return last7Days;
  };

  useEffect(() => {
    fetchDashboardData();
  }, [tenantId]);

  const statsCards = [
    {
      title: 'Transaksi Hari Ini',
      value: `Rp ${stats.totalRevenue.toLocaleString('id-ID')}`,
      change: `${stats.completedToday} transaksi selesai`,
      icon: BarChart3,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Servis Aktif',
      value: stats.activeServices.toString(),
      change: `${stats.completedToday} selesai hari ini`,
      icon: Wrench,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Stok Menipis',
      value: stats.lowStockItems.toString(),
      change: 'Perlu restock',
      icon: Package,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      title: 'Jadwal Servis',
      value: stats.upcomingServices.toString(),
      change: 'Dalam antrian',
      icon: Calendar,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    }
  ];

  if (isLoading || loading) {
    return (
      <div className="space-y-6 bg-white min-h-screen p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 bg-white min-h-screen p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard Utama</h1>
        <p className="text-gray-600">Ringkasan aktivitas bengkel hari ini</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                  <TrendingUp className="h-4 w-4 text-green-500" />
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-xs text-gray-500">{stat.change}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Services */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wrench className="h-5 w-5 text-blue-600" />
              Servis Terbaru
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentServices.length === 0 ? (
                <div className="text-center py-8">
                  <Wrench className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">Belum ada data servis</p>
                </div>
              ) : (
                recentServices.map((service) => (
                  <div key={service.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-sm">{service.service_number}</span>
                        <span className="text-xs text-gray-500">
                          {new Date(service.created_at).toLocaleTimeString('id-ID', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-gray-900">{service.customer_name}</p>
                      <p className="text-xs text-gray-600">
                        {service.vehicle_brand} {service.vehicle_model}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        service.status === 'Selesai' 
                          ? 'bg-green-100 text-green-800'
                          : service.status === 'Dalam Proses'
                          ? 'bg-blue-100 text-blue-800'
                          : service.status === 'Menunggu Sparepart'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {service.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Low Stock Alert */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              Stok Menipis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {lowStockItems.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">Semua stok dalam kondisi aman</p>
                </div>
              ) : (
                lowStockItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{item.name}</p>
                      <p className="text-xs text-gray-600">Minimum: {item.minimum_stock} unit</p>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-bold text-orange-600">{item.stock}</span>
                      <p className="text-xs text-gray-500">tersisa</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Chart */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            Grafik Pendapatan (7 Hari Terakhir)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  stroke="#666"
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  stroke="#666"
                  tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip 
                  formatter={(value: number, name: string) => [
                    name === 'revenue' 
                      ? `Rp ${value.toLocaleString('id-ID')}` 
                      : `${value} servis`,
                    name === 'revenue' ? 'Pendapatan' : 'Jumlah Servis'
                  ]}
                  labelFormatter={(label) => `Tanggal: ${label}`}
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Bar 
                  dataKey="revenue" 
                  fill="#3b82f6" 
                  radius={[4, 4, 0, 0]}
                  name="revenue"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          {/* Chart Summary */}
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-600 font-medium">Total 7 Hari</p>
              <p className="text-lg font-bold text-blue-900">
                Rp {revenueData.reduce((sum, day) => sum + day.revenue, 0).toLocaleString('id-ID')}
              </p>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <p className="text-sm text-green-600 font-medium">Servis Selesai</p>
              <p className="text-lg font-bold text-green-900">
                {revenueData.reduce((sum, day) => sum + day.services, 0)} servis
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}