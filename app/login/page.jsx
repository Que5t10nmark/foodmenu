"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showDemoModal, setShowDemoModal] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (isLoading) return;

    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        router.push("/backoffice/product");
      } else {
        setError(data.message || "อีเมลหรือรหัสผ่านไม่ถูกต้อง");
        setIsLoading(false);
      }
    } catch {
      setError("เกิดข้อผิดพลาดในการเชื่อมต่อ");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-300 via-slate-500 to-slate-300 px-4 relative font-[Kanit]">
      
      {/* Login Card */}
      <div className="w-full max-w-md bg-white/30 backdrop-blur-xl border border-white/30 rounded-3xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-slate-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
            <span className="text-4xl">🔐</span>
          </div>
          <h1 className="text-4xl font-semibold text-white mb-2">เข้าสู่ระบบ</h1>
          <p className="text-xl text-white/80">กรุณาใส่ข้อมูลเพื่อเข้าสู่ระบบ</p>
        </div>

        {error && (
          <div className="bg-red-100 text-red-700 px-4 py-2 rounded mb-4 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-white text-2xl mb-1">อีเมล</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="example@email.com"
              className="text-xl w-full px-4 py-3 rounded-xl bg-white border border-white text-black placeholder-black/70 focus:outline-none focus:ring-2 focus:ring-orange-400 transition-all"
            />
          </div>

          <div>
            <label className="block text-white text-2xl mb-1">รหัสผ่าน</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="password"
              className="text-xl w-full px-4 py-3 rounded-xl bg-white border border-white text-black placeholder-black/70 focus:outline-none focus:ring-2 focus:ring-orange-400 transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="text-2xl w-full py-3 rounded-xl bg-white text-orange-500 font-semibold shadow-md hover:-translate-y-1 hover:shadow-lg transition-all disabled:opacity-60"
          >
            {isLoading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center my-6">
          <div className="flex-1 h-px bg-white/30" />
          <span className="px-4 text-white/60 text-sm">หรือ</span>
          <div className="flex-1 h-px bg-white/30" />
        </div>

        {/* Sign Up */}
        <p className="text-center mt-6 text-white/80 text-xl">
          ยังไม่มีบัญชี?{" "}
          <a
            href="/register"
            onClick={() => setShowDemoModal(true)}
            className="text-xl text-white hover:underline font-medium"
          >
            สมัครสมาชิก
          </a>
        </p>
      </div>
    </div>
  );
}
