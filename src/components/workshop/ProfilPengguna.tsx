import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  User, 
  Mail, 
  Calendar, 
  Shield, 
  Edit, 
  Save, 
  X,
  Camera,
  Key,
  Clock
} from 'lucide-react';
import { useAuth } from '../../../supabase/auth';
import { useToast } from '@/components/ui/use-toast';

export default function ProfilPengguna() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    email: user?.email || '',
    displayName: user?.email?.split('@')[0] || '',
    role: user?.email?.includes('admin') ? 'Super Admin' : 'Pemilik Bengkel',
    joinDate: user?.created_at || new Date().toISOString(),
    lastLogin: new Date().toISOString()
  });

  const handleInputChange = (field: string, value: string) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Berhasil",
        description: "Profil berhasil diperbarui",
      });
      
      setIsEditing(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal memperbarui profil",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Profil Pengguna</h1>
          <p className="text-gray-600">Kelola informasi akun dan preferensi Anda</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <Card className="lg:col-span-1">
            <CardHeader className="text-center">
              <div className="relative mx-auto mb-4">
                <Avatar className="h-24 w-24">
                  <AvatarImage
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`}
                    alt={profileData.displayName}
                  />
                  <AvatarFallback className="text-2xl">
                    {profileData.displayName[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <Button
                  size="sm"
                  variant="outline"
                  className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0"
                >
                  <Camera className="h-4 w-4" />
                </Button>
              </div>
              <CardTitle className="text-xl">{profileData.displayName}</CardTitle>
              <Badge variant="outline" className="mt-2">
                <Shield className="h-3 w-3 mr-1" />
                {profileData.role}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <Mail className="h-4 w-4" />
                <span>{profileData.email}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <Calendar className="h-4 w-4" />
                <span>Bergabung {formatDate(profileData.joinDate)}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <Clock className="h-4 w-4" />
                <span>Login terakhir {formatDate(profileData.lastLogin)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Profile Information */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Informasi Profil
                </CardTitle>
                <Button
                  variant={isEditing ? "outline" : "default"}
                  size="sm"
                  onClick={() => {
                    if (isEditing) {
                      setIsEditing(false);
                    } else {
                      setIsEditing(true);
                    }
                  }}
                >
                  {isEditing ? (
                    <>
                      <X className="h-4 w-4 mr-2" />
                      Batal
                    </>
                  ) : (
                    <>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Profil
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="displayName">Nama Tampilan</Label>
                  {isEditing ? (
                    <Input
                      id="displayName"
                      value={profileData.displayName}
                      onChange={(e) => handleInputChange('displayName', e.target.value)}
                      placeholder="Nama tampilan"
                    />
                  ) : (
                    <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-md">
                      {profileData.displayName}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
                    {profileData.email}
                    <span className="block text-xs text-gray-500 mt-1">
                      Email tidak dapat diubah
                    </span>
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Role & Permissions</Label>
                <div className="bg-gray-50 p-4 rounded-md">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{profileData.role}</p>
                      <p className="text-sm text-gray-600">
                        {profileData.role === 'Super Admin' 
                          ? 'Akses penuh ke semua fitur dan manajemen tenant'
                          : 'Akses ke fitur manajemen bengkel dan laporan'
                        }
                      </p>
                    </div>
                    <Badge variant="secondary">
                      {profileData.role === 'Super Admin' ? 'Admin' : 'Owner'}
                    </Badge>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900">Informasi Akun</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <Label className="text-gray-600">Tanggal Bergabung</Label>
                    <p className="text-gray-900">{formatDate(profileData.joinDate)}</p>
                  </div>
                  <div>
                    <Label className="text-gray-600">Login Terakhir</Label>
                    <p className="text-gray-900">{formatDate(profileData.lastLogin)}</p>
                  </div>
                  <div>
                    <Label className="text-gray-600">Status Akun</Label>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                      <span className="text-green-600">Aktif</span>
                    </div>
                  </div>
                  <div>
                    <Label className="text-gray-600">Verifikasi Email</Label>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                      <span className="text-green-600">Terverifikasi</span>
                    </div>
                  </div>
                </div>
              </div>

              {isEditing && (
                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setIsEditing(false)}
                    disabled={loading}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Batal
                  </Button>
                  <Button onClick={handleSave} disabled={loading}>
                    <Save className="h-4 w-4 mr-2" />
                    {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Security Section */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Keamanan Akun
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900">Password</h4>
                <p className="text-sm text-gray-600">Terakhir diubah 30 hari yang lalu</p>
              </div>
              <Button variant="outline" size="sm">
                Ubah Password
              </Button>
            </div>
            
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900">Autentikasi Dua Faktor</h4>
                <p className="text-sm text-gray-600">Tambahkan lapisan keamanan ekstra</p>
              </div>
              <Button variant="outline" size="sm">
                Aktifkan 2FA
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900">Sesi Aktif</h4>
                <p className="text-sm text-gray-600">Kelola perangkat yang terhubung</p>
              </div>
              <Button variant="outline" size="sm">
                Lihat Sesi
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}