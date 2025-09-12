"use client";
import { useEffect, useState, useCallback } from "react";
import Modal from "../components/Modal";
import { Trash2, Edit2, PlusCircle } from "lucide-react";
const ProductTypePage = () => {
  const [productTypes, setProductTypes] = useState([]);
  const [newProductType, setNewProductType] = useState({ product_type_name: "" });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [notification, setNotification] = useState("");

  const fetchProductTypes = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/product_type");
      if (!res.ok) throw new Error("Failed to fetch product types");
      const data = await res.json();
      setProductTypes(data);
    } catch (err) {
      setError("Error fetching product types: " + err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const addProductType = async (productTypeData) => {
    try {
      const res = await fetch("/api/product_type", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_type_name: productTypeData.product_type_name, // ส่งเฉพาะ field ที่จำเป็น
        }),
      });

      if (!res.ok) throw new Error("Failed to add product type");

      const result = await res.json();

      setProductTypes((prevProductTypes) => [
        ...prevProductTypes,
        {
          product_type_id: result.product_type_id, // ใช้ id ที่ส่งกลับมาจาก API
          product_type_name: productTypeData.product_type_name,
        },
      ]);

      setNotification("เพิ่มประเภทอาหารสำเร็จ!");
      setTimeout(() => setNotification(""), 3000);
    } catch (err) {
      setError("Error adding product type: " + err.message);
    }
  };

  const updateProductType = async (productTypeId, productTypeData) => {
    try {
      const res = await fetch(`/api/product_type/${productTypeId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_type_name: productTypeData.product_type_name,
        }),
      });

      if (!res.ok) throw new Error("Failed to update product type");

      await res.json();

      setProductTypes((prevProductTypes) =>
        prevProductTypes.map((productType) =>
          productType.product_type_id === productTypeId
            ? {
                ...productType,
                product_type_name: productTypeData.product_type_name,
              }
            : productType
        )
      );

      setNotification("แก้ไขประเภทอาหารสำเร็จ!");
      setTimeout(() => setNotification(""), 3000);
    } catch (err) {
      setError("Error updating product type: " + err.message);
    }
  };

  const deleteProductType = async (productTypeId) => {
    try {
      const res = await fetch(`/api/product_type/${productTypeId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete product type");

      setProductTypes((prevProductTypes) =>
        prevProductTypes.filter(
          (productType) => productType.product_type_id !== productTypeId
        )
      );

      setNotification("ลบประเภทอาหารสำเร็จ!");
      setTimeout(() => setNotification(""), 3000);
    } catch (err) {
      setError("Error deleting product type: " + err.message);
    }
  };

  const openModal = (productType = null) => {
    if (productType) {
      setNewProductType({
        product_type_id: productType.product_type_id,
        product_type_name: productType.product_type_name,
      });
      setIsEditing(true);
    } else {
      // เวลาเพิ่มใหม่ ต้องล้างทั้ง id และ name ออก
      setNewProductType({ product_type_name: "" });
      setIsEditing(false);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    clearForm();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewProductType((prev) => ({ ...prev, [name]: value }));
  };
  

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isEditing) {
      await updateProductType(newProductType.product_type_id, newProductType);
    } else {
      await addProductType(newProductType);
    }
    closeModal();
  };

  const clearForm = () => {
    setNewProductType({ product_type_name: "" });
  };

  useEffect(() => {
    fetchProductTypes();
  }, [fetchProductTypes]);

  return (
    // <div className="p-6 max-h-screen overflow-auto bg-gray-50 min-h-screen">
    <>
      <h1 className="text-4xl font-bold mb-6 text-orange-700">จัดการประเภทอาหาร</h1>

      {error && <p className="text-red-500 mb-4">{error}</p>}
      {notification && (
        <div className="mb-4 p-3 bg-green-200 text-green-800 rounded">
          {notification}
        </div>
      )}

      <button
        onClick={() => openModal()}
        className="text-3xl mt-3 p-4 sm:mt-0 inline-flex items-center gap-2 cursor-pointer bg-green-500 hover:bg-green-800 text-white px-5 py-2 rounded shadow transition"
      >
        <PlusCircle size={20} />
        เพิ่มประเภทอาหาร
      </button>

      <div className="overflow-x-auto max-h-[70vh] shadow rounded border border-gray-200 bg-white mb-2">
        <h2 className="text-2xl font-bold mb-4 px-4 pt-4 text-orange-700">รายการประเภทอาหาร</h2>
        <table className="min-w-full table-auto border-collapse">
          <thead className="bg-orange-100 text-orange-700 sticky top-0 z-10">
            <tr>
              <th className="px-4 py-3 border-b border border-gray-300 text-3xl text-center">ชื่อประเภทอาหาร</th>
              <th className="px-4 py-3 border-b border border-gray-300 text-3xl text-center">การจัดการ</th>
            </tr>
          </thead>
          <tbody>
            {productTypes.map((productType, index) => (
              <tr key={productType.product_type_id || index}>
                <td className="text-2xl px-4 py-3 border-b border border-gray-300">
                  {productType.product_type_name}
                </td>
                <td className="text-3xl px-4 py-3 border-b border border-gray-300 text-center">
                  <div className="flex justify-center gap-2">
                    <button
                      onClick={() => openModal(productType)}
                      aria-label="แก้ไข"
                      className="text-2xl p-2 cursor-pointer bg-yellow-400 hover:bg-yellow-500 text-white rounded shadow transition flex items-center gap-1"
                      title="แก้ไข"
                    >
                      <Edit2 size={18} /> แก้ไข
                    </button>
                    <button
                      onClick={() => {
                        if (confirm("คุณแน่ใจว่าต้องการลบรายการนี้?")) {
                          deleteProductType(productType.product_type_id);
                        }
                      }}
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
          {isEditing ? "แก้ไขประเภทอาหาร" : "เพิ่มประเภทอาหารใหม่"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="product_type_name" className="block">
              ชื่อประเภทอาหาร
            </label>
            <input
              type="text"
              id="product_type_name"
              name="product_type_name"
              value={newProductType.product_type_name || ""}
              onChange={handleChange}
              required
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>

        <div className="mt-6 flex gap-4 justify-end">
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
    {/* </div> */}
    </>
  );
};

export default ProductTypePage;
