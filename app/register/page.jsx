"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Register() {
  const [account_name, setAccountName] = useState("");
  const [account_username, setAccountUsername] = useState("");
  const [account_password, setAccountPassword] = useState("");
  const [account_phone, setAccountPhone] = useState("");
  const [account_address, setAccountAddress] = useState("");
  const [account_role, setAccountRole] = useState("เจ้าของร้าน");
  const [successMessage, setSuccessMessage] = useState(false);

  const router = useRouter();

  const isFormValid =
    account_name &&
    account_username &&
    account_password &&
    account_phone &&
    account_address &&
    account_role;

  const handleRegister = async () => {
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
        account_username,
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
    <div className="relative">
      {successMessage && (
        <div className="absolute inset-0 flex items-center justify-center z-50">
          <div className="bg-green-500 text-white px-6 py-3 rounded shadow-lg text-lg">
            ✅ ลงทะเบียนสำเร็จ!
          </div>
        </div>
      )}

      <div className="max-w-md mx-auto p-6 bg-white rounded-xl shadow-md mt-12">
        <h1 className="text-2xl font-bold mb-6 text-center">ลงทะเบียน</h1>
        <form onSubmit={(e) => e.preventDefault()}>
          <div className="mb-4">
            <label className="block text-sm font-semibold">ชื่อจริง</label>
            <input
              type="text"
              value={account_name}
              onChange={(e) => setAccountName(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="กรอกชื่อจริง"
            />
          </div>
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
          <div className="mb-4">
            <label className="block text-sm font-semibold">เบอร์โทรศัพท์</label>
            <input
              type="text"
              value={account_phone}
              onChange={(e) => setAccountPhone(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="กรอกเบอร์โทรศัพท์"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-semibold">ที่อยู่</label>
            <input
              type="text"
              value={account_address}
              onChange={(e) => setAccountAddress(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="กรอกที่อยู่"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-semibold">บทบาท</label>
            <select
              value={account_role}
              onChange={(e) => setAccountRole(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="เจ้าของร้าน">เจ้าของร้าน</option>
              <option value="ห้องครัว">ห้องครัว</option>
            </select>
          </div>
          <button
            type="submit"
            onClick={handleRegister}
            disabled={!isFormValid}
            className={`w-full py-2 rounded text-white ${
              isFormValid
                ? "bg-blue-500 hover:bg-blue-600"
                : "bg-gray-400 cursor-not-allowed"
            }`}
          >
            ลงทะเบียน
          </button>
        </form>
        <div className="mt-4 text-center">
          <p>
            มีบัญชีแล้ว?{" "}
            <a href="/login" className="text-blue-500">
              เข้าสู่ระบบ
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
