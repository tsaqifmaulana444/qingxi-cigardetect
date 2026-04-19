"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm]     = useState({ username: "", password: "" });
  const [error, setError]   = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    // Replace this with a real API call: POST /api/auth/login
    await new Promise((r) => setTimeout(r, 700));

    if (form.username === "admin" && form.password === "rotech123") {
      router.push("/dashboard");
    } else {
      setError("Username atau password salah.");
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-green-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-green-700 rounded-2xl mb-4">
            <span className="text-white text-2xl">◎</span>
          </div>
          <h1 className="text-2xl font-semibold text-green-900">ROTECH</h1>
          <p className="text-sm text-green-600 mt-1">Smoke Breath Analyzer — Masuk untuk melanjutkan</p>
        </div>

        {/* Card */}
        <div className="bg-white border border-green-100 rounded-xl p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-green-800 mb-1.5">Username</label>
              <input
                type="text"
                name="username"
                value={form.username}
                onChange={handleChange}
                placeholder="Masukkan username"
                autoComplete="username"
                required
                className="w-full px-3 py-2.5 text-sm border border-green-200 rounded-lg bg-white text-gray-800 placeholder-green-300 focus:outline-none focus:ring-2 focus:ring-green-400"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-green-800 mb-1.5">Password</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Masukkan password"
                autoComplete="current-password"
                required
                className="w-full px-3 py-2.5 text-sm border border-green-200 rounded-lg bg-white text-gray-800 placeholder-green-300 focus:outline-none focus:ring-2 focus:ring-green-400"
              />
            </div>

            {error && (
              <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2.5 text-sm font-medium rounded-lg transition-colors ${
                loading
                  ? "bg-green-300 text-white cursor-not-allowed"
                  : "bg-green-700 text-white hover:bg-green-800"
              }`}
            >
              {loading ? "Memverifikasi..." : "Masuk"}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-green-400 mt-6">
          Universitas Bengkulu · Instrumentasi Medis 2026
        </p>
      </div>
    </div>
  );
}