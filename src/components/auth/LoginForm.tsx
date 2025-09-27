import { useState } from "react";
import { useAuth } from "../../../supabase/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate, Link } from "react-router-dom";
import AuthLayout from "./AuthLayout";
import { useToast } from "@/components/ui/use-toast";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      await signIn(email, password);
      toast({
        title: "Berhasil masuk",
        description: "Selamat datang kembali!",
      });
      navigate("/dashboard");
    } catch (error: any) {
      console.error("Login error:", error);
      setError(error.message || "Email atau password salah");
      toast({
        title: "Error",
        description: error.message || "Gagal masuk",
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
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Masuk ke BengkelPro</h1>
          <p className="text-gray-600">Kelola bengkel Anda dengan mudah</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium text-gray-700">
              Email
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
              Password
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="Masukkan password Anda"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="h-12 rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
            />
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
            {loading ? "Masuk..." : "Masuk"}
          </Button>
          
          <div className="text-sm text-center text-gray-600 mt-6">
            Belum punya akun?{" "}
            <Link to="/signup" className="text-blue-600 hover:underline font-medium">
              Daftar di sini
            </Link>
          </div>
          
          <div className="text-xs text-center text-gray-500 mt-4">
            <Link to="/" className="text-blue-600 hover:underline">
              Lupa password?
            </Link>
          </div>
        </form>
      </div>
    </AuthLayout>
  );
}