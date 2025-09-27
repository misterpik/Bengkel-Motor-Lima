import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ChevronRight,
  Settings,
  User,
  Wrench,
  BarChart3,
  Package,
  Users,
  Shield,
  Smartphone,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../../supabase/auth";

export default function LandingPage() {
  const { user, signOut } = useAuth();

  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white text-black">
      {/* Navigation */}
      <header className="fixed top-0 z-50 w-full bg-[rgba(255,255,255,0.95)] backdrop-blur-md border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-6">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <Wrench className="h-8 w-8 text-blue-600" />
              <span className="font-bold text-xl text-gray-900">
                BengkelPro
              </span>
            </Link>
          </div>
          <div className="flex items-center space-x-6">
            {user ? (
              <div className="flex items-center gap-4">
                <Link to="/dashboard">
                  <Button
                    variant="ghost"
                    className="text-sm font-medium hover:text-blue-600"
                  >
                    Dashboard
                  </Button>
                </Link>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Avatar className="h-8 w-8 hover:cursor-pointer">
                      <AvatarImage
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`}
                        alt={user.email || ""}
                      />
                      <AvatarFallback>
                        {user.email?.[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="rounded-xl border-none shadow-lg"
                  >
                    <DropdownMenuLabel className="text-xs text-gray-500">
                      {user.email}
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
                    <DropdownMenuItem
                      className="cursor-pointer"
                      onSelect={() => signOut()}
                    >
                      Keluar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <>
                <Link to="/login">
                  <Button
                    variant="ghost"
                    className="text-sm font-medium hover:text-blue-600"
                  >
                    Masuk
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button className="rounded-full bg-blue-600 text-white hover:bg-blue-700 text-sm px-6 py-2 font-medium shadow-lg">
                    Mulai Gratis
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="pt-16">
        {/* Hero section */}
        <section className="relative py-24 bg-gradient-to-br from-blue-50 via-white to-indigo-50">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-gray-900 mb-6">
                Sistem Manajemen Bengkel Motor
                <span className="text-blue-600"> Terdepan</span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 mb-8 leading-relaxed">
                Kelola bengkel motor Anda dengan mudah. Dari servis, sparepart,
                hingga laporan keuangan - semua dalam satu platform modern.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
                <Link to="/signup">
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-full text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                    Mulai Gratis Sekarang
                    <ChevronRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link to="#demo">
                  <Button
                    variant="outline"
                    className="border-2 border-gray-300 text-gray-700 hover:border-blue-600 hover:text-blue-600 px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300"
                  >
                    Lihat Demo
                  </Button>
                </Link>
              </div>
              <div className="text-sm text-gray-500">
                ✓ Gratis 30 hari • ✓ Tanpa kartu kredit • ✓ Setup dalam 5 menit
              </div>
            </div>
          </div>

          {/* Hero Image/Mockup */}
          <div className="max-w-6xl mx-auto px-6 mt-16">
            <div className="relative">
              <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  </div>
                </div>
                <div className="p-8">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-blue-50 p-6 rounded-xl">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-gray-900">
                          Transaksi Hari Ini
                        </h3>
                        <BarChart3 className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="text-3xl font-bold text-blue-600">
                        Rp 2.450.000
                      </div>
                      <div className="text-sm text-gray-600">
                        +12% dari kemarin
                      </div>
                    </div>
                    <div className="bg-green-50 p-6 rounded-xl">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-gray-900">
                          Servis Aktif
                        </h3>
                        <Wrench className="h-5 w-5 text-green-600" />
                      </div>
                      <div className="text-3xl font-bold text-green-600">
                        24
                      </div>
                      <div className="text-sm text-gray-600">
                        8 selesai hari ini
                      </div>
                    </div>
                    <div className="bg-orange-50 p-6 rounded-xl">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-gray-900">
                          Stok Menipis
                        </h3>
                        <Package className="h-5 w-5 text-orange-600" />
                      </div>
                      <div className="text-3xl font-bold text-orange-600">
                        7
                      </div>
                      <div className="text-sm text-gray-600">Perlu restock</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features section */}
        <section className="py-24 bg-gray-50">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Fitur Lengkap untuk Bengkel Modern
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Semua yang Anda butuhkan untuk mengelola bengkel motor dengan
                efisien dan profesional
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="h-14 w-14 bg-blue-100 rounded-2xl flex items-center justify-center mb-6">
                  <BarChart3 className="h-7 w-7 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Dashboard Utama
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Ringkasan transaksi harian, stok sparepart menipis, jadwal
                  servis, dan grafik pendapatan dalam satu tampilan.
                </p>
              </div>

              <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="h-14 w-14 bg-green-100 rounded-2xl flex items-center justify-center mb-6">
                  <Wrench className="h-7 w-7 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Manajemen Servis
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Catat servis baru, pantau status pengerjaan, proses
                  pembayaran, dan cetak nota dengan mudah.
                </p>
              </div>

              <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="h-14 w-14 bg-purple-100 rounded-2xl flex items-center justify-center mb-6">
                  <Package className="h-7 w-7 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Katalog Sparepart
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Kelola inventori sparepart dengan fitur pencarian, filter
                  kategori, dan notifikasi stok menipis.
                </p>
              </div>

              <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="h-14 w-14 bg-orange-100 rounded-2xl flex items-center justify-center mb-6">
                  <Users className="h-7 w-7 text-orange-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Multi-Tenant
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Sistem yang memisahkan data antar bengkel dengan aman, cocok
                  untuk provider SaaS.
                </p>
              </div>

              <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="h-14 w-14 bg-red-100 rounded-2xl flex items-center justify-center mb-6">
                  <Shield className="h-7 w-7 text-red-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Panel Admin Super
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Kelola tenant, lihat statistik penggunaan, dan atur paket
                  berlangganan untuk semua bengkel.
                </p>
              </div>

              <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="h-14 w-14 bg-indigo-100 rounded-2xl flex items-center justify-center mb-6">
                  <Smartphone className="h-7 w-7 text-indigo-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Responsif & Modern
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Antarmuka modern dalam Bahasa Indonesia yang dapat diakses
                  dari desktop maupun mobile.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-4xl font-bold text-gray-900 mb-6">
                  Mengapa Memilih BengkelPro?
                </h2>
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-semibold text-sm">
                        1
                      </span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Setup Cepat & Mudah
                      </h3>
                      <p className="text-gray-600">
                        Mulai dalam 5 menit tanpa perlu keahlian teknis. Semua
                        sudah siap pakai.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-semibold text-sm">
                        2
                      </span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Hemat Waktu & Biaya
                      </h3>
                      <p className="text-gray-600">
                        Otomatisasi proses administrasi bengkel, kurangi
                        kesalahan manual.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-semibold text-sm">
                        3
                      </span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Laporan Real-time
                      </h3>
                      <p className="text-gray-600">
                        Pantau performa bengkel dengan dashboard dan laporan
                        yang selalu update.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-semibold text-sm">
                        4
                      </span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Support 24/7
                      </h3>
                      <p className="text-gray-600">
                        Tim support siap membantu Anda kapan saja melalui chat,
                        email, atau telepon.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="relative">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl p-8">
                  <div className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-gray-900">
                        Ringkasan Bengkel
                      </h3>
                      <div className="text-xs text-gray-500">Hari ini</div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          47
                        </div>
                        <div className="text-xs text-gray-600">Motor Masuk</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          32
                        </div>
                        <div className="text-xs text-gray-600">Selesai</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600">
                          15
                        </div>
                        <div className="text-xs text-gray-600">
                          Dalam Proses
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">
                          8.2M
                        </div>
                        <div className="text-xs text-gray-600">Pendapatan</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 bg-gradient-to-r from-blue-600 to-indigo-700">
          <div className="max-w-4xl mx-auto text-center px-6">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Siap Modernisasi Bengkel Anda?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Bergabung dengan ribuan bengkel yang sudah merasakan kemudahan
              BengkelPro
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/signup">
                <Button className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 rounded-full text-lg font-semibold shadow-xl">
                  Coba Gratis 30 Hari
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Button
                variant="outline"
                className="border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 rounded-full text-lg font-semibold"
              >
                Hubungi Sales
              </Button>
            </div>
            <div className="mt-6 text-blue-100 text-sm">
              ✓ Tanpa kontrak • ✓ Cancel kapan saja • ✓ Data aman terjamin
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <Wrench className="h-8 w-8 text-blue-400" />
                <span className="font-bold text-xl text-white">BengkelPro</span>
              </div>
              <p className="text-gray-400 mb-6 max-w-md">
                Platform manajemen bengkel motor terdepan yang membantu ribuan
                bengkel di Indonesia mengelola bisnis mereka dengan lebih
                efisien.
              </p>
              <div className="flex space-x-4">
                <Link
                  to="/"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                  </svg>
                </Link>
                <Link
                  to="/"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z" />
                  </svg>
                </Link>
                <Link
                  to="/"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                </Link>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Produk</h4>
              <ul className="space-y-3">
                <li>
                  <Link to="/" className="hover:text-white transition-colors">
                    Fitur
                  </Link>
                </li>
                <li>
                  <Link to="/" className="hover:text-white transition-colors">
                    Harga
                  </Link>
                </li>
                <li>
                  <Link to="/" className="hover:text-white transition-colors">
                    Demo
                  </Link>
                </li>
                <li>
                  <Link to="/" className="hover:text-white transition-colors">
                    Integrasi
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Dukungan</h4>
              <ul className="space-y-3">
                <li>
                  <Link to="/" className="hover:text-white transition-colors">
                    Bantuan
                  </Link>
                </li>
                <li>
                  <Link to="/" className="hover:text-white transition-colors">
                    Dokumentasi
                  </Link>
                </li>
                <li>
                  <Link to="/" className="hover:text-white transition-colors">
                    Kontak
                  </Link>
                </li>
                <li>
                  <Link to="/" className="hover:text-white transition-colors">
                    Status
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2025 BengkelPro. Semua hak dilindungi.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link
                to="/"
                className="text-gray-400 hover:text-white text-sm transition-colors"
              >
                Kebijakan Privasi
              </Link>
              <Link
                to="/"
                className="text-gray-400 hover:text-white text-sm transition-colors"
              >
                Syarat Layanan
              </Link>
              <Link
                to="/"
                className="text-gray-400 hover:text-white text-sm transition-colors"
              >
                Cookie
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
