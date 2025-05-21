"use client";
import { useEffect, useState } from "react";

export default function ProductOptionPage() {
  const [types, setTypes] = useState([]);
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(true); // เพิ่ม loading state
  const [productType, setProductType] = useState([]);
  const [selectedType, setSelectedType] = useState("ทั้งหมด");
  const [form, setForm] = useState({
    option_id: null,
    product_type_id: "",
    option_type: "",
    option_value: "",
    option_price: 0,
  });

  const [notification, setNotification] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const resTypes = await fetch("/api/product_type");
      if (!resTypes.ok) throw new Error("Failed to fetch product types");
      const dataTypes = await resTypes.json();

      const resOptions = await fetch("/api/product_option");
      if (!resOptions.ok) throw new Error("Failed to fetch product options");
      const dataOptions = await resOptions.json();

      setTypes(dataTypes);
      setOptions(dataOptions);
    } catch {
      setTypes([]);
      setOptions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const method = form.option_id ? "PUT" : "POST";
    const url = form.option_id
      ? `/api/product_option/${form.option_id}`
      : "/api/product_option";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_type_id: form.product_type_id,
          option_type: form.option_type,
          option_value: form.option_value,
          option_price: form.option_price,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "เกิดข้อผิดพลาด");
      }

      showNotification(
        "success",
        form.option_id ? "แก้ไขตัวเลือกสำเร็จ" : "เพิ่มตัวเลือกสำเร็จ"
      );

      setForm({
        option_id: null,
        product_type_id: "",
        option_type: "",
        option_value: "",
        option_price: 0,
      });

      fetchData();
    } catch (error) {
      showNotification("error", error.message);
    }
  };

  const handleEdit = (opt) => {
    setForm({
      option_id: opt.option_id,
      product_type_id: opt.product_type_id,
      option_type: opt.option_type,
      option_value: opt.option_value,
      option_price: opt.option_price,
    });
  };

  const handleDelete = async (option_id) => {
    if (!confirm("ต้องการลบตัวเลือกนี้หรือไม่?")) return;
    try {
      const res = await fetch(`/api/product_option/${option_id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "เกิดข้อผิดพลาดในการลบ");
      }
      showNotification("success", "ลบตัวเลือกสำเร็จ");
      fetchData();
    } catch (error) {
      showNotification("error", error.message);
    }
  };

  if (loading) {
    return <div className="p-6 max-w-4xl mx-auto">กำลังโหลดข้อมูล...</div>;
  }

  return (
    <div className="p-6 max-h-screen overflow-auto">
      <h1 className="text-2xl font-bold mb-4">
        ⚙️ จัดการตัวเลือกสินค้าตามประเภท
      </h1>

      {/* กล่องแจ้งเตือน */}
      {notification && (
        <div
          className={`mb-4 p-3 rounded ${
            notification.type === "success"
              ? "bg-green-200 text-green-800"
              : "bg-red-200 text-red-800"
          }`}
        >
          {notification.message}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-white p-4 rounded shadow mb-6"
      >
        <div className="grid grid-cols-2 gap-4">
          <select
            value={form.product_type_id}
            onChange={(e) =>
              setForm({ ...form, product_type_id: e.target.value })
            }
            className="border rounded px-3 py-2"
            required
          >
            <option value="">เลือกประเภทสินค้า</option>
            {types.map((type) => (
              <option key={type.product_type_id} value={type.product_type_id}>
                {type.product_type_name}
              </option>
            ))}
          </select>

          <input
            type="text"
            list="optionTypeList"
            value={form.option_type}
            onChange={(e) => setForm({ ...form, option_type: e.target.value })}
            className="border rounded px-3 py-2"
            placeholder="พิมพ์หรือเลือกประเภทตัวเลือก"
            required
          />
          <datalist id="optionTypeList">
            <option value="ขนาด" />
            <option value="ความเผ็ด" />
            <option value="ท็อปปิ้ง" />
          </datalist>

          <input
            type="text"
            placeholder="ค่า เช่น เผ็ดมาก,เผ็ดน้อย,ไม่เผ็ด, ธรรมดา และพิเศษ"
            value={form.option_value}
            onChange={(e) => setForm({ ...form, option_value: e.target.value })}
            className="border rounded px-3 py-2"
            required
          />

          <input
            type="number"
            min="0"
            placeholder="ราคาเพิ่ม"
            value={form.option_price}
            onChange={(e) =>
              setForm({
                ...form,
                option_price: parseFloat(e.target.value) || 0,
              })
            }
            className="border rounded px-3 py-2"
            required
          />
        </div>

        <button
          type="submit"
          className="mt-4 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-300"
        >
          {form.option_id ? "💾 แก้ไขตัวเลือก" : "➕ เพิ่มตัวเลือก"}
        </button>
        {form.option_id && (
          <button
            type="button"
            className="mt-4 ml-2 bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
            onClick={() =>
              setForm({
                option_id: null,
                product_type_id: "",
                option_type: "",
                option_value: "",
                option_price: 0,
              })
            }
          >
            ยกเลิก
          </button>
        )}
      </form>

      <h2 className="text-xl font-bold mb-4">รายการตัวเลือก</h2>
      <div className="overflow-x-auto">
        <div className="flex flex-wrap gap-2 mb-4">
        <button
          className={`px-4 py-2 rounded-full border text-sm ${
            selectedType === "ทั้งหมด"
              ? "bg-green-500 text-white"
              : "bg-white text-gray-700"
          }`}
          onClick={() => setSelectedType("ทั้งหมด")}
        >
          ทั้งหมด
        </button>
        {productType.map((type) => (
          <button
            key={type.product_type_id}
            className={`px-4 py-2 rounded-full border text-sm ${
              selectedType === type.product_type_id
                ? "bg-green-500 text-white"
                : "bg-white text-gray-700"
            }`}
            onClick={() => setSelectedType(type.product_type_id)}
          >
            {type.product_type_name}
          </button>
        ))}
      </div>
      <table className="min-w-full text-sm text-left">
        <thead className="bg-gray-200">
          <tr>
            <th className="p-2 text-center ">ประเภทอาหาร</th>
            <th className="p-2 text-center">ประเภทตัวเลือก</th>
            <th className="p-2 text-center ">ค่า</th>
            <th className="p-2 text-center ">ราคาเพิ่ม</th>
            <th className="p-2 text-center">จัดการ</th>
          </tr>
        </thead>
        <tbody>
          {options.map((opt) => (
            <tr key={opt.option_id} className="border-t">
              <td className="p-2 text-center ">
                {types.find((t) => t.product_type_id === opt.product_type_id)
                  ?.product_type_name || "-"}
              </td>
              <td className="p-2 text-center ">{opt.option_type}</td>
              <td className="p-2 text-center">{opt.option_value}</td>
              <td className="p-2 text-center">฿{opt.option_price}</td>
              <td className="p-2 text-center">
                <button
                  className="mr-2 px-3 py-1 bg-yellow-400 rounded hover:bg-yellow-500"
                  onClick={() => handleEdit(opt)}
                >
                  ✏️ แก้ไข
                </button>
                <button
                  className="px-3 py-1 bg-red-500 rounded hover:bg-red-600 text-white"
                  onClick={() => handleDelete(opt.option_id)}
                >
                  🗑️ ลบ
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
  );
}
