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

  const [productOptions, setProductOptions] = useState([]); // ตัวเลือกสินค้าทั้งหมด
  const [selectedOptions, setSelectedOptions] = useState({});
  const [purchaseDescription, setPurchaseDescription] = useState("");

  // โหลดข้อมูลสินค้าและตัวเลือก
  useEffect(() => {
    if (product_id) {
      setLoading(true);
      fetch(`/api/product/${product_id}`)
        .then((res) => res.json())
        .then((productData) => {
          setProduct(productData);
          setLoading(false);

          if (productData.product_type) {
            fetch(`/api/product_option?product_type_id=${productData.product_type}`)
              .then((res) => res.json())
              .then((optionData) => {
                setProductOptions(optionData);
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
    setSelectedOptions((prevSelected) => {
      if (isMultiple) {
        const previousValues = prevSelected[optionType] || [];
        const updatedValues = previousValues.includes(value)
          ? previousValues.filter((v) => v !== value)
          : [...previousValues, value];
        return { ...prevSelected, [optionType]: updatedValues };
      } else {
        return { ...prevSelected, [optionType]: value };
      }
    });
  };

  // เพิ่มสินค้าและตัวเลือกลงตะกร้า
const handleAddToCart = () => {
  if (!product) return;

  // สร้าง selected_option ที่รวม option_value + option_price
  const selectedOptionWithPrice = {};
  for (const [type, value] of Object.entries(selectedOptions)) {
    const optionsOfType = productOptions.filter((opt) => opt.option_type === type);

    if (Array.isArray(value)) {
      selectedOptionWithPrice[type] = value.map((val) => {
        const match = optionsOfType.find((opt) => opt.option_value === val);
        return match || { option_value: val, option_price: 0 };
      });
    } else {
      const match = optionsOfType.find((opt) => opt.option_value === value);
      selectedOptionWithPrice[type] = match || { option_value: value, option_price: 0 };
    }
  }

  const updatedProduct = {
    ...product,
    selected_option: selectedOptionWithPrice,
    purchase_description: purchaseDescription,
    quantity: 1,
  };

  addToCart(updatedProduct);
  setMessage(`✅ ${product.product_name} ถูกเพิ่มลงในตะกร้าแล้ว`);
  setTimeout(() => setMessage(""), 1000);
};


  // แสดง input ตัวเลือกสินค้า (จัดกลุ่มตาม option_type)
  const renderOptionInputs = () => {
    const groupedOptionsByType = productOptions.reduce((grouped, option) => {
      if (!grouped[option.option_type]) {
        grouped[option.option_type] = [];
      }
      grouped[option.option_type].push(option);
      return grouped;
    }, {});

    return Object.entries(groupedOptionsByType).map(([optionType, optionList]) => {
      const isMultiple = optionList.some((option) => option.option_price > 0);
      return (
        <div key={optionType} className="mb-4">
          <label className="block font-semibold mb-1">{optionType}:</label>
          {isMultiple ? (
            optionList.map((option) => (
              <label key={option.option_value} className="flex items-center mb-1">
                <input
                  type="checkbox"
                  checked={(selectedOptions[optionType] || []).includes(option.option_value)}
                  onChange={() => handleOptionChange(optionType, option.option_value, true)}
                  className="mr-2"
                />
                {option.option_value} {option.option_price > 0 ? `(+${option.option_price}฿)` : ""}
              </label>
            ))
          ) : (
            <select
              value={selectedOptions[optionType] || ""}
              onChange={(e) => handleOptionChange(optionType, e.target.value, false)}
              className="border rounded px-3 py-2 w-full"
            >
              <option value="">-- เลือก {optionType} --</option>
              {optionList.map((option) => (
                <option key={option.option_value} value={option.option_value}>
                  {option.option_value} {option.option_price > 0 ? `(+${option.option_price}฿)` : ""}
                </option>
              ))}
            </select>
          )}
        </div>
      );
    });
  };

  // แสดงข้อมูลสินค้า
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

          {renderOptionInputs()}

          <div className="mb-4">
            <label className="block font-semibold mb-1">รายละเอียดเพิ่มเติม:</label>
            <textarea
              value={purchaseDescription}
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
