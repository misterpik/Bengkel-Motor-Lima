import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Settings, 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  DollarSign,
  Bell,
  Shield,
  Users,
  Printer,
  Database,
  Save,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Upload,
  Camera
} from 'lucide-react';
import { supabase } from '../../../supabase/supabase';
import { useAuth } from '../../../supabase/auth';
import { useToast } from '@/components/ui/use-toast';

interface WorkshopSettings {
  id?: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  owner_name: string;
  business_hours_open: string;
  business_hours_close: string;
  service_tax_rate: number;
  auto_backup: boolean;
  email_notifications: boolean;
  sms_notifications: boolean;
  invoice_template: string;
  logo_url: string | null;
  description: string;
  website: string;
  social_media: string;
}

export default function PengaturanBengkel() {
  const { tenantId, user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<WorkshopSettings>({
    name: '',
    address: '',
    phone: '',
    email: '',
    owner_name: '',
    business_hours_open: '08:00',
    business_hours_close: '17:00',
    service_tax_rate: 0,
    auto_backup: true,
    email_notifications: true,
    sms_notifications: false,
    invoice_template: 'standard',
    logo_url: null,
    description: '',
    website: '',
    social_media: ''
  });

  const fetchSettings = async () => {
    if (!tenantId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('tenants')
        .select('*')
        .eq('id', tenantId)
        .single();

      if (error) throw error;

      if (data) {
        setSettings({
          id: data.id,
          name: data.name || '',
          address: data.address || '',
          phone: data.phone || '',
          email: data.email || '',
          owner_name: data.owner_name || '',
          business_hours_open: data.business_hours_open || '08:00',
          business_hours_close: data.business_hours_close || '17:00',
          service_tax_rate: data.service_tax_rate || 0,
          auto_backup: data.auto_backup ?? true,
          email_notifications: data.email_notifications ?? true,
          sms_notifications: data.sms_notifications ?? false,
          invoice_template: data.invoice_template || 'standard',
          logo_url: data.logo_url || null,
          description: data.description || '',
          website: data.website || '',
          social_media: data.social_media || ''
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Gagal memuat pengaturan bengkel",
        variant: "destructive",
      });
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, [tenantId]);

  const handleSave = async () => {
    if (!tenantId) return;
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from('tenants')
        .update({
          name: settings.name,
          address: settings.address,
          phone: settings.phone,
          email: settings.email,
          owner_name: settings.owner_name,
          business_hours_open: settings.business_hours_open,
          business_hours_close: settings.business_hours_close,
          service_tax_rate: settings.service_tax_rate,
          auto_backup: settings.auto_backup,
          email_notifications: settings.email_notifications,
          sms_notifications: settings.sms_notifications,
          invoice_template: settings.invoice_template,
          logo_url: settings.logo_url,
          description: settings.description,
          website: settings.website,
          social_media: settings.social_media,
          updated_at: new Date().toISOString()
        })
        .eq('id', tenantId);

      if (error) throw error;

      toast({
        title: "Berhasil",
        description: "Pengaturan bengkel berhasil disimpan",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Gagal menyimpan pengaturan",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof WorkshopSettings, value: any) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <div className="bg-white min-h-screen">
        <div className="max-w-4xl mx-auto p-6">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="space-y-4">
              <div className="h-32 bg-gray-200 rounded"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Pengaturan Bengkel</h1>
            <p className="text-gray-600">Kelola informasi dan konfigurasi bengkel Anda</p>
          </div>
          
          <div className="flex gap-3">
            <Button onClick={fetchSettings} variant="outline" disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Menyimpan...' : 'Simpan Pengaturan'}
            </Button>
          </div>
        </div>

        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="general">Umum</TabsTrigger>
            <TabsTrigger value="business">Bisnis</TabsTrigger>
            <TabsTrigger value="notifications">Notifikasi</TabsTrigger>
            <TabsTrigger value="system">Sistem</TabsTrigger>
          </TabsList>

          {/* General Settings */}
          <TabsContent value="general" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Informasi Bengkel
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nama Bengkel *</Label>
                    <Input
                      id="name"
                      value={settings.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Bengkel Motor Jaya"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="owner_name">Nama Pemilik *</Label>
                    <Input
                      id="owner_name"
                      value={settings.owner_name}
                      onChange={(e) => handleInputChange('owner_name', e.target.value)}
                      placeholder="Budi Santoso"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Alamat Lengkap *</Label>
                  <Textarea
                    id="address"
                    value={settings.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    placeholder="Jl. Raya No. 123, Kelurahan ABC, Kecamatan XYZ, Kota Jakarta"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Nomor Telepon *</Label>
                    <Input
                      id="phone"
                      value={settings.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="021-12345678"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={settings.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="info@bengkelmotor.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      value={settings.website}
                      onChange={(e) => handleInputChange('website', e.target.value)}
                      placeholder="https://bengkelmotor.com"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="social_media">Media Sosial</Label>
                    <Input
                      id="social_media"
                      value={settings.social_media}
                      onChange={(e) => handleInputChange('social_media', e.target.value)}
                      placeholder="@bengkelmotor"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Deskripsi Bengkel</Label>
                  <Textarea
                    id="description"
                    value={settings.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Bengkel motor terpercaya dengan layanan berkualitas..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="h-5 w-5" />
                  Logo Bengkel
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  {settings.logo_url ? (
                    <img 
                      src={settings.logo_url} 
                      alt="Logo Bengkel" 
                      className="w-16 h-16 object-cover rounded-lg border"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gray-100 rounded-lg border flex items-center justify-center">
                      <Camera className="h-6 w-6 text-gray-400" />
                    </div>
                  )}
                  <div className="flex-1">
                    <Input
                      value={settings.logo_url || ''}
                      onChange={(e) => handleInputChange('logo_url', e.target.value)}
                      placeholder="URL logo bengkel"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Masukkan URL gambar logo bengkel (format: JPG, PNG)
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Business Settings */}
          <TabsContent value="business" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Jam Operasional
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="business_hours_open">Jam Buka</Label>
                    <Input
                      id="business_hours_open"
                      type="time"
                      value={settings.business_hours_open}
                      onChange={(e) => handleInputChange('business_hours_open', e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="business_hours_close">Jam Tutup</Label>
                    <Input
                      id="business_hours_close"
                      type="time"
                      value={settings.business_hours_close}
                      onChange={(e) => handleInputChange('business_hours_close', e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <Clock className="h-4 w-4 inline mr-1" />
                    Jam operasional: {settings.business_hours_open} - {settings.business_hours_close}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Pengaturan Harga
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="service_tax_rate">Pajak Layanan (%)</Label>
                    <Input
                      id="service_tax_rate"
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={settings.service_tax_rate}
                      onChange={(e) => handleInputChange('service_tax_rate', parseFloat(e.target.value) || 0)}
                      placeholder="0"
                    />
                    <p className="text-xs text-gray-500">
                      Pajak yang akan ditambahkan ke setiap layanan servis
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Printer className="h-5 w-5" />
                  Template Invoice
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="invoice_template">Template Invoice</Label>
                  <Select 
                    value={settings.invoice_template} 
                    onValueChange={(value) => handleInputChange('invoice_template', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Standard</SelectItem>
                      <SelectItem value="minimal">Minimal</SelectItem>
                      <SelectItem value="detailed">Detail Lengkap</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Settings */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Pengaturan Notifikasi
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Notifikasi Email</Label>
                    <p className="text-sm text-gray-500">
                      Terima notifikasi melalui email untuk transaksi penting
                    </p>
                  </div>
                  <Switch
                    checked={settings.email_notifications}
                    onCheckedChange={(checked) => handleInputChange('email_notifications', checked)}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Notifikasi SMS</Label>
                    <p className="text-sm text-gray-500">
                      Terima notifikasi melalui SMS untuk update status servis
                    </p>
                  </div>
                  <Switch
                    checked={settings.sms_notifications}
                    onCheckedChange={(checked) => handleInputChange('sms_notifications', checked)}
                  />
                </div>

                <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-yellow-800">Catatan Penting</p>
                      <p className="text-sm text-yellow-700 mt-1">
                        Fitur notifikasi SMS memerlukan konfigurasi tambahan dan mungkin dikenakan biaya.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* System Settings */}
          <TabsContent value="system" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Pengaturan Sistem
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Backup Otomatis</Label>
                    <p className="text-sm text-gray-500">
                      Backup data secara otomatis setiap hari
                    </p>
                  </div>
                  <Switch
                    checked={settings.auto_backup}
                    onCheckedChange={(checked) => handleInputChange('auto_backup', checked)}
                  />
                </div>

                <Separator />

                <div className="space-y-4">
                  <div>
                    <Label className="text-base font-medium">Informasi Sistem</Label>
                    <div className="mt-3 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">User ID:</span>
                        <Badge variant="outline">{user?.id?.slice(0, 8)}...</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Tenant ID:</span>
                        <Badge variant="outline">{tenantId?.slice(0, 8)}...</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Email:</span>
                        <span className="text-sm font-mono">{user?.email}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-green-50 rounded-lg">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-green-800">Sistem Aktif</p>
                      <p className="text-sm text-green-700 mt-1">
                        Semua sistem berjalan normal. Data Anda aman dan tersinkronisasi.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}