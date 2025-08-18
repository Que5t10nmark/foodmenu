"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Register() {
  const [account_name, setAccountName] = useState("");
  const [account_email, setAccountEmail] = useState("");
  const [account_password, setAccountPassword] = useState("");
  const [account_phone, setAccountPhone] = useState("");
  const [account_address, setAccountAddress] = useState("");
  const [account_role, setAccountRole] = useState("เจ้าของร้าน");
  const [successMessage, setSuccessMessage] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();

  const isFormValid =
    account_name &&
    account_email &&
    account_password &&
    account_phone &&
    account_address &&
    account_role;

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setIsLoading(true);

    if (!isFormValid) {
      setErrorMessage("กรุณากรอกข้อมูลให้ครบทุกช่อง");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          account_name,
          account_email,
          account_password,
          account_phone,
          account_address,
          account_role,
        }),
      });

      if (response.ok) {
        setSuccessMessage(true);
        // รีเซ็ตฟอร์ม
        setAccountName("");
        setAccountEmail("");
        setAccountPassword("");
        setAccountPhone("");
        setAccountAddress("");
        setAccountRole("เจ้าของร้าน");
        // รอ 2 วินาทีแล้ว redirect
        setTimeout(() => {
          setSuccessMessage(false);
          router.push("/login");
          router.refresh(); // รีเฟรชเพื่อให้แน่ใจว่า redirect สำเร็จ
        }, 1000);
      } else {
        const errorData = await response.json();
        setErrorMessage(errorData.message || "เกิดข้อผิดพลาดในการลงทะเบียน");
      }
    } catch (error) {
      setErrorMessage("เกิดข้อผิดพลาดในการลงทะเบียน: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-300 via-slate-500 to-slate-300 px-4 font-[Kanit]">
      {/* Success Overlay */}
      {successMessage && (
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-8 text-center max-w-md">
            <h2 className="text-2xl font-semibold text-green-600 mb-3">
              ✅ ลงทะเบียนสำเร็จ!
            </h2>
            <p className="text-gray-700 text-lg">ระบบกำลังพาคุณไปยังหน้าล็อกอิน...</p>
          </div>
        </div>
      )}

      {/* Register Card */}
      {!successMessage && (
        <div className="w-full max-w-3xl bg-white/30 backdrop-blur-xl border border-white/30 rounded-3xl shadow-2xl p-10">
          <div className="text-center mb-10">
            <div className="w-16 h-16 bg-slate-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
              <span className="text-4xl">📝</span>
            </div>
            <h1 className="text-4xl font-semibold text-white mb-2">สมัครสมาชิก</h1>
            <p className="text-xl text-white/80">กรอกข้อมูลเพื่อสร้างบัญชีผู้ใช้</p>
          </div>

          {errorMessage && (
            <div className="text-center mb-6">
              <p className="text-red-500 text-lg">{errorMessage}</p>
            </div>
          )}

          <form onSubmit={handleRegister} className="grid grid-cols-1 md:grid-cols-2 gap-6 text-white">
            <div>
              <label className="block text-lg mb-1">ชื่อจริง</label>
              <input
                type="text"
                value={account_name}
                onChange={(e) => setAccountName(e.target.value)}
                placeholder="กรอกชื่อจริง"
                className="w-full px-4 py-3 rounded-xl bg-white border border-white text-black placeholder-black/70 focus:outline-none focus:ring-2 focus:ring-orange-400"
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-lg mb-1">อีเมล</label>
              <input
                type="email"
                value={account_email}
                onChange={(e) => setAccountEmail(e.target.value)}
                placeholder="example@email.com"
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
                placeholder="password"
                className="w-full px-4 py-3 rounded-xl bg-white border border-white text-black placeholder-black/70 focus:outline-none focus:ring-2 focus:ring-orange-400"
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-lg mb-1">เบอร์โทรศัพท์</label>
              <input
                type="text"
                value={account_phone}
                onChange={(e) => setAccountPhone(e.target.value)}
                placeholder="กรอกเบอร์โทรศัพท์"
                className="w-full px-4 py-3 rounded-xl bg-white border border-white text-black placeholder-black/70 focus:outline-none focus:ring-2 focus:ring-orange-400"
                disabled={isLoading}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-lg mb-1">ที่อยู่</label>
              <input
                type="text"
                value={account_address}
                onChange={(e) => setAccountAddress(e.target.value)}
                placeholder="กรอกที่อยู่"
                className="w-full px-4 py-3 rounded-xl bg-white border border-white text-black placeholder-black/70 focus:outline-none focus:ring-2 focus:ring-orange-400"
                disabled={isLoading}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-lg mb-1">บทบาท</label>
              <select
                value={account_role}
                onChange={(e) => setAccountRole(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white border border-white text-black placeholder-black/70 focus:outline-none focus:ring-2 focus:ring-orange-400"
                disabled={isLoading}
              >
                <option value="เจ้าของร้าน">เจ้าของร้าน</option>
                <option value="พนักงาน">พนักงาน</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <button
                type="submit"
                disabled={isLoading}
                className={` cursor-pointer w-full py-3 bg-white text-orange-500 text-2xl font-semibold rounded-xl shadow-md hover:-translate-y-1 hover:shadow-lg transition-all ${
                  isLoading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {isLoading ? "กำลังลงทะเบียน..." : "สมัครสมาชิก"}
              </button>
            </div>
          </form>

          <p className="mt-8 text-center text-white/80 text-xl">
            มีบัญชีแล้วใช่ไหม?{" "}
            <a href="/login" className="text-white font-medium hover:underline">
              เข้าสู่ระบบ
            </a>
          </p>
        </div>
      )}
    </div>
  );
}