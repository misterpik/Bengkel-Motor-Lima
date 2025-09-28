import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ShoppingCart, 
  PiggyBank,
  Calendar,
  Download,
  RefreshCw,
  BarChart3
} from 'lucide-react';
import { supabase } from '../../../supabase/supabase';
import { useAuth } from '../../../supabase/auth';
import { useToast } from '@/components/ui/use-toast';

interface FinancialData {
  totalIncome: number;
  totalExpenses: number;
  netProfit: number;
  transactionCount: number;
  serviceCount: number;
  sparepartCount: number;
}

interface DailyReport {
  date: string;
  income: number;
  expenses: number;
  profit: number;
  services: number;
}

export default function LaporanKeuangan() {
  const { tenantId } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [reportPeriod, setReportPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [financialData, setFinancialData] = useState<FinancialData>({
    totalIncome: 0,
    totalExpenses: 0,
    netProfit: 0,
    transactionCount: 0,
    serviceCount: 0,
    sparepartCount: 0
  });
  const [dailyReports, setDailyReports] = useState<DailyReport[]>([]);

  const fetchFinancialData = async () => {
    if (!tenantId) return;
    
    setLoading(true);
    try {
      const today = new Date();
      let startDate: Date;
      let endDate: Date = new Date(today);
      endDate.setHours(23, 59, 59, 999);

      // Calculate date range based on period
      if (reportPeriod === 'daily') {
        startDate = new Date(selectedDate);
        endDate = new Date(selectedDate);
        endDate.setHours(23, 59, 59, 999);
      } else if (reportPeriod === 'weekly') {
        const selected = new Date(selectedDate);
        const dayOfWeek = selected.getDay();
        startDate = new Date(selected);
        startDate.setDate(selected.getDate() - dayOfWeek);
        endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6);
        endDate.setHours(23, 59, 59, 999);
      } else { // monthly
        const selected = new Date(selectedDate);
        startDate = new Date(selected.getFullYear(), selected.getMonth(), 1);
        endDate = new Date(selected.getFullYear(), selected.getMonth() + 1, 0);
        endDate.setHours(23, 59, 59, 999);
      }

      // Fetch payments (income)
      const { data: payments, error: paymentsError } = await supabase
        .from('payments')
        .select('amount, payment_date')
        .eq('tenant_id', tenantId)
        .eq('payment_status', 'Completed')
        .gte('payment_date', startDate.toISOString())
        .lte('payment_date', endDate.toISOString());

      if (paymentsError) throw paymentsError;

      // Fetch service spareparts (expenses)
      const { data: serviceSpareparts, error: sparepartsError } = await supabase
        .from('service_spareparts')
        .select(`
          quantity,
          spareparts!inner(purchase_price),
          services!inner(created_at)
        `)
        .eq('services.tenant_id', tenantId)
        .gte('services.created_at', startDate.toISOString())
        .lte('services.created_at', endDate.toISOString());

      if (sparepartsError) throw sparepartsError;

      // Fetch services count
      const { data: services, error: servicesError } = await supabase
        .from('services')
        .select('id, created_at, actual_cost')
        .eq('tenant_id', tenantId)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      if (servicesError) throw servicesError;

      // Calculate totals
      const totalIncome = payments?.reduce((sum, payment) => sum + payment.amount, 0) || 0;
      
      const totalExpenses = serviceSpareparts?.reduce((sum, item) => {
        const purchasePrice = item.spareparts?.purchase_price || 0;
        return sum + (purchasePrice * item.quantity);
      }, 0) || 0;

      const netProfit = totalIncome - totalExpenses;

      setFinancialData({
        totalIncome,
        totalExpenses,
        netProfit,
        transactionCount: payments?.length || 0,
        serviceCount: services?.length || 0,
        sparepartCount: serviceSpareparts?.length || 0
      });

      // Generate daily breakdown for weekly/monthly views
      if (reportPeriod !== 'daily') {
        const dailyBreakdown: DailyReport[] = [];
        const currentDate = new Date(startDate);
        
        while (currentDate <= endDate) {
          const dayStart = new Date(currentDate);
          const dayEnd = new Date(currentDate);
          dayEnd.setHours(23, 59, 59, 999);
          
          const dayPayments = payments?.filter(p => {
            const paymentDate = new Date(p.payment_date);
            return paymentDate >= dayStart && paymentDate <= dayEnd;
          }) || [];
          
          const dayServices = services?.filter(s => {
            const serviceDate = new Date(s.created_at);
            return serviceDate >= dayStart && serviceDate <= dayEnd;
          }) || [];
          
          const daySpareparts = serviceSpareparts?.filter(sp => {
            const serviceDate = new Date(sp.services.created_at);
            return serviceDate >= dayStart && serviceDate <= dayEnd;
          }) || [];
          
          const dayIncome = dayPayments.reduce((sum, p) => sum + p.amount, 0);
          const dayExpenses = daySpareparts.reduce((sum, sp) => {
            const purchasePrice = sp.spareparts?.purchase_price || 0;
            return sum + (purchasePrice * sp.quantity);
          }, 0);
          
          dailyBreakdown.push({
            date: currentDate.toISOString().split('T')[0],
            income: dayIncome,
            expenses: dayExpenses,
            profit: dayIncome - dayExpenses,
            services: dayServices.length
          });
          
          currentDate.setDate(currentDate.getDate() + 1);
        }
        
        setDailyReports(dailyBreakdown);
      }

    } catch (error: any) {
      toast({
        title: "Error",
        description: "Gagal memuat data laporan keuangan",
        variant: "destructive",
      });
      console.error('Error fetching financial data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFinancialData();
  }, [tenantId, reportPeriod, selectedDate]);

  const formatCurrency = (amount: number) => {
    return `Rp ${amount.toLocaleString('id-ID')}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getPeriodLabel = () => {
    const date = new Date(selectedDate);
    if (reportPeriod === 'daily') {
      return formatDate(selectedDate);
    } else if (reportPeriod === 'weekly') {
      const startOfWeek = new Date(date);
      startOfWeek.setDate(date.getDate() - date.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      return `${startOfWeek.toLocaleDateString('id-ID')} - ${endOfWeek.toLocaleDateString('id-ID')}`;
    } else {
      return date.toLocaleDateString('id-ID', { year: 'numeric', month: 'long' });
    }
  };

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Laporan Keuangan</h1>
            <p className="text-gray-600">Pantau pendapatan, pengeluaran, dan laba bersih bengkel</p>
          </div>
          
          <div className="flex flex-col md:flex-row gap-3 mt-4 md:mt-0">
            <Select value={reportPeriod} onValueChange={(value: any) => setReportPeriod(value)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Harian</SelectItem>
                <SelectItem value="weekly">Mingguan</SelectItem>
                <SelectItem value="monthly">Bulanan</SelectItem>
              </SelectContent>
            </Select>
            
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            
            <Button onClick={fetchFinancialData} disabled={loading} className="flex items-center gap-2">
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Period Info */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              <span className="font-semibold">Periode: </span>
              <span className="text-blue-600">{getPeriodLabel()}</span>
            </div>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Income Card */}
          <Card className="border-green-200 bg-green-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2 text-green-800">
                <TrendingUp className="h-5 w-5" />
                Total Pendapatan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-3xl font-bold text-green-600">
                  {formatCurrency(financialData.totalIncome)}
                </p>
                <div className="flex items-center gap-4 text-sm text-green-700">
                  <span>{financialData.transactionCount} transaksi</span>
                  <span>{financialData.serviceCount} servis</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Expenses Card */}
          <Card className="border-red-200 bg-red-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2 text-red-800">
                <TrendingDown className="h-5 w-5" />
                Total Pengeluaran
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-3xl font-bold text-red-600">
                  {formatCurrency(financialData.totalExpenses)}
                </p>
                <div className="flex items-center gap-4 text-sm text-red-700">
                  <span>{financialData.sparepartCount} sparepart</span>
                  <span>Harga beli</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Net Profit Card */}
          <Card className={`border-blue-200 ${financialData.netProfit >= 0 ? 'bg-blue-50' : 'bg-orange-50'}`}>
            <CardHeader className="pb-3">
              <CardTitle className={`text-lg flex items-center gap-2 ${financialData.netProfit >= 0 ? 'text-blue-800' : 'text-orange-800'}`}>
                <PiggyBank className="h-5 w-5" />
                Laba Bersih
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className={`text-3xl font-bold ${financialData.netProfit >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                  {formatCurrency(financialData.netProfit)}
                </p>
                <div className="flex items-center gap-2">
                  <Badge className={
                    financialData.netProfit >= 0 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }>
                    {financialData.netProfit >= 0 ? 'Profit' : 'Loss'}
                  </Badge>
                  {financialData.totalIncome > 0 && (
                    <span className="text-sm text-gray-600">
                      {((financialData.netProfit / financialData.totalIncome) * 100).toFixed(1)}% margin
                    </span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Daily Breakdown for Weekly/Monthly */}
        {reportPeriod !== 'daily' && dailyReports.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Rincian Harian
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dailyReports.map((report, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-semibold text-gray-900">
                        {formatDate(report.date)}
                      </h4>
                      <Badge variant="outline">
                        {report.services} servis
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center">
                        <p className="text-sm text-gray-500">Pendapatan</p>
                        <p className="text-lg font-semibold text-green-600">
                          {formatCurrency(report.income)}
                        </p>
                      </div>
                      
                      <div className="text-center">
                        <p className="text-sm text-gray-500">Pengeluaran</p>
                        <p className="text-lg font-semibold text-red-600">
                          {formatCurrency(report.expenses)}
                        </p>
                      </div>
                      
                      <div className="text-center">
                        <p className="text-sm text-gray-500">Laba</p>
                        <p className={`text-lg font-semibold ${report.profit >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                          {formatCurrency(report.profit)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Financial Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Income Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-700">
                <DollarSign className="h-5 w-5" />
                Rincian Pendapatan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Pembayaran Servis</span>
                  <span className="font-semibold text-green-600">
                    {formatCurrency(financialData.totalIncome)}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Jumlah Transaksi</span>
                  <Badge variant="outline">{financialData.transactionCount}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Jumlah Servis</span>
                  <Badge variant="outline">{financialData.serviceCount}</Badge>
                </div>
                {financialData.serviceCount > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Rata-rata per Servis</span>
                    <span className="font-semibold">
                      {formatCurrency(financialData.totalIncome / financialData.serviceCount)}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Expenses Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-700">
                <ShoppingCart className="h-5 w-5" />
                Rincian Pengeluaran
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Harga Beli Sparepart</span>
                  <span className="font-semibold text-red-600">
                    {formatCurrency(financialData.totalExpenses)}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Jumlah Sparepart Terpakai</span>
                  <Badge variant="outline">{financialData.sparepartCount}</Badge>
                </div>
                {financialData.sparepartCount > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Rata-rata Harga Beli</span>
                    <span className="font-semibold">
                      {formatCurrency(financialData.totalExpenses / financialData.sparepartCount)}
                    </span>
                  </div>
                )}
                <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <strong>Catatan:</strong> Pengeluaran dihitung berdasarkan harga beli sparepart yang digunakan dalam servis.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg flex items-center gap-3">
              <RefreshCw className="h-5 w-5 animate-spin text-blue-600" />
              <span>Memuat data laporan...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}