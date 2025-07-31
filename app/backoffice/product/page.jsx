"use client";
import React from "react";
import { useState, useEffect, useCallback } from "react";
import Modal from "../components/Modal";
import Image from "next/image";
import { Edit2, Trash2, PlusCircle, Search } from "lucide-react";
const ProductsPage = () => {
  const [isClient, setIsClient] = useState(false);
  const [product, setProduct] = useState([]);
  const [newProduct, setNewProduct] = useState({
    product_name: "",
    product_type_id: "",
    product_price: "",
    product_image: "",
    product_description: "",
    product_status: true,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [notification, setNotification] = useState("");
  const [productType, setProductType] = useState([]);
  const [selectedType, setSelectedType] = useState("ทั้งหมด");
  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const fetchProduct = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/product");
      if (!res.ok) throw new Error("Failed to fetch product");
      const data = await res.json();
      setProduct(data);
    } catch (err) {
      setError("Error fetching product: " + err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  useEffect(() => {
    const fetchProductType = async () => {
      try {
        const res = await fetch("/api/product_type");
        if (!res.ok) throw new Error("Failed to fetch product types");
        const data = await res.json();
        setProductType(data);
      } catch (err) {
        console.error("Error fetching product types:", err);
      }
    };
    fetchProductType();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    setNewProduct((prev) => ({
      ...prev,
      [name]: type === "file" ? prev.product_image : value ?? "",
    }));
    if (type === "file" && files.length > 0) {
      setPreviewImage(URL.createObjectURL(files[0]));
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPreviewImage(URL.createObjectURL(file));
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setNewProduct((prev) => ({ ...prev, product_image: data.fileName }));
    } catch (err) {
      setError("Error uploading file: " + err.message);
      setPreviewImage(null);
    }
  };

  const openModal = (product = null) => {
    if (product) {
      const productStatus =
        product.product_status === true ||
        product.product_status === "true" ||
        product.product_status === 1;
      setNewProduct({ ...product, product_status: productStatus });
      if (product.product_image) {
        setPreviewImage(`/uploads/${product.product_image}`);
      }
      setIsEditing(true);
    } else {
      setNewProduct({
        product_name: "",
        product_type_id: "",
        product_price: "",
        product_image: "",
        product_description: "",
        product_status: true,
      });
      setPreviewImage(null);
      setIsEditing(false);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setNewProduct({
      product_name: "",
      product_type_id: "",
      product_price: "",
      product_image: "",
      product_description: "",
      product_status: true,
    });
    setPreviewImage(null);
  };

  const clearForm = () => {
    setNewProduct({
      product_name: "",
      product_type_id: "",
      product_price: "",
      product_image: "",
      product_description: "",
      product_status: "",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !newProduct.product_name ||
      !newProduct.product_type_id ||
      !newProduct.product_price
    ) {
      setError("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }
    const productData = {
      ...newProduct,
      product_status: Boolean(
        newProduct.product_status === true ||
          newProduct.product_status === "true" ||
          newProduct.product_status === 1
      ),
    };
    try {
      const url = isEditing
        ? `/api/product/${newProduct.product_id}`
        : "/api/product";
      const method = isEditing ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productData),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "ไม่สามารถบันทึกข้อมูลได้");
      }
      await fetchProduct();
      setNotification(isEditing ? "แก้ไขข้อมูลสำเร็จ!" : "เพิ่มข้อมูลสำเร็จ!");
      setTimeout(() => setNotification(""), 1000);
      closeModal();
    } catch (err) {
      setError(
        `Error ${isEditing ? "updating" : "adding"} product: ${err.message}`
      );
    }
  };

  const deleteProduct = async (productId) => {
    try {
      const res = await fetch(`/api/product/${productId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("ไม่สามารถลบข้อมูลได้");
      await fetchProduct();
      setNotification("ลบข้อมูลสำเร็จ!");
      setTimeout(() => setNotification(""), 1000);
    } catch (err) {
      setError("Error deleting product: " + err.message);
    }
  };

  const filteredProduct = product
    .filter((item) =>
      (item?.product_name || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
    )
    // แสดงข้อความแจ้งเตือนว่าไม่สามารถลบข้อมูลได้
    .filter((item) => {
      if (selectedType === "ทั้งหมด") return true;
      return String(item.product_type_id) === String(selectedType);
    });

  return (
    <div className="p-6 max-h-screen overflow-auto bg-gray-50 min-h-screen">
      <h1 className="text-4xl font-bold mb-6 text-orange-700">รายการอาหาร</h1>

      {error && (
        <p className="text-red-600 mb-4 bg-red-100 p-3 rounded shadow-sm">
          {error}
        </p>
      )}

      {notification && (
        <div className="mb-4 p-3 bg-green-100 text-green-800 rounded shadow-sm">
          {notification}
        </div>
      )}

      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:gap-4">
        <div className="relative flex-grow">
          <input
            type="text"
            value={searchQuery ?? ""}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ค้นหาอาหาร"
            className="text-3xl w-full pl-10 pr-4 py-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
          <Search
            size={18}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-orange-400"
          />
        </div>
        <button
          onClick={() => openModal()}
          className="text-3xl mt-3 sm:mt-0 inline-flex items-center gap-2 cursor-pointer bg-green-500 hover:bg-green-700 text-white px-5 py-2 rounded shadow transition"
        >
          <PlusCircle size={20} />
          เพิ่มรายการอาหาร
        </button>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <button
          className={`px-4 py-2 rounded-full border text-2xl font-medium transition cursor-pointer ${
            selectedType === "ทั้งหมด"
              ? "bg-orange-500 text-white border-orange-500"
              : "bg-white text-orange-700 border-orange-300 hover:bg-orange-100"
          }`}
          onClick={() => setSelectedType("ทั้งหมด")}
        >
          ทั้งหมด
        </button>
        {productType.map((type) => (
          <button
            key={type.product_type_id}
            className={`text-2xl px-4 py-2 cursor-pointer rounded-full border font-medium transition ${
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
              <th className="px-4 py-3 border-b border border-gray-300 text-3xl text-center">
                ชื่ออาหาร
              </th>
              <th className="px-4 py-3 border-b border border-gray-300 text-3xl text-center">
                ประเภทอาหาร
              </th>
              <th className="px-4 py-3 border-b border border-gray-300 text-3xl text-center">
                ราคา
              </th>
              <th className="px-4 py-3 border-b border border-gray-300 text-3xl text-center">
                รูปภาพ
              </th>
              <th className="px-4 py-3 border-b border border-gray-300 text-3xl  text-center">
                คำอธิบาย
              </th>
              <th className="px-4 py-3 border-b border border-gray-300 text-3xl text-center">
                สถานะ
              </th>
              <th className="px-4 py-3 border-b border border-gray-300 text-3xl text-center">
                การจัดการ
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredProduct.map((product, index) => (
              <tr
                key={product.product_id || `product-${index}`}
                className={`${
                  product.product_status === "ไม่มีสินค้า"
                    ? "bg-gray-100 text-gray-400"
                    : "hover:bg-teal-50"
                }`}
              >
                <td className="text-2xl px-4 py-3 border-b border border-gray-300 text-left">
                  {product.product_name}
                </td>
                <td className="text-2xl px-4 py-3 border-b border border-gray-300 text-center">
                  {product.product_type_name}
                </td>
                <td className="text-2xl px-4 py-3 border-b border border-gray-300 text-center">
                  {product.product_price} ฿
                </td>
                <td className="px-4 py-3 border-b border border-gray-300">
                  <div className="flex items-center justify-center h-full">
                    {product.product_image ? (
                      <Image
                        src={`/uploads/${product.product_image}`}
                        alt={product.product_name || "No Image"}
                        width={50}
                        height={50}
                        className="rounded border border-gray-300 shadow-sm"
                      />
                    ) : (
                      <p className="text-gray-400 italic text-sm">ไม่มีรูป</p>
                    )}
                  </div>
                </td>
                <td className="text-2xl px-4 py-3 border-b border border-gray-300 text-center">
                  {product.product_description}
                </td>
                <td className="text-2xl px-4 py-3 border-b border border-gray-300 text-center">
                  <span
                    className={`text-2xl inline-block px-3 py-1 rounded-full font-semibold ${
                      product.product_status === "มีสินค้า"
                        ? "bg-green-100 text-green-700"
                        : product.product_status === "หมด"
                        ? "bg-red-100 text-red-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {product.product_status === "มีสินค้า" ? "พร้อมขาย" : "หมด"}
                  </span>
                </td>
                <td className="text-3xl px-4 py-3 border-b border border-gray-300 text-center">
                  <div className="flex justify-center gap-2">
                    <button
                      onClick={() => openModal(product)}
                      aria-label="แก้ไข"
                      className="text-2xl p-2 cursor-pointer bg-yellow-400 hover:bg-yellow-500 text-white rounded shadow transition flex items-center gap-1"
                      title="แก้ไข"
                    >
                      <Edit2 size={18} /> แก้ไข
                    </button>
                    <button
                      onClick={() => {
                        if (confirm("คุณแน่ใจว่าต้องการลบรายการนี้?")) {
                          deleteProduct(product.product_id);
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
            {filteredProduct.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center p-6 text-gray-500">
                  ไม่พบข้อมูลรายการอาหาร
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal isOpen={isModalOpen} closeModal={closeModal}>
        <h2 className="text-xl font-semibold mb-4">
          {isEditing ? "แก้ไขรายการอาหาร" : "เพิ่มอาหารใหม่"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="product_name" className="block">
              ชื่ออาหาร
            </label>
            <input
              type="text"
              id="product_name"
              name="product_name"
              value={newProduct.product_name ?? ""}
              onChange={handleChange}
              required
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>

          <div>
            <label htmlFor="product_type" className="block">
              ประเภทสินค้า
            </label>
            <select
              id="product_type_id"
              name="product_type_id"
              value={newProduct.product_type_id ?? ""}
              onChange={handleChange}
              required
              className="w-full p-2 border border-gray-300 rounded"
            >
              <option value="">เลือกประเภทสินค้า</option>
              {productType.length > 0 ? (
                productType.map((product_type_id) => (
                  <option
                    key={product_type_id.product_type_id}
                    value={product_type_id.product_type_id}
                  >
                    {product_type_id.product_type_name}
                  </option>
                ))
              ) : (
                <option disabled>ไม่มีข้อมูลประเภทสินค้า</option>
              )}
            </select>
          </div>

          <div>
            <label htmlFor="product_price" className="block">
              ราคา
            </label>
            <input
              type="number"
              id="product_price"
              name="product_price"
              value={newProduct.product_price || ""}
              onChange={(e) => {
                const value =
                  e.target.value === "" ? "" : Number(e.target.value);
                setNewProduct((prev) => ({ ...prev, product_price: value }));
              }}
              required
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>

          <div>
            <label htmlFor="product_image" className="block">
              รูปภาพ
            </label>
            <input
              type="file"
              id="product_image"
              name="product_image"
              accept="image/*"
              onChange={handleFileUpload} // ✅ ใช้ฟังก์ชันอัปโหลดไฟล์ที่คุณเขียนไว้
              className="w-full p-2 border border-gray-300 rounded"
            />
            {previewImage && (
              <div className="mt-2">
                <p className="text-gray-600">ตัวอย่างรูปภาพ:</p>
                <Image
                  src={previewImage}
                  alt="Preview"
                  width={150}
                  height={150}
                  className="rounded border"
                />
              </div>
            )}
          </div>

          <div>
            <label htmlFor="product_description" className="block">
              คําอธิบาย
            </label>
            <input
              type="text"
              id="product_description"
              name="product_description"
              value={newProduct.product_description || ""}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>

          <div>
            <label htmlFor="product_status" className="block">
              สถานะสินค้า
            </label>
            <select
              id="product_status"
              name="product_status"
              value={String(newProduct.product_status)}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded"
            >
              <option value="true">พร้อมขาย</option>
              <option value="false">หมด</option>
            </select>
          </div>

          <div className="mt-4 flex gap-4">
            <button
              type="submit"
              className="bg-green-500 text-white px-6 py-2 rounded"
            >
              {isEditing ? "บันทึกการแก้ไข" : "บันทึก"}
            </button>
            <button
              type="button"
              onClick={clearForm}
              className="bg-gray-500 text-white px-6 py-2 rounded"
            >
              เคลียร์
            </button>
            <button
              type="button"
              onClick={closeModal}
              className="bg-red-500 text-white px-6 py-2 rounded"
            >
              ยกเลิก
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ProductsPage;
