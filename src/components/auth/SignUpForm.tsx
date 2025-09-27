import { useState } from "react";
import { useAuth } from "../../../supabase/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate, Link } from "react-router-dom";
import AuthLayout from "./AuthLayout";
import { useToast } from "@/components/ui/use-toast";

export default function SignUpForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [workshopName, setWorkshopName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password.length < 6) {
      setError("Password harus minimal 6 karakter");
      return;
    }

    setLoading(true);
    setError("");
    
    try {
      await signUp(email, password, fullName, workshopName || undefined);
      toast({
        title: "Akun berhasil dibuat",
        description: "Silakan periksa email Anda untuk verifikasi akun.",
        duration: 5000,
      });
      navigate("/login");
    } catch (error: any) {
      console.error("Signup error:", error);
      setError(error.message || "Gagal membuat akun. Silakan coba lagi.");
      toast({
        title: "Error",
        description: error.message || "Gagal membuat akun",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="bg-white rounded-2xl shadow-sm p-8 w-full max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Daftar BengkelPro</h1>
          <p className="text-gray-600">Mulai kelola bengkel Anda dengan mudah</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="fullName" className="text-sm font-medium text-gray-700">
              Nama Lengkap *
            </Label>
            <Input
              id="fullName"
              placeholder="Masukkan nama lengkap Anda"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="h-12 rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="workshopName" className="text-sm font-medium text-gray-700">
              Nama Bengkel
            </Label>
            <Input
              id="workshopName"
              placeholder="Opsional - akan diisi otomatis jika kosong"
              value={workshopName}
              onChange={(e) => setWorkshopName(e.target.value)}
              className="h-12 rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium text-gray-700">
              Email *
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="nama@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-12 rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium text-gray-700">
              Password *
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="Minimal 6 karakter"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="h-12 rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">Password harus minimal 6 karakter</p>
          </div>
          
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
          
          <Button 
            type="submit" 
            disabled={loading}
            className="w-full h-12 rounded-full bg-blue-600 text-white hover:bg-blue-700 text-sm font-medium disabled:opacity-50"
          >
            {loading ? "Membuat akun..." : "Daftar Sekarang"}
          </Button>
          
          <div className="text-xs text-center text-gray-500 mt-6">
            Dengan mendaftar, Anda menyetujui{" "}
            <Link to="/" className="text-blue-600 hover:underline">
              Syarat Layanan
            </Link>{" "}
            dan{" "}
            <Link to="/" className="text-blue-600 hover:underline">
              Kebijakan Privasi
            </Link>{" "}
            kami
          </div>
          
          <div className="text-sm text-center text-gray-600 mt-6">
            Sudah punya akun?{" "}
            <Link to="/login" className="text-blue-600 hover:underline font-medium">
              Masuk di sini
            </Link>
          </div>
        </form>
      </div>
    </AuthLayout>
  );
}