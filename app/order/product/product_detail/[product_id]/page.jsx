"use client";
import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "../../../store/cartContext";

function Page() {
  const params = useParams();
  const product_id = params.product_id;
  const searchParams = useSearchParams();
  const seatQRCode = searchParams.get("seat_qrcode");
  const [product, setProduct] = useState(null);
  const { addToCart, cart } = useCart();
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const [productOptions, setProductOptions] = useState([]); // ตัวเลือกสินค้าทั้งหมด
  const [selectedOptions, setSelectedOptions] = useState({});
  const [purchaseDescription, setPurchaseDescription] = useState("");

  useEffect(() => {
    if (product_id) {
      setLoading(true);
      fetch(`/api/product/${product_id}`)
        .then((res) => res.json())
        .then((productData) => {
          setProduct(productData);

          if (productData.product_type) {
            fetch(
              `/api/product_option?product_type_id=${productData.product_type}`
            )
              .then((res) => res.json())
              .then((optionData) => {
                setProductOptions(optionData);

                // รอ 2 วินาทีก่อนซ่อน loading หลังโหลดตัวเลือกสำเร็จ
                setTimeout(() => {
                  setLoading(false);
                }, 1000);
              })
              .catch((err) => {
                console.error("โหลดตัวเลือกไม่สำเร็จ", err);
                setLoading(false);
              });
          } else {
            console.warn("product_type is missing in product data");
            setTimeout(() => {
              setLoading(false);
            }, 1000);
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
  let optionsTotalPrice = 0;

  for (const [type, value] of Object.entries(selectedOptions)) {
    const optionsOfType = productOptions.filter(
      (opt) => opt.product_option_type === type
    );

    if (Array.isArray(value)) {
      selectedOptionWithPrice[type] = value.map((val) => {
        const match = optionsOfType.find((opt) => opt.product_option_value === val);
        if (match) optionsTotalPrice += Number(match.product_option_price || 0);
        return match || { product_option_value: val, product_option_price: 0 };
      });
    } else {
      const match = optionsOfType.find((opt) => opt.product_option_value === value);
      if (match) optionsTotalPrice += Number(match.product_option_price || 0);
      selectedOptionWithPrice[type] = match || {
        product_option_value: value,
        product_option_price: 0,
      };
    }
  }

  // ราคาสินค้าหลัก + ราคาตัวเลือก
  const totalPrice = Number(product.product_price || 0) + optionsTotalPrice;

  const updatedProduct = {
    ...product,
    selected_option: selectedOptionWithPrice,
    purchase_description: purchaseDescription,
    quantity: 1,
    total_price: totalPrice, // เก็บราคารวมไว้ที่นี่
  };

  addToCart(updatedProduct);
  setMessage(`✅ ${product.product_name} ถูกเพิ่มลงในตะกร้าแล้ว`);
  setTimeout(() => setMessage(""), 1000);
};

  // แสดง input ตัวเลือกสินค้า (จัดกลุ่มตาม option_type)
  const renderOptionInputs = () => {
    const groupedOptionsByType = productOptions.reduce((grouped, option) => {
      if (!grouped[option.product_option_type]) {
        grouped[option.product_option_type] = [];
      }
      grouped[option.product_option_type].push(option);
      return grouped;
    }, {});

    return Object.entries(groupedOptionsByType).map(
      ([optionType, optionList]) => {
        const isMultiple = optionList.some((option) => option.product_option_price > 0);
        return (
          <div key={optionType} className="mb-4">
            <label className="block font-semibold mb-1">{optionType}:</label>
            {isMultiple ? (
              optionList.map((option) => (
                <label
                  key={option.product_option_value}
                  className="flex items-center mb-1"
                >
                  <input
                    type="checkbox"
                    checked={(selectedOptions[optionType] || []).includes(
                      option.product_option_value
                    )}
                    onChange={() =>
                      handleOptionChange(optionType, option.product_option_value, true)
                    }
                    className="mr-2"
                  />
                  {option.product_option_value}{" "}
                  {option.product_option_price > 0 ? `(+${option.product_option_price}฿)` : ""}
                </label>
              ))
            ) : (
              <select
                value={selectedOptions[optionType] || ""}
                onChange={(e) =>
                  handleOptionChange(optionType, e.target.value, false)
                }
                className="border rounded px-3 py-2 w-full"
              >
                <option value="">-- เลือก {optionType} --</option>
                {optionList.map((option) => (
                  <option key={option.product_option_value} value={option.product_option_value}>
                    {option.product_option_value}{" "}
                    {option.product_option_price > 0
                      ? `(+${option.product_option_price}฿)`
                      : ""}
                  </option>
                ))}
              </select>
            )}
          </div>
        );
      }
    );
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
            <label className="block font-semibold mb-1">
              รายละเอียดเพิ่มเติม:
            </label>
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

          <Link
            href={`/order/product/${seatQRCode}?seat_qrcode=${seatQRCode}`}
            className="block text-center mt-4"
          >
            <button className="w-full bg-orange-500 text-white py-2 rounded hover:bg-orange-600 transition">
              🍽️ เลือกสินค้าเพิ่ม
            </button>
          </Link>

          <Link href={`/order/product/${seatQRCode}/cart?seat_qrcode=${seatQRCode}`} className="fixed bottom-6 right-6 z-50">
            <button className="bg-green-600 text-white px-5 py-2 rounded-full shadow-lg hover:bg-green-700 transition">
              🛒 ไปยังตะกร้า (
              {cart.reduce((sum, item) => sum + (item.quantity || 1), 0)})
            </button>
          </Link>
        </div>
      ) : (
        <div className="flex flex-row gap-2 justify-center items-center mt-100">
          <div className="w-4 h-4 rounded-full bg-blue-700 animate-bounce"></div>
          <div className="w-4 h-4 rounded-full bg-blue-700 animate-bounce [animation-delay:-.1s]"></div>
          <div className="w-4 h-4 rounded-full bg-blue-700 animate-bounce [animation-delay:-.3s]"></div>
        </div>
      )}
    </div>
  );
}

export default Page;
