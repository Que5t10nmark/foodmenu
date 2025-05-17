"use client";

import { useState, useEffect, useCallback } from "react";
import Modal from "../components/Modal";
import Image from "next/image";

const ProductsPage = () => {
  const [isClient, setIsClient] = useState(false);
  const [product, setProduct] = useState([]);
  const [newProduct, setNewProduct] = useState({
    product_name: "",
    product_type: "",
    product_price: "",
    product_size: "",
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
        product_type: "",
        product_price: "",
        product_size: "",
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
      product_type: "",
      product_price: "",
      product_size: "",
      product_image: "",
      product_description: "",
      product_status: true,
    });
    setPreviewImage(null);
  };

  const clearForm = () => {
    setNewProduct({
      product_name: "",
      product_type: "",
      product_price: "",
      product_size: "",
      product_image: "",
      product_description: "",
      product_status: "",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !newProduct.product_name ||
      !newProduct.product_type ||
      !newProduct.product_price ||
      !newProduct.product_size
    ) {
      setError("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }
    const productData = {
      ...newProduct,
      product_status:
        newProduct.product_status === "true" ||
        newProduct.product_status === true,
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
    .filter((item) => {
      if (selectedType === "ทั้งหมด") return true;
      return String(item.product_type) === String(selectedType);
    });

  return (
    <div className="p-6 max-h-screen overflow-auto">
      <h1 className="text-3xl font-bold mb-6">รายการอาหาร</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {notification && (
        <div className="mb-4 p-3 bg-green-200 text-green-800 rounded">
          {notification}
        </div>
      )}
      <div className="mb-6">
        <input
          type="text"
          value={searchQuery ?? ""}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="ค้นหาอาหาร"
          className="p-2 border border-gray-300 rounded w-full"
        />
      </div>
      <button
        onClick={() => openModal()}
        className="bg-green-500 text-white p-2 rounded mb-6"
      >
        เพิ่มรายการอาหาร
      </button>

      <div className="flex flex-wrap gap-2 mb-4">
        <button
          className={`px-4 py-1 rounded-full border text-sm ${
            selectedType === "ทั้งหมด"
              ? "bg-orange-500 text-white"
              : "bg-white text-gray-700"
          }`}
          onClick={() => setSelectedType("ทั้งหมด")}
        >
          ทั้งหมด
        </button>
        {productType.map((type) => (
          <button
            key={type.product_type_id}
            className={`px-4 py-1 rounded-full border text-sm ${
              selectedType === type.product_type_id
                ? "bg-orange-500 text-white"
                : "bg-white text-gray-700"
            }`}
            onClick={() => setSelectedType(type.product_type_id)}
          >
            {type.product_type_name}
          </button>
        ))}
      </div>
      <div className="overflow-x-auto max-h-[70vh]">
        <table className="min-w-full table-auto border-collapse border border-gray-300">
          <thead>
            <tr>
              <th className="px-4 py-2 border">ชื่ออาหาร</th>
              <th className="px-4 py-2 border">ประเภทอาหาร</th>
              <th className="px-4 py-2 border">ราคา</th>
              <th className="px-4 py-2 border">ขนาด</th>
              <th className="px-4 py-2 border">รูปภาพ</th>
              <th className="px-4 py-2 border">คําอธิบาย</th>
              <th className="px-4 py-2 border">สถานะ</th>
              <th className="px-4 py-2 border">การจัดการ</th>
            </tr>
          </thead>
          <tbody>
            {filteredProduct.map((product, index) => (
              <tr
                key={product.product_id || `product-${index}`}
                className={
                  product.product_status_name === "ไม่มีสินค้า"
                    ? "bg-gray-300"
                    : ""
                }
              >
                <td className="px-4 py-2 border">{product.product_name}</td>
                <td className="px-4 py-2 border">
                  {product.product_type_name}
                </td>
                <td className="px-4 py-2 border">{product.product_price}</td>
                <td className="px-4 py-2 border">{product.product_size}</td>
                <td className="px-4 py-2 border text-center">
                  {product.product_image ? (
                    <Image
                      src={`/uploads/${product.product_image}`}
                      alt={product.product_name || "No Image"}
                      width={50}
                      height={50}
                      className="rounded border"
                    />
                  ) : (
                    <p className="text-gray-400">ไม่มีรูป</p>
                  )}
                </td>
                <td className="px-4 py-2 border">
                  {product.product_description}
                </td>
                <td className="px-4 py-2 border">{product.product_status}</td>
                <td className="px-4 py-2 border">
                  <button
                    onClick={() => openModal(product)}
                    className="bg-yellow-500 text-white px-4 py-2 rounded mr-2"
                  >
                    แก้ไข
                  </button>
                  <button
                    onClick={() => deleteProduct(product.product_id)}
                    className="bg-red-500 text-white px-4 py-2 rounded"
                  >
                    ลบ
                  </button>
                </td>
              </tr>
            ))}
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
              id="product_type"
              name="product_type"
              value={newProduct.product_type ?? ""}
              onChange={handleChange}
              required
              className="w-full p-2 border border-gray-300 rounded"
            >
              <option value="">เลือกประเภทสินค้า</option>
              {productType.length > 0 ? (
                productType.map((product_type) => (
                  <option
                    key={product_type.product_type_id}
                    value={product_type.product_type_id}
                  >
                    {product_type.product_type_name}
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
            <label htmlFor="product_size" className="block">
              ขนาด
            </label>
            <input
              type="text"
              id="product_size"
              name="product_size"
              value={newProduct.product_size || ""} // ✅ ป้องกัน undefined
              onChange={(e) =>
                setNewProduct((prev) => ({
                  ...prev,
                  product_size: e.target.value,
                }))
              }
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
              <option value="true">มีสินค้า</option>
              <option value="false">ไม่มีสินค้า</option>
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
