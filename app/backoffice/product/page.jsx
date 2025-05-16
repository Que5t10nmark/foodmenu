"use client";

import { useState, useEffect, useCallback } from "react";
import Modal from "../components/Modal";
import Image from "next/image";

const ProductsPage = () => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

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
  const [previewImage, setPreviewImage] = useState(null);

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
      setNewProduct((prev) => ({
        ...prev,
        product_image: data.fileName,
      }));
    } catch (err) {
      console.error("Error uploading file:", err);
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

  const filteredProduct = product.filter((item) =>
    (item?.product_name || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isClient) return null;

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
        className="bg-blue-500 text-white p-2 rounded mb-6"
      >
        เพิ่มรายการอาหาร
      </button>
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
                <td className="px-4 py-2 border">{product.product_type_name}</td>
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
                <td className="px-4 py-2 border">{product.product_description}</td>
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
      {isModalOpen && (
        <Modal isOpen={isModalOpen} closeModal={closeModal}>
          {/* Modal content form rendering here */}
        </Modal>
      )}
    </div>
  );
};

export default ProductsPage;
