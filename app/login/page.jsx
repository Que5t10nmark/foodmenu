"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Login() {
  const [account_username, setAccountUsername] = useState("");
  const [account_password, setAccountPassword] = useState("");
  const router = useRouter();

  const handleLogin = () => {
    if (account_username && account_password) {
      router.push("/backoffice/product"); 
      alert("กรุณากรอกข้อมูลให้ครบถ้วน");
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-xl shadow-md mt-12">
      <h1 className="text-2xl font-bold mb-6 text-center">เข้าสู่ระบบ</h1>
      <form onSubmit={(e) => e.preventDefault()}>
        <div className="mb-4">
          <label className="block text-sm font-semibold">ชื่อผู้ใช้</label>
          <input
            type="text"
            value={account_username}
            onChange={(e) => setAccountUsername(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="กรอกชื่อผู้ใช้"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-semibold">รหัสผ่าน</label>
          <input
            type="password"
            value={account_password}
            onChange={(e) => setAccountPassword(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="กรอกรหัสผ่าน"
          />
        </div>
        <button
          type="submit"
          onClick={handleLogin}
          className="w-full bg-blue-500 text-white py-2 rounded"
        >
          เข้าสู่ระบบ
        </button>
      </form>
      <div className="mt-4 text-center">
        <p>
          ยังไม่มีบัญชี?{" "}
          <a href="/register" className="text-blue-500">
            ลงทะเบียน
          </a>
        </p>
      </div>
    </div>
  );
}
