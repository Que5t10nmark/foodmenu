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
    if (!isFormValid) {
      alert("กรุณากรอกข้อมูลให้ครบทุกช่อง");
      return;
    }

    const response = await fetch("/api/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
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
      setTimeout(() => {
        setSuccessMessage(false);
        router.push("/login");
      }, 2000);
    } else {
      alert("เกิดข้อผิดพลาดในการลงทะเบียน");
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 px-4">
      {successMessage && (
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 text-center max-w-sm">
            <h2 className="text-xl font-semibold text-green-600 mb-2">
              ✅ ลงทะเบียนสำเร็จ
            </h2>
            <p className="text-gray-700">ระบบกำลังพาคุณไปยังหน้าล็อกอิน...</p>
          </div>
        </div>
      )}

      <div className="w-full max-w-xl bg-white p-8 rounded-2xl shadow-md">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
          สร้างบัญชีผู้ใช้งาน
        </h1>

        <form
          onSubmit={handleRegister}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <div className="col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ชื่อจริง
            </label>
            <input
              type="text"
              value={account_name}
              onChange={(e) => setAccountName(e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="กรอกชื่อจริง"
            />
          </div>

          <div className="col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              อีเมล
            </label>
            <input
              type="email"
              value={account_email}
              onChange={(e) => setAccountEmail(e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="example@email.com"
            />
          </div>

          <div className="col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              รหัสผ่าน
            </label>
            <input
              type="password"
              value={account_password}
              onChange={(e) => setAccountPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="กรอกรหัสผ่าน"
            />
          </div>

          <div className="col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              เบอร์โทรศัพท์
            </label>
            <input
              type="tel"
              value={account_phone}
              onChange={(e) => setAccountPhone(e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="กรอกเบอร์โทรศัพท์"
            />
          </div>

          <div className="col-span-1 md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ที่อยู่
            </label>
            <input
              type="text"
              value={account_address}
              onChange={(e) => setAccountAddress(e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="กรอกที่อยู่"
            />
          </div>

          <div className="col-span-1 md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              บทบาท
            </label>
            <select
              value={account_role}
              onChange={(e) => setAccountRole(e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="เจ้าของร้าน">เจ้าของร้าน</option>
              <option value="ห้องครัว">ห้องครัว</option>
            </select>
          </div>

          <div className="col-span-1 md:col-span-2">
            <button
              type="submit"
              className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
            >
              สมัครสมาชิก
            </button>
          </div>
        </form>

        <p className="mt-6 text-sm text-center text-gray-600">
          มีบัญชีแล้วใช่ไหม?{" "}
          <a
            href="/login"
            className="text-blue-600 font-medium hover:underline"
          >
            เข้าสู่ระบบ
          </a>
        </p>
      </div>
    </div>
  );
}
