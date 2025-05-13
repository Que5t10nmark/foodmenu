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
  const [purchase_spiceLevel, setPurchaseSpiceLevel] = useState("ไม่เผ็ด");
  const [purchase_toppings, setPurchaseToppings] = useState([]);
  const [purchase_size, setPurchaseSize] = useState("ธรรมดา");
  const [purchase_description, setPurchaseDescription] = useState("");

  useEffect(() => {
    if (product_id) {
      fetch(`/api/product/${product_id}`)
        .then((res) => res.json())
        .then(setProduct)
        .catch((err) => console.error("โหลดสินค้าไม่สำเร็จ", err));
    }
  }, [product_id]);

  const handleToppingChange = (topping) => {
    setPurchaseToppings((prev) =>
      prev.includes(topping)
        ? prev.filter((t) => t !== topping)
        : [...prev, topping]
    );
  };

  const handleAddToCart = (product) => {
    const updatedProduct = {
      ...product,
      purchase_size,
      purchase_spiceLevel,
      purchase_toppings,
      purchase_description,
    };
    addToCart(updatedProduct);
    alert(`✅ ${product.product_name} ถูกเพิ่มลงในตะกร้าแล้ว`);
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      {product ? (
        <div className="bg-white rounded-xl shadow p-4">
          <h1 className="text-3xl font-bold mb-4">{product.product_name}</h1>
          <Image
            src={`/uploads/${product.product_image}`}
            alt={product.product_name || "รูปภาพสินค้า"}
            width={400}
            height={400}
            className="rounded mb-4"
          />

          {/* ระดับความเผ็ด */}
          <div className="mb-4">
            <label className="block font-semibold mb-1">ระดับความเผ็ด:</label>
            <select
              value={purchase_spiceLevel}
              onChange={(e) => setPurchaseSpiceLevel(e.target.value)}
              className="border rounded px-3 py-2 w-full"
            >
              <option>ไม่เผ็ด</option>
              <option>เผ็ดน้อย</option>
              <option>เผ็ดมาก</option>
            </select>
          </div>

          {/* ท็อปปิ้ง */}
          <div className="mb-4">
            <label className="block font-semibold mb-1">เพิ่มท็อปปิ้ง:</label>
            {["ไข่ดาว", "ไข่เจียว", "ชีส"].map((topping) => (
              <label key={topping} className="flex items-center mb-1">
                <input
                  type="checkbox"
                  checked={purchase_toppings.includes(topping)}
                  onChange={() => handleToppingChange(topping)}
                  className="mr-2"
                />
                {topping}
              </label>
            ))}
          </div>

          {/* ขนาดอาหาร */}
          <div className="mb-4">
            <label className="block font-semibold mb-1">ขนาด:</label>
            <select
              value={purchase_size}
              onChange={(e) => setPurchaseSize(e.target.value)}
              className="border rounded px-3 py-2 w-full"
            >
              <option>ธรรมดา</option>
              <option>พิเศษ</option>
            </select>
          </div>

          {/* คำแนะนำเพิ่มเติม */}
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
            <div className="mb-4 p-2 bg-green-100 text-green-700 rounded">
              {message}
            </div>
          )}

          <button
            className="mt-4 w-full bg-green-500 text-white py-2 rounded hover:bg-green-300"
            onClick={() => handleAddToCart(product)}
          >
            เพิ่มในตะกร้า
          </button>

          <Link href={"/order/product"} className="block text-center mt-4">
            <button className="mt-4 w-full bg-orange-500 text-white py-2 rounded hover:bg-orange-300">
              เลือกสินค้าเพิ่ม
            </button>
          </Link>
          <Link href={`/order/cart`} className="fixed bottom-6 right-6 z-50">
            <button className="bg-green-600 text-white px-4 py-2 rounded-full shadow-lg">
              🛒 ไปยังตะกร้า (
              {cart.reduce((sum, item) => sum + item.quantity, 0)})
            </button>
          </Link>
        </div>
      ) : (
        <div className="text-center py-20 text-gray-500">
          กำลังโหลดสินค้า...
        </div>
      )
      }
    </div>
  );
}

export default Page;
