"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession, signIn } from "next-auth/react";
import { Utensils, Mail, Lock, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [account_email, setAccountEmail] = useState("");
  const [account_password, setAccountPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600 text-2xl">กำลังโหลด...</p>
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
        redirect: false,
      });

      if (result?.error) {
        setError("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
        setIsLoading(false);
      } else {
        console.log("Login successful, waiting for session to update...");
      }
    } catch (error) {
      setError("เกิดข้อผิดพลาดในการล็อกอิน: " + error.message);
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-16 px-6 sm:px-8 lg:px-12 bg-gray-50">
      <div className="max-w-xl w-full space-y-12">
        <div className="text-center">
          <div className="flex justify-center mb-8">
            <div className="bg-orange-500 p-6 rounded-full">
              <Utensils className="w-16 h-16 text-white" />
            </div>
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-3">สเต็กนี่หว่า</h2>
          <p className="text-lg text-gray-600">เข้าสู่ระบบเพื่อจัดการร้านของคุณ</p>
        </div>

        <form onSubmit={handleLogin} className="mt-10 space-y-8 bg-white p-10 rounded-xl shadow-lg">
          <div className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-lg font-medium text-gray-700 mb-3">
                อีเมล
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="w-6 h-6 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={account_email}
                  onChange={(e) => setAccountEmail(e.target.value)}
                  required
                  className="pl-12 w-full px-4 py-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent placeholder-gray-400 text-lg"
                  placeholder="กรอกอีเมลของคุณ"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-lg font-medium text-gray-700 mb-3">
                รหัสผ่าน
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="w-6 h-6 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={account_password}
                  onChange={(e) => setAccountPassword(e.target.value)}
                  required
                  className="pl-12 pr-12 w-full px-4 py-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent placeholder-gray-400 text-lg"
                  placeholder="กรอกรหัสผ่านของคุณ"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="w-6 h-6 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="w-6 h-6 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {error && <p className="text-red-500 text-center text-base">{error}</p>}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full flex justify-center py-4 px-6 cursor-pointer border border-transparent rounded-lg shadow-md text-lg font-medium text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition duration-200 ${
                isLoading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              <span>{isLoading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}</span>
            </button>
          </div>

          <div className="text-center">
            <p className="text-lg text-gray-600">
              ยังไม่มีบัญชี?{" "}
              <a href="/register" className="font-medium text-orange-600 hover:text-orange-500">
                สมัครสมาชิก
              </a>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}