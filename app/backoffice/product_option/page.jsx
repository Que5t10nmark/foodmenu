"use client";
import { useEffect, useState } from "react";

export default function ProductOptionPage() {
  const [types, setTypes] = useState([]);
  const [options, setOptions] = useState([]);
  const [form, setForm] = useState({
    option_id: null, // เปลี่ยนจาก id เป็น option_id
    product_type_id: "",
    option_type: "",
    option_value: "",
    option_price: 0,
  });

  const fetchData = () => {
    fetch("/api/product_type")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch product types");
        return res.json();
      })
      .then(setTypes)
      .catch(() => setTypes([]));

    fetch("/api/product_option")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch product options");
        return res.json();
      })
      .then(setOptions)
      .catch(() => setOptions([]));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const method = form.option_id ? "PUT" : "POST";
    const url = form.option_id
      ? `/api/product_option/${form.option_id}`
      : "/api/product_option";

    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        product_type_id: form.product_type_id,
        option_type: form.option_type,
        option_value: form.option_value,
        option_price: form.option_price,
      }),
    });

    setForm({
      option_id: null,
      product_type_id: "",
      option_type: "",
      option_value: "",
      option_price: 0,
    });
    fetchData();
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
    await fetch(`/api/product_option/${option_id}`, { method: "DELETE" });
    fetchData();
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">⚙️ จัดการตัวเลือกสินค้าตามประเภท</h1>

      <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow mb-6">
        <div className="grid grid-cols-2 gap-4">
          <select
            value={form.product_type_id}
            onChange={(e) => setForm({ ...form, product_type_id: e.target.value })}
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

          <select
            value={form.option_type}
            onChange={(e) => setForm({ ...form, option_type: e.target.value })}
            className="border rounded px-3 py-2"
            required
          >
            <option value="">เลือกประเภทตัวเลือก</option>
            <option value="ขนาด">ขนาด</option>
            <option value="ความเผ็ด">ความเผ็ด</option>
            <option value="ท็อปปิ้ง">ท็อปปิ้ง</option>
          </select>

          <input
            type="text"
            placeholder="ค่า เช่น เผ็ดมาก, พิเศษ"
            value={form.option_value}
            onChange={(e) => setForm({ ...form, option_value: e.target.value })}
            className="border rounded px-3 py-2"
            required
          />

          <input
            type="number"
            placeholder="ราคาเพิ่ม"
            value={form.option_price}
            onChange={(e) =>
              setForm({ ...form, option_price: parseFloat(e.target.value) || 0 })
            }
            className="border rounded px-3 py-2"
            required
          />
        </div>

        <button
          type="submit"
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
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

      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 text-left">ประเภทอาหาร</th>
            <th className="p-2">ประเภทตัวเลือก</th>
            <th className="p-2">ค่า</th>
            <th className="p-2">ราคาเพิ่ม</th>
            <th className="p-2 text-center">จัดการ</th>
          </tr>
        </thead>
        <tbody>
          {options.map((opt) => (
            <tr key={opt.option_id} className="border-t">
              <td className="p-2">
                {types.find((t) => t.product_type_id === opt.product_type_id)
                  ?.product_type_name || "-"}
              </td>
              <td className="p-2 text-center">{opt.option_type}</td>
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
  );
}
