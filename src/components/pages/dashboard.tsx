import React, { useState } from 'react';
import { useAuth } from '../../../supabase/auth';
import DashboardUtama from '../workshop/DashboardUtama';
import ManajemenServis from '../workshop/ManajemenServis';
import KatalogSparepart from '../workshop/KatalogSparepart';
import ManajemenPelanggan from '../workshop/ManajemenPelanggan';
import PanelAdminSuper from '../workshop/PanelAdminSuper';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  BarChart3, 
  Wrench, 
  Package, 
  Settings, 
  Users, 
  Crown,
  Menu,
  X,
  User,
  LogOut
} from 'lucide-react';

type UserRole = 'bengkel_owner' | 'bengkel_staff' | 'super_admin';
type ActiveView = 'dashboard' | 'servis' | 'sparepart' | 'pelanggan' | 'pengaturan' | 'admin_super';

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const [activeView, setActiveView] = useState<ActiveView>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Simulasi role user - dalam implementasi nyata ini akan dari database
  const userRole: UserRole = user?.email?.includes('admin') ? 'super_admin' : 'bengkel_owner';
  const workshopName = userRole === 'super_admin' ? 'BengkelPro Admin' : 'Bengkel Motor Jaya';

  const menuItems = [
    {
      id: 'dashboard' as ActiveView,
      label: 'Dashboard Utama',
      icon: BarChart3,
      roles: ['bengkel_owner', 'bengkel_staff']
    },
    {
      id: 'servis' as ActiveView,
      label: 'Manajemen Servis',
      icon: Wrench,
      roles: ['bengkel_owner', 'bengkel_staff']
    },
    {
      id: 'pelanggan' as ActiveView,
      label: 'Manajemen Pelanggan',
      icon: Users,
      roles: ['bengkel_owner', 'bengkel_staff']
    },
    {
      id: 'sparepart' as ActiveView,
      label: 'Katalog Sparepart',
      icon: Package,
      roles: ['bengkel_owner', 'bengkel_staff']
    },
    {
      id: 'pengaturan' as ActiveView,
      label: 'Pengaturan Bengkel',
      icon: Settings,
      roles: ['bengkel_owner']
    },
    {
      id: 'admin_super' as ActiveView,
      label: 'Panel Admin Super',
      icon: Crown,
      roles: ['super_admin']
    }
  ];

  const visibleMenuItems = menuItems.filter(item => 
    item.roles.includes(userRole)
  );

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 2000);
  };

  const renderContent = () => {
    switch (activeView) {
      case 'dashboard':
        return <DashboardUtama isLoading={loading} />;
      case 'servis':
        return <ManajemenServis isLoading={loading} />;
      case 'pelanggan':
        return <ManajemenPelanggan isLoading={loading} />;
      case 'sparepart':
        return <KatalogSparepart isLoading={loading} />;
      case 'admin_super':
        return <PanelAdminSuper isLoading={loading} />;
      case 'pengaturan':
        return (
          <div className="space-y-6 bg-white min-h-screen p-6">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Pengaturan Bengkel</h1>
              <p className="text-gray-600">Kelola pengaturan dan konfigurasi bengkel Anda</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-8 text-center">
              <Settings className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Halaman pengaturan akan segera tersedia</p>
            </div>
          </div>
        );
      default:
        return <DashboardUtama isLoading={loading} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <header className="fixed top-0 z-50 w-full bg-white border-b border-gray-200 shadow-sm">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden"
            >
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
            
            <div className="flex items-center space-x-3">
              <Wrench className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="font-bold text-xl text-gray-900">BengkelPro</h1>
                <p className="text-sm text-gray-600">{workshopName}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button 
              onClick={handleRefresh} 
              variant="outline"
              size="sm"
              className="hidden md:flex items-center gap-2"
            >
              <BarChart3 className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Loading...' : 'Refresh'}
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="h-8 w-8 hover:cursor-pointer">
                  <AvatarImage
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`}
                    alt={user?.email || ''}
                  />
                  <AvatarFallback>
                    {user?.email?.[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="text-xs text-gray-500">
                  {user?.email}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  Profil
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  Pengaturan
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer" onSelect={() => signOut()}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Keluar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <div className="flex pt-16">
        {/* Sidebar */}
        <aside className={`
          fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 shadow-lg transform transition-transform duration-300 ease-in-out pt-16
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:static lg:inset-0
        `}>
          <nav className="h-full px-4 py-6 space-y-2">
            {visibleMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveView(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors duration-200
                    ${isActive 
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600' 
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }
                  `}
                >
                  <Icon className={`h-5 w-5 ${isActive ? 'text-blue-600' : 'text-gray-500'}`} />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 z-30 bg-black bg-opacity-50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 lg:ml-0">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}