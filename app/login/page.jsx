"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession, signIn } from "next-auth/react";

export default function LoginPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [account_email, setAccountEmail] = useState("");
  const [account_password, setAccountPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Handle redirect after session is authenticated
  useEffect(() => {
    if (status === "authenticated" && session?.user?.role) {
      console.log("Session role:", session.user.role);
      if (session.user.role === "เจ้าของร้าน") {
        console.log("Redirecting to /backoffice/dashboard");
        router.push("/backoffice/dashboard");
      } else if (session.user.role === "พนักงาน") {
        console.log("Redirecting to /kitchen/purchase");
        router.push("/kitchen/purchase");
      } else {
        console.error("Unknown role:", session.user.role);
        setError("บทบาทผู้ใช้ไม่ถูกต้อง");
      }
    }
  }, [session, status, router]);

  // Handle loading state
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-300 via-slate-500 to-slate-300 px-4 font-[Kanit]">
        <p className="text-white text-xl">กำลังโหลด...</p>
      </div>
    );
  }

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        account_email,
        account_password,
        redirect: false, // Prevent NextAuth from auto-redirecting
      });

      if (result?.error) {
        setError("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
        setIsLoading(false);
      } else {
        console.log("Login successful, waiting for session to update...");
        // Session will be handled by useEffect
      }
    } catch (error) {
      setError("เกิดข้อผิดพลาดในการล็อกอิน: " + error.message);
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-300 via-slate-500 to-slate-300 px-4 font-[Kanit]">
      {/* Login Card */}
      <div className="w-full max-w-3xl bg-white/30 backdrop-blur-xl border border-white/30 rounded-3xl shadow-2xl p-10">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-slate-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
            <span className="text-4xl">🔒</span>
          </div>
          <h1 className="text-4xl font-semibold text-white mb-2">เข้าสู่ระบบ</h1>
          <p className="text-xl text-white/80">กรอกข้อมูลเพื่อเข้าสู่ระบบบัญชีผู้ใช้</p>
        </div>

        <form onSubmit={handleLogin} className="grid grid-cols-1 md:grid-cols-2 gap-6 text-white">
          <div>
            <label className="block text-lg mb-1">อีเมล</label>
            <input
              type="email"
              value={account_email}
              onChange={(e) => setAccountEmail(e.target.value)}
              placeholder="กรอกอีเมลของคุณ"
              className="w-full px-4 py-3 rounded-xl bg-white border border-white text-black placeholder-black/70 focus:outline-none focus:ring-2 focus:ring-orange-400"
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-lg mb-1">รหัสผ่าน</label>
            <input
              type="password"
              value={account_password}
              onChange={(e) => setAccountPassword(e.target.value)}
              placeholder="รหัสผ่าน"
              className="w-full px-4 py-3 rounded-xl bg-white border border-white text-black placeholder-black/70 focus:outline-none focus:ring-2 focus:ring-orange-400"
              disabled={isLoading}
            />
          </div>

          {error && (
            <div className="md:col-span-2">
              <p className="text-red-500 text-center text-lg">{error}</p>
            </div>
          )}

          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 bg-white text-orange-500 text-2xl font-semibold rounded-xl shadow-md hover:-translate-y-1 hover:shadow-lg transition-all ${
                isLoading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {isLoading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
            </button>
          </div>
        </form>

        <p className="mt-8 text-center text-white/80 text-xl">
          ยังไม่มีบัญชีใช่ไหม?{" "}
          <a href="/register" className="text-white font-medium hover:underline">
            สมัครสมาชิก
          </a>
        </p>
      </div>
    </div>
  );
}