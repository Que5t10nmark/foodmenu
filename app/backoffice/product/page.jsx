"use client";
import { useState, useEffect, useCallback } from "react";
import Modal from "../components/Modal";
import Image from "next/image";

const ProductsPage = () => {
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

  const addProduct = async (productData) => {
    try {
      const res = await fetch("/api/product", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productData),
      });
      if (!res.ok) throw new Error("Failed to add product");
      const newProduct = await res.json();

      // ✅ เพิ่มข้อมูลใหม่เข้า state product โดยตรง
      setProduct((prevProduct) => [...prevProduct, newProduct]);

      setNotification("เพิ่มประเภทอาหารสำเร็จ!");
      setTimeout(() => setNotification(""), 3000);
      closeModal(); // ปิด Modal หลังจากบันทึก
    } catch (err) {
      setError("Error adding product: " + err.message);
    }
  };
  const updateProduct = async (productId, productData) => {
    try {
      const res = await fetch(`/api/product/${productId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productData),
      });

      if (!res.ok) throw new Error("Failed to update product");

      // อัพเดท state โดยตรงแทนการเรียก fetchProduct
      setProduct((prevProducts) =>
        prevProducts.map((item) => {
          if (item.product_id === productId) {
            return {
              ...productData,
              product_id: productId,
              product_type_name: productType.find(
                (type) =>
                  type.product_type_id.toString() ===
                  productData.product_type.toString()
              )?.product_type_name,
              product_status_name: productData.product_status
                ? "มีสินค้า"
                : "ไม่มีสินค้า",
            };
          }
          return item;
        })
      );

      setNotification("แก้ไขข้อมูลสำเร็จ!");
      setTimeout(() => setNotification(""), 3000);
      closeModal();
    } catch (err) {
      console.error("Error updating product:", err);
      setError("Error updating product: " + err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // เช็คข้อมูลที่จำเป็น
    if (
      !newProduct.product_name ||
      !newProduct.product_type ||
      !newProduct.product_price ||
      !newProduct.product_size
    ) {
      setError("กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน");
      return;
    }

    // เตรียมข้อมูลที่จะส่ง
    const productData = {
      ...newProduct,
      product_status:
        newProduct.product_status === "true" ||
        newProduct.product_status === true
          ? true
          : false,
    };

    try {
      if (isEditing) {
        // กรณีแก้ไขข้อมูล
        const res = await fetch(`/api/product/${newProduct.product_id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(productData),
        });

        if (!res.ok) throw new Error("Failed to update product");

        // อัพเดท state โดยตรง
        const updatedProduct = {
          ...productData,
          product_type: productType.find(
            (type) =>
              type.product_type_id.toString() ===
              productData.product_type.toString()
          )?.product_type,
          product_status: productData.product_status
            ? "มีสินค้า"
            : "ไม่มีสินค้า",
        };

        setProduct((prevProducts) =>
          prevProducts.map((item) =>
            item.product_id === newProduct.product_id ? updatedProduct : item
          )
        );
      } else {
        // กรณีเพิ่มข้อมูลใหม่
        const res = await fetch("/api/product", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(productData),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message);

        // เพิ่มข้อมูลใหม่เข้า state
        const newProductWithDetails = {
          ...productData,
          product_id: data.id,
          product_type_name: productType.find(
            (type) =>
              type.product_type_id.toString() ===
              productData.product_type.toString()
          )?.product_type_name,
          product_status_name: productData.product_status
            ? "มีสินค้า"
            : "ไม่มีสินค้า",
        };

        setProduct((prevProducts) => [...prevProducts, newProductWithDetails]);
      }

      setNotification(isEditing ? "แก้ไขข้อมูลสำเร็จ!" : "เพิ่มข้อมูลสำเร็จ!");
      setTimeout(() => setNotification(""), 3000);
      closeModal();
    } catch (err) {
      console.error("Error:", err);
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

      if (!res.ok) throw new Error("Failed to delete product");
      // อัพเดท state โดยตรง
      setProduct((prevProducts) =>
        prevProducts.filter((product) => product.product_id !== productId)
      );

      setNotification("ลบข้อมูลสำเร็จ!");
      setTimeout(() => setNotification(""), 3000);
      closeModal();
    } catch (err) {
      setError(err.message);
    }
  };

  const openModal = (product = null) => {
    if (product) {
      // แปลงค่า product_status เป็น boolean
      const productStatus =
        product.product_status === true ||
        product.product_status === "true" ||
        product.product_status === 1;

      setNewProduct({
        ...product,
        product_status: productStatus,
      });

      // แสดงรูปภาพเดิม
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

  const [productType, setProductType] = useState([]);

  useEffect(() => {
    const fetchProductType = async () => {
      try {
        const res = await fetch("/api/product_type");
        if (!res.ok) throw new Error("Failed to fetch product types");
        const data = await res.json();
        setProductType(data); // ✅ เก็บประเภทสินค้าใน State
      } catch (err) {
        console.error("Error fetching product types:", err);
      }
    };

    fetchProductType();
  }, []);

  const [previewImage, setPreviewImage] = useState(null); // ✅ เพิ่ม state เก็บรูป

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;

    setNewProduct((prev) => ({
      ...prev,
      [name]: type === "file" ? prev.product_image : value ?? "", // ✅ ไม่เก็บ object
    }));

    if (type === "file" && files.length > 0) {
      setPreviewImage(URL.createObjectURL(files[0]));
    }
  };

  {
    (previewImage || newProduct.product_image) && (
      <div className="mb-4">
        <p className="text-gray-600">รูปภาพตัวอย่าง:</p>
        <Image
          src={previewImage || `/uploads/${newProduct.product_image}`}
          alt="Preview"
          width={150}
          height={150}
          className="rounded border"
        />
      </div>
    );
  }

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setPreviewImage(URL.createObjectURL(file)); // แสดงตัวอย่างรูปที่อัปโหลด

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      console.log("✅ File uploaded:", data.fileName);

      setNewProduct((prev) => ({
        ...prev,
        product_image: data.fileName, // ✅ ใช้ชื่อไฟล์ที่อัปโหลดได้จริง
      }));
    } catch (err) {
      console.error("❌ Error uploading file:", err);
      setError("Error uploading file: " + err.message);
      setPreviewImage(null);
    }
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

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  const renderError = () => {
    if (error) {
      return <p className="text-red-500 mb-4">{error}</p>;
    }
    return null;
  };

  const filteredProduct = product.filter((item) =>
    (item?.product_name || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">รายการอาหาร</h1>

      {renderError()}

      {error && <p className="text-red-500 mb-4">{error}</p>}
      {notification && (
        <div className="mb-4 p-3 bg-green-200 text-green-800 rounded">
          {notification}
        </div>
      )}

      <div className="mb-6">
        <input
          type="text"
          value={searchQuery}
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

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">รายการอาหาร</h2>
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
                      src={`/uploads/${
                        product.product_image || "placeholder.jpg"
                      }`}
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
                  e.target.value === "" ? "" : Number(e.target.value); // ✅ ให้แน่ใจว่าค่าเป็นตัวเลข
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
            {/* {previewImage && (
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
            )} */}
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
