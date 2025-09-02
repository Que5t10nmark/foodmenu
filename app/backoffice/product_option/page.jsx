"use client";
import { useEffect, useState } from "react";
import { Edit2, Trash2 } from "lucide-react";  

export default function ProductOptionPage() {
  const [types, setTypes] = useState([]);
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState("ทั้งหมด");
  const [form, setForm] = useState({
    product_option_id: null,
    product_type_id: "",
    product_option_type: "",
    product_option_value: "",
    product_option_price: 0,
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
    setTimeout(() => setNotification(null), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const method = form.product_option_id ? "PUT" : "POST";
    const url = form.product_option_id
      ? `/api/product_option/${form.product_option_id}`
      : "/api/product_option";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_type_id: form.product_type_id,
          product_option_type: form.product_option_type,
          product_option_value: form.product_option_value,
          product_option_price: form.product_option_price,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "เกิดข้อผิดพลาด");
      }

      showNotification(
        "success",
        form.product_option_id ? "แก้ไขตัวเลือกสำเร็จ" : "เพิ่มตัวเลือกสำเร็จ"
      );

      setForm({
        product_option_id: null,
        product_type_id: "",
        product_option_type: "",
        product_option_value: "",
        product_option_price: 0,
      });

      fetchData();
    } catch (error) {
      showNotification("error", error.message);
    }
  };

  const handleEdit = (opt) => {
    setForm({
      product_option_id: opt.product_option_id,
      product_type_id: opt.product_type_id,
      product_option_type: opt.product_option_type,
      product_option_value: opt.product_option_value,
      product_option_price: opt.product_option_price,
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

  if (loading)
    return <div className="p-6 max-w-4xl mx-auto">กำลังโหลดข้อมูล...</div>;

  return (
    // <div className="p-6 max-h-screen overflow-auto">
    <>
      <h1 className="text-4xl font-bold mb-6 text-orange-700">
        ⚙️ จัดการตัวเลือกสินค้าตามประเภท
      </h1>

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
            value={form.product_option_type}
            onChange={(e) => setForm({ ...form, product_option_type: e.target.value })}
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
            placeholder="ค่า เช่น เผ็ดมาก, เผ็ดน้อย, ไม่เผ็ด"
            value={form.product_option_value}
            onChange={(e) => setForm({ ...form, product_option_value: e.target.value })}
            className="border rounded px-3 py-2"
            required
          />

          <input
            type="number"
            min="0"
            placeholder="ราคาเพิ่ม"
            value={form.product_option_price}
            onChange={(e) =>
              setForm({
                ...form,
                product_option_price: parseFloat(e.target.value) || 0,
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
          {form.product_option_id ? "💾 บันทึกการแก้ไข" : "➕ เพิ่มตัวเลือก"}
        </button>
        {form.product_option_id && (
          <button
            type="button"
            className="mt-4 ml-2 bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
            onClick={() =>
              setForm({
                product_option_id: null,
                product_type_id: "",
                product_option_type: "",
                product_option_value: "",
                product_option_price: 0,
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
            className={`px-4 py-2 rounded-full border text-xl font-medium transition cursor-pointer ${
              selectedType === "ทั้งหมด"
                ? "bg-orange-500 text-white border-orange-500"
                : "bg-white text-orange-700 border-orange-300 hover:bg-orange-100"
            }`}
            onClick={() => setSelectedType("ทั้งหมด")}
          >
            ทั้งหมด
          </button>
          {types.map((type) => (
            <button
              key={type.product_type_id}
              className={`text-xl px-4 py-2 cursor-pointer rounded-full border font-medium transition  ${
                selectedType === type.product_type_id
                  ? "bg-orange-500 text-white border-orange-500"
                  : "bg-white text-orange-700 border-orange-300 hover:bg-orange-100"
              }`}
              onClick={() => setSelectedType(type.product_type_id)}
            >
              {type.product_type_name}
            </button>
          ))}
        </div>
        <div className="overflow-x-auto max-h-[70vh] shadow rounded border border-gray-200 bg-white">
          <table className="min-w-full table-auto border-collapse">
            <thead className="bg-orange-100 text-orange-700 sticky top-0 z-10">
              <tr>
                <th className="px-4 py-3 border-b border border-gray-300 text-2xl text-center">ประเภทอาหาร</th>
                <th className="px-4 py-3 border-b border border-gray-300 text-2xl text-center">ประเภทตัวเลือก</th>
                <th className="px-4 py-3 border-b border border-gray-300 text-2xl text-center">รายละเอียด</th>
                <th className="px-4 py-3 border-b border border-gray-300 text-2xl text-center">ราคา</th>
                <th className="p-2 px-4 py-3 border-b border border-gray-300 text-2xl text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {options
                .filter(
                  (opt) =>
                    selectedType === "ทั้งหมด" ||
                    opt.product_type_id === selectedType
                )
                .map((opt) => (
                  <tr key={opt.product_option_id} className="border-t">
                    <td className="text-2xl px-4 py-3 border-b border border-gray-300 text-left">
                      {types.find(
                        (t) => t.product_type_id === opt.product_type_id
                      )?.product_type_name || "-"}
                    </td>
                    <td className="text-xl px-2 py-1 border-b border border-gray-300 text-center">{opt.product_option_type}</td>
                    <td className="text-xl px-2 py-1 border-b border border-gray-300 text-center">{opt.product_option_value}</td>
                    <td className="text-xl px-2 py-1 border-b border border-gray-300 text-center">฿{opt.product_option_price}</td>
                    <td className="text-xl px-4 py-3 border-b border border-gray-300 text-center">
                  <div className="flex justify-center gap-2">
                    <button
                      onClick={() => handleEdit(opt)}
                      aria-label="แก้ไข"
                      className="text-lg p-2 cursor-pointer bg-yellow-400 hover:bg-yellow-500 text-white rounded shadow transition flex items-center gap-1"
                      title="แก้ไข"
                    >
                      <Edit2 size={18} /> แก้ไข
                    </button>
                    <button
                      onClick={() => {
                        if (confirm("คุณแน่ใจว่าต้องการลบรายการนี้?")) {
                          handleDelete(opt.product_option_id);
                        }
                      }}
                      aria-label="ลบ"
                      className="text-lg p-2 cursor-pointer bg-red-500 hover:bg-red-600 text-white rounded shadow transition flex items-center gap-1"
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
      </div>
    {/* </div> */}
    </>
  );
}
