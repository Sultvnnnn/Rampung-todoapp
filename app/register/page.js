"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, AlertCircle, CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function RegisterPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    //! -- Validasi Password & Konfirmasi
    if (form.password !== form.confirmPassword) {
      setError("Password dan Konfirmasi Password tidak sama!");
      setIsLoading(false);
      return;
    }

    //! -- Validasi Panjang Password
    if (form.password.length < 6) {
      setError("Password minimal 6 karakter!");
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Gagal mendaftar");
      }

      setSuccess("Pendaftaran berhasil! Mengalihkan ke halaman login.");

      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 transition-colors duration-300 dark:bg-slate-950">
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-md border border-gray-200 transition-colors duration-300 dark:bg-slate-900 dark:border-slate-800">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6 dark:text-white">
          Daftar Akun Baru
        </h2>

        {/* --- ALERT ERROR --- */}
        {error && (
          <Alert
            variant="destructive"
            className="mb-4 bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-900"
          >
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* --- ALERT SUCCESS --- */}
        {success && (
          <Alert className="mb-4 bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-900 dark:text-green-300">
            <CheckCircle2 className="h-4 w-4 color-green-600" />
            <AlertTitle>Sukses</AlertTitle>
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* NAMA */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-slate-300">
              Username
            </label>
            <input
              type="text"
              required
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white text-gray-900 border-gray-300 dark:bg-slate-950 dark:text-white dark:border-slate-700 dark:focus:ring-blue-600"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>

          {/* EMAIL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-slate-300">
              Email
            </label>
            <input
              type="email"
              required
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white text-gray-900 border-gray-300 dark:bg-slate-950 dark:text-white dark:border-slate-700 dark:focus:ring-blue-600"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>

          {/* PASSWORD */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-slate-300">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none pr-10 bg-white text-gray-900 border-gray-300 dark:bg-slate-950 dark:text-white dark:border-slate-700 dark:focus:ring-blue-600"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 cursor-pointer"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* KONFIRMASI PASSWORD */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-slate-300">
              Konfirmasi Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                required
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none pr-10 bg-white text-gray-900 border-gray-300 dark:bg-slate-950 dark:text-white dark:border-slate-700 dark:focus:ring-blue-600"
                value={form.confirmPassword}
                onChange={(e) =>
                  setForm({ ...form, confirmPassword: e.target.value })
                }
              />

              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 cursor-pointer"
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full text-black py-2 rounded-lg transition font-medium cursor-pointer ${
              isLoading
                ? "bg-gray-400 cursor-not-allowed"
                : "border-black border bg-white hover:bg-black dark:hover:bg-slate-700 hover:text-white dark:hover:text-white"
            }`}
          >
            {isLoading ? "Memproses..." : "Daftar Sekarang"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600 dark:text-slate-400">
          Sudah punya akun?{" "}
          <Link
            href="/login"
            className="text-blue-600 hover:underline font-medium dark:text-blue-400"
          >
            Login di sini
          </Link>
        </p>
      </div>
    </div>
  );
}
