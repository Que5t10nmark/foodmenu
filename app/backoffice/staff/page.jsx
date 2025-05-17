"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Modal from "../components/Modal";

export default function Register() {
  const [account_name, setAccountName] = useState("");
  const [account_email, setAccountEmail] = useState("");
  const [account_password, setAccountPassword] = useState("");
  const [account_phone, setAccountPhone] = useState("");
  const [account_address, setAccountAddress] = useState("");
  const [account_role, setAccountRole] = useState("เจ้าของร้าน");
  const [successMessage, setSuccessMessage] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const router = useRouter();

  const fetchAccounts = async () => {
    try {
      const res = await fetch("/api/accounts");
      const data = await res.json();
      setAccounts(data);
    } catch (error) {
      console.error("Error fetching accounts:", error);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const clearForm = () => {
    setAccountName("");
    setAccountEmail("");
    setAccountPassword("");
    setAccountPhone("");
    setAccountAddress("");
    setAccountRole("เจ้าของร้าน");
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (
      !account_name ||
      !account_email ||
      !account_password ||
      !account_phone ||
      !account_address ||
      !account_role
    ) {
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
      clearForm();
      fetchAccounts();
      setTimeout(() => {
        setSuccessMessage(false);
        setIsModalOpen(false);
      }, 1000);
    } else {
      alert("เกิดข้อผิดพลาดในการลงทะเบียน");
    }
  };

  return (
    <div className="p-6 max-h-screen overflow-auto">
      <h1 className="text-3xl font-bold mb-6">ข้อมูลพนักงาน</h1>
      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4">
          <strong className="font-bold">สำเร็จ!</strong>
          <span className="block sm:inline"> เพิ่มบัญชีผู้ใช้งานเรียบร้อยแล้ว</span>
        </div>
      )}
     <div className="mb-6">
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-green-500 text-white px-4 py-2 rounded mb-6"
        >
          เพิ่มรายการ
        </button>

        <div className="overflow-x-auto max-h-[50vh] mb-8">
          <table className="min-w-full table-auto border-collapse border border-gray-300 text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 border">ชื่อ</th>
                <th className="px-4 py-2 border">อีเมล</th>
                <th className="px-4 py-2 border">เบอร์โทร</th>
                <th className="px-4 py-2 border">ที่อยู่</th>
                <th className="px-4 py-2 border">บทบาท</th>
              </tr>
            </thead>
            <tbody>
              {accounts.map((account, index) => (
                <tr
                  key={account.account_id || index}
                  className="hover:bg-gray-50"
                >
                  <td className="px-4 py-2 border">{account.account_name}</td>
                  <td className="px-4 py-2 border">{account.account_email}</td>
                  <td className="px-4 py-2 border">{account.account_phone}</td>
                  <td className="px-4 py-2 border">
                    {account.account_address}
                  </td>
                  <td className="px-4 py-2 border">{account.account_role}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Modal isOpen={isModalOpen} closeModal={() => setIsModalOpen(false)}>
          <form
            onSubmit={handleRegister}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            <div>
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

            <div>
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

            <div>
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

            <div>
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

            <div className="md:col-span-2">
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
            <div className="md:col-span-2">
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

            <div className="md:col-span-2 flex justify-between gap-4">
              <button
                type="submit"
                className="flex-1 py-3 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition"
              >
                เพิ่มบัญชีผู้ใช้งาน
              </button>
              <button
                type="button"
                onClick={clearForm}
                className="flex-1 py-3 bg-gray-400 text-white font-semibold rounded-lg hover:bg-gray-500 transition"
              >
                เคลียร์
              </button>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="flex-1 py-3 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition"
              >
                ยกเลิก
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  );
}
