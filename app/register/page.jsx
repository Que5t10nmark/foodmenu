"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Utensils, Check } from "lucide-react";

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
        setAccountName("");
        setAccountEmail("");
        setAccountPassword("");
        setAccountPhone("");
        setAccountAddress("");
        setAccountRole("เจ้าของร้าน");
        setTimeout(() => {
          setSuccessMessage(false);
          router.push("/login");
          router.refresh();
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
    <div className="min-h-screen flex items-center justify-center py-16 px-6 sm:px-8 lg:px-12 bg-gray-50">
      {successMessage && (
        <div className="fixed inset-0 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
          <div className="relative top-20 mx-auto p-6 border w-[28rem] shadow-lg rounded-md bg-white">
            <div className="mt-4 text-center">
              <div className="mx-auto flex items-center justify-center h-14 w-14 rounded-full bg-green-100 mb-5">
                <Check className="w-7 h-7 text-green-600" />
              </div>
              <h3 className="text-xl font-medium text-gray-900">ลงทะเบียนเรียบร้อย!</h3>
              <div className="mt-3 px-8 py-4">
                <p className="text-base text-gray-500">บัญชีของคุณได้ถูกสร้างเรียบร้อยแล้ว</p>
              </div>
              <div className="items-center px-5 py-4">
                <button
                  onClick={() => {
                    setSuccessMessage(false);
                    router.push("/login");
                  }}
                  className="px-5 py-3 bg-orange-500 text-white text-lg font-medium rounded-md w-full shadow-sm hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-300"
                >
                  ตกลง
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {!successMessage && (
        <div className="max-w-xl w-full space-y-10">
          <div className="text-center">
            <div className="flex justify-center mb-2">
              <div className="bg-orange-500 p-4 rounded-full">
                <Utensils className="w-16 h-16 text-white" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">สมัครบัญชี</h2>
            <p className="text-lg text-gray-600">สร้างบัญชีใหม่สำหรับ สเต็กนี่หว่า</p>
          </div>

          <form onSubmit={handleRegister} className="mt-2 space-y-4 bg-white p-10 rounded-xl shadow-lg">
            <div className="space-y-4">
              <div>
                <label htmlFor="account_name" className="block text-lg font-medium text-gray-700 mb-2">
                  ชื่อบัญชี
                </label>
                <input
                  id="account_name"
                  name="account_name"
                  type="text"
                  value={account_name}
                  onChange={(e) => setAccountName(e.target.value)}
                  required
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent placeholder-gray-400 text-lg"
                  placeholder="กรอกชื่อบัญชี"
                  disabled={isLoading}
                />
              </div>

              <div>
                <label htmlFor="account_email" className="block text-lg font-medium text-gray-700 mb-2">
                  อีเมล
                </label>
                <input
                  id="account_email"
                  name="account_email"
                  type="email"
                  value={account_email}
                  onChange={(e) => setAccountEmail(e.target.value)}
                  required
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent placeholder-gray-400 text-lg"
                  placeholder="กรอกอีเมล"
                  disabled={isLoading}
                />
              </div>

              <div>
                <label htmlFor="account_password" className="block text-lg font-medium text-gray-700 mb-2">
                  รหัสผ่าน
                </label>
                <input
                  id="account_password"
                  name="account_password"
                  type="password"
                  value={account_password}
                  onChange={(e) => setAccountPassword(e.target.value)}
                  required
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent placeholder-gray-400 text-lg"
                  placeholder="กรอกรหัสผ่าน"
                  disabled={isLoading}
                />
              </div>

              <div>
                <label htmlFor="account_phone" className="block text-lg font-medium text-gray-700 mb-2">
                  เบอร์โทรศัพท์
                </label>
                <input
                  id="account_phone"
                  name="account_phone"
                  type="tel"
                  value={account_phone}
                  onChange={(e) => setAccountPhone(e.target.value)}
                  required
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent placeholder-gray-400 text-lg"
                  placeholder="กรอกเบอร์โทรศัพท์"
                  disabled={isLoading}
                />
              </div>
              
              <div>
                <label htmlFor="account_address" className="block text-lg font-medium text-gray-700 mb-2">
                  ที่อยู่
                </label>
                <textarea
                  id="account_address"
                  name="account_address"
                  type="text"
                  value={account_address}
                  onChange={(e) => setAccountAddress(e.target.value)}
                  required
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent placeholder-gray-400 text-lg"
                  placeholder="กรอกที่อยู่"
                  disabled={isLoading}
                />
              </div>

              <div>
                <label htmlFor="account_role" className="block text-lg font-medium text-gray-700 mb-2">
                  บทบาท
                </label>
                <select
                  id="account_role"
                  name="account_role"
                  value={account_role}
                  onChange={(e) => setAccountRole(e.target.value)}
                  required
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent placeholder-gray-400 text-lg"
                  disabled={isLoading}
                >
                  <option value="เจ้าของร้าน">เจ้าของร้าน</option>
                  <option value="พนักงาน">พนักงาน</option>
                </select>
              </div>
            </div>

            {errorMessage && <p className="text-red-500 text-center text-lg">{errorMessage}</p>}

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full flex justify-center py-4 px-6 cursor-pointer border border-transparent rounded-lg shadow-md text-lg font-medium text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition duration-200 ${
                  isLoading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                <span>{isLoading ? "กำลังลงทะเบียน..." : "สมัครสมาชิก"}</span>
              </button>
            </div>

            <div className="text-center">
              <p className="text-lg text-gray-600">
                มีบัญชีแล้ว?{" "}
                <a href="/login" className="font-medium text-orange-600 hover:text-orange-500">
                  เข้าสู่ระบบ
                </a>
              </p>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}