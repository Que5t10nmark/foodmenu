"use client";
import { useEffect, useState } from "react";
import Modal from "../components/Modal";
import { Trash2, Edit2, PlusCircle } from "lucide-react";

export default function Register() {
  const [account_name, setAccountName] = useState("");
  const [account_email, setAccountEmail] = useState("");
  const [account_password, setAccountPassword] = useState("");
  const [account_phone, setAccountPhone] = useState("");
  const [account_address, setAccountAddress] = useState("");
  const [account_role, setAccountRole] = useState("เจ้าของร้าน");
  const [message, setMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [account, setAccount] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentAccountId, setCurrentAccountId] = useState(null);

  const fetchAccount = async () => {
    try {
      const res = await fetch("/api/register");
      if (!res.ok) {
        throw new Error("Failed to fetch accounts");
      }
      const data = await res.json();
      setAccount(data);
    } catch (error) {
      console.error("Error fetching accounts:", error);
      setErrorMessage("เกิดข้อผิดพลาดในการดึงข้อมูลบัญชี");
      setTimeout(() => setErrorMessage(null), 3000);
    }
  };

  useEffect(() => {
    fetchAccount();
  }, []);

  const clearForm = () => {
    setAccountName("");
    setAccountEmail("");
    setAccountPassword("");
    setAccountPhone("");
    setAccountAddress("");
    setAccountRole("เจ้าของร้าน");
    setCurrentAccountId(null);
    setIsEditing(false);
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
      setErrorMessage("กรุณากรอกข้อมูลให้ครบทุกช่อง");
      setTimeout(() => setErrorMessage(null), 3000);
      return;
    }

    try {
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

      const data = await response.json();
      if (response.ok) {
        setMessage("เพิ่มบัญชีผู้ใช้งานเรียบร้อยแล้ว");
        clearForm();
        fetchAccount();
        setTimeout(() => {
          setMessage(null);
          setIsModalOpen(false);
        }, 2000);
      } else {
        setErrorMessage(data.message || "เกิดข้อผิดพลาดในการลงทะเบียน");
        setTimeout(() => setErrorMessage(null), 3000);
      }
    } catch (error) {
      console.error("Error registering account:", error);
      setErrorMessage("เกิดข้อผิดพลาดในการลงทะเบียน");
      setTimeout(() => setErrorMessage(null), 3000);
    }
  };

  const openModal = (account = null) => {
    if (account) {
      setAccountName(account.account_name);
      setAccountEmail(account.account_email);
      setAccountPassword(""); // ไม่โหลดรหัสผ่านเพื่อความปลอดภัย
      setAccountPhone(account.account_phone);
      setAccountAddress(account.account_address);
      setAccountRole(account.account_role);
      setCurrentAccountId(account.account_id);
      setIsEditing(true);
    } else {
      clearForm();
    }
    setIsModalOpen(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (
      !account_name ||
      !account_email ||
      !account_phone ||
      !account_address ||
      !account_role
    ) {
      setErrorMessage("กรุณากรอกข้อมูลให้ครบทุกช่อง");
      setTimeout(() => setErrorMessage(null), 3000);
      return;
    }

    try {
      const response = await fetch(`/api/account/${currentAccountId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          account_name,
          account_email,
          account_password: account_password || undefined, // ส่งรหัสผ่านเฉพาะเมื่อมีการกรอก
          account_phone,
          account_address,
          account_role,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setMessage("แก้ไขบัญชีผู้ใช้งานเรียบร้อยแล้ว");
        fetchAccount();
        setTimeout(() => {
          setMessage(null);
          setIsModalOpen(false);
          clearForm();
        }, 2000);
      } else {
        setErrorMessage(data.message || "เกิดข้อผิดพลาดในการแก้ไขบัญชี");
        setTimeout(() => setErrorMessage(null), 3000);
      }
    } catch (error) {
      console.error("Error updating account:", error);
      setErrorMessage("เกิดข้อผิดพลาดในการแก้ไขบัญชี");
      setTimeout(() => setErrorMessage(null), 3000);
    }
  };

  const deleteAccount = async (accountId) => {
    if (!confirm("คุณแน่ใจว่าต้องการลบรายการนี้?")) return;

    try {
      const response = await fetch(`/api/account/${accountId}`, {
        method: "DELETE",
      });

      const data = await response.json();
      if (response.ok) {
        setMessage("ลบบัญชีผู้ใช้งานเรียบร้อยแล้ว");
        fetchAccount();
        setTimeout(() => setMessage(null), 2000);
      } else {
        setErrorMessage(data.message || "เกิดข้อผิดพลาดในการลบบัญชี");
        setTimeout(() => setErrorMessage(null), 3000);
      }
    } catch (error) {
      console.error("Error deleting account:", error);
      setErrorMessage("เกิดข้อผิดพลาดในการลบบัญชี");
      setTimeout(() => setErrorMessage(null), 3000);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    clearForm();
  };

  return (
    // <div className="p-6 max-h-screen overflow-auto bg-gray-50 min-h-screen">
    <>
      <h1 className="text-4xl font-bold mb-6 text-orange-700">ข้อมูลพนักงาน</h1>
      {message && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4 text-center">
          <span className="block sm:inline">{message}</span>
        </div>
      )}
      {errorMessage && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4 text-center">
          <span className="block sm:inline">{errorMessage}</span>
        </div>
      )}
      <div className="mb-6">
        <button
          onClick={() => openModal()}
          className="text-3xl mt-3 sm:mt-0 inline-flex items-center gap-2 cursor-pointer bg-green-500 hover:bg-green-700 text-white px-5 py-2 rounded shadow transition"
        >
          <PlusCircle size={20} /> สร้างบัญชีใหม่
        </button>

        <div className="overflow-x-auto max-h-[70vh] shadow rounded border border-gray-200 bg-white mb-2">
          <h2 className="text-2xl font-bold mb-4 px-4 pt-4 text-orange-700">
            ข้อมูลพนักงาน
          </h2>
          <table className="min-w-full table-auto border-collapse">
            <thead className="bg-orange-100 text-orange-700 sticky top-0 z-10">
              <tr>
                <th className="px-4 py-3 border-b border-gray-300 text-3xl text-center">
                  ชื่อ
                </th>
                <th className="px-4 py-3 border-b border-gray-300 text-3xl text-center">
                  อีเมล
                </th>
                <th className="px-4 py-3 border-b border-gray-300 text-3xl text-center">
                  เบอร์โทร
                </th>
                <th className="px-4 py-3 border-b border-gray-300 text-3xl text-center">
                  ที่อยู่
                </th>
                <th className="px-4 py-3 border-b border-gray-300 text-3xl text-center">
                  บทบาท
                </th>
                <th className="px-4 py-3 border-b border-gray-300 text-3xl text-center">
                  จัดการ
                </th>
              </tr>
            </thead>
            <tbody>
              {account.map((account, index) => (
                <tr
                  key={account.account_id || index}
                  className="hover:bg-gray-50"
                >
                  <td className="text-3xl px-4 py-3 border-b border-gray-300 text-center">
                    {account.account_name}
                  </td>
                  <td className="text-3xl px-4 py-3 border-b border-gray-300 text-center">
                    {account.account_email}
                  </td>
                  <td className="text-3xl px-4 py-3 border-b border-gray-300 text-center">
                    {account.account_phone}
                  </td>
                  <td className="text-3xl px-4 py-3 border-b border-gray-300 text-center">
                    {account.account_address}
                  </td>
                  <td className="text-3xl px-4 py-3 border-b border-gray-300 text-center">
                    {account.account_role}
                  </td>
                  <td className="text-3xl px-4 py-3 border-b border-gray-300 text-center">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => openModal(account)}
                        aria-label="แก้ไข"
                        className="text-2xl p-2 cursor-pointer bg-yellow-400 hover:bg-yellow-500 text-white rounded shadow transition flex items-center gap-1"
                        title="แก้ไข"
                      >
                        <Edit2 size={18} /> แก้ไข
                      </button>
                      <button
                        onClick={() => deleteAccount(account.account_id)}
                        aria-label="ลบ"
                        className="text-2xl p-2 cursor-pointer bg-red-500 hover:bg-red-600 text-white rounded shadow transition flex items-center gap-1"
                        title="ลบ"
                      >
                        <Trash2 size={18} /> ลบ
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Modal isOpen={isModalOpen} closeModal={closeModal}>
          <h2 className="text-xl font-semibold mb-4">
            {isEditing ? "แก้ไขบัญชีพนักงาน" : "เพิ่มบัญชีพนักงานใหม่"}
          </h2>
          <form
            onSubmit={isEditing ? handleUpdate : handleRegister}
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
                placeholder={
                  isEditing
                    ? "กรอกรหัสผ่านใหม่ (ถ้าต้องการเปลี่ยน)"
                    : "กรอกรหัสผ่าน"
                }
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
                <option value="พนักงาน">พนักงาน</option>
              </select>
            </div>

            <div className="mt-6 flex gap-4 justify-left">
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-md"
              >
                {isEditing ? "บันทึกการแก้ไข" : "บันทึก"}
              </button>
              <button
                type="button"
                onClick={clearForm}
                className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors duration-200 shadow-md"
              >
                เคลียร์
              </button>
              <button
                type="button"
                onClick={closeModal}
                className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200 shadow-md"
              >
                ยกเลิก
              </button>
            </div>
          </form>
        </Modal>
      </div>
      {/* </div> */}
    </>
  );
}
