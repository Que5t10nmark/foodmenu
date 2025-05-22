"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "../../../store/cartContext";

function Page() {
  const { product_id } = useParams();
  const [product, setProduct] = useState(null);
  const { addToCart, cart } = useCart();
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const [options, setOptions] = useState([]); // ตัวเลือกสินค้าทั้งหมดที่โหลดมา
  const [selectedOptions, setSelectedOptions] = useState({});
  const [purchase_description, setPurchaseDescription] = useState("");

  // โหลดข้อมูลสินค้าและตัวเลือกสินค้า
useEffect(() => {
  if (product_id) {
    setLoading(true);
    fetch(`/api/product/${product_id}`)
      .then((res) => res.json())
      .then((data) => {
        setProduct(data);
        setLoading(false);

        if (data.product_type) {
          fetch(`/api/product_option?product_type_id=${data.product_type}`)
            .then((res) => res.json())
            .then((optionData) => {
              setOptions(optionData);
            })
            .catch((err) => console.error("โหลดตัวเลือกไม่สำเร็จ", err));
        } else {
          console.warn("product_type is missing in product data");
        }
      })
      .catch((err) => {
        console.error("โหลดสินค้าไม่สำเร็จ", err);
        setLoading(false);
      });
  }
}, [product_id]);


  // จัดการการเปลี่ยนแปลงตัวเลือก
  const handleOptionChange = (optionType, value, isMultiple) => {
    setSelectedOptions((prev) => {
      if (isMultiple) {
        const prevValues = prev[optionType] || [];
        const newValues = prevValues.includes(value)
          ? prevValues.filter((v) => v !== value)
          : [...prevValues, value];
        return { ...prev, [optionType]: newValues };
      } else {
        return { ...prev, [optionType]: value };
      }
    });
  };

  // เพิ่มสินค้าและตัวเลือกลงตะกร้า
  const handleAddToCart = () => {
    if (!product) return;
    const updatedProduct = {
      ...product,
      selected_options: selectedOptions,
      purchase_description,
      quantity: 1,
    };
    addToCart(updatedProduct);
    setMessage(`✅ ${product.product_name} ถูกเพิ่มลงในตะกร้าแล้ว`);
    setTimeout(() => setMessage(""), 1500);
  };

  // แสดง input ตัวเลือกสินค้า (จัดกลุ่มตาม option_type)
  const renderOptionInputs = () => {
    const grouped = options.reduce((acc, option) => {
      if (!acc[option.option_type]) acc[option.option_type] = [];
      acc[option.option_type].push(option);
      return acc;
    }, {});

    return Object.entries(grouped).map(([type, optionList]) => {
      const isMultiple = optionList.some((o) => o.option_price > 0); // ใช้ checkbox ถ้ามีราคา
      return (
        <div key={type} className="mb-4">
          <label className="block font-semibold mb-1">{type}:</label>
          {isMultiple ? (
            optionList.map((opt) => (
              <label key={opt.option_value} className="flex items-center mb-1">
                <input
                  type="checkbox"
                  checked={(selectedOptions[type] || []).includes(opt.option_value)}
                  onChange={() => handleOptionChange(type, opt.option_value, true)}
                  className="mr-2"
                />
                {opt.option_value} {opt.option_price > 0 ? `(+${opt.option_price}฿)` : ""}
              </label>
            ))
          ) : (
            <select
              value={selectedOptions[type] || ""}
              onChange={(e) => handleOptionChange(type, e.target.value, false)}
              className="border rounded px-3 py-2 w-full"
            >
              <option value="">-- เลือก {type} --</option>
              {optionList.map((opt) => (
                <option key={opt.option_value} value={opt.option_value}>
                  {opt.option_value} {opt.option_price > 0 ? `(+${opt.option_price}฿)` : ""}
                </option>
              ))}
            </select>
          )}
        </div>
      );
    });
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      {product && !loading ? (
        <div className="bg-white rounded-xl shadow p-4">
          <h1 className="text-3xl font-bold mb-4">{product.product_name}</h1>

          <div className="flex justify-center items-center">
            <Image
              src={`/uploads/${product.product_image}`}
              alt={product.product_name || "รูปภาพสินค้า"}
              width={250}
              height={250}
              className="rounded mb-4"
            />
          </div>

          <h2 className="text-xl font-semibold mb-2">ตัวเลือกสินค้า:</h2>
          {renderOptionInputs() }
          
          <div className="mb-4">
            <label className="block font-semibold mb-1">รายละเอียดเพิ่มเติม:</label>
            <textarea
              value={purchase_description}
              onChange={(e) => setPurchaseDescription(e.target.value)}
              className="w-full border rounded px-3 py-2"
              placeholder="เช่น ไม่ใส่ผัก, ใช้น้ำมันน้อย ฯลฯ"
            />
          </div>

          {message && (
            <div className="mb-4 p-3 bg-green-100 text-green-700 rounded text-center font-semibold">
              {message}
            </div>
          )}

          <button
            className="mt-4 w-full bg-green-500 text-white py-2 rounded hover:bg-green-600 transition"
            onClick={handleAddToCart}
          >
            ✅ เพิ่มในตะกร้า
          </button>

          <Link href={"/order/product"} className="block text-center mt-4">
            <button className="w-full bg-orange-500 text-white py-2 rounded hover:bg-orange-600 transition">
              🍽️ เลือกสินค้าเพิ่ม
            </button>
          </Link>

          <Link href={`/order/cart`} className="fixed bottom-6 right-6 z-50">
            <button className="bg-green-600 text-white px-5 py-2 rounded-full shadow-lg hover:bg-green-700 transition">
              🛒 ไปยังตะกร้า ({cart.reduce((sum, item) => sum + (item.quantity || 1), 0)})
            </button>
          </Link>
        </div>
      ) : (
        <div className="text-center mt-10">กำลังโหลดข้อมูลสินค้า...</div>
      )}
    </div>
  );
}

export default Page;
