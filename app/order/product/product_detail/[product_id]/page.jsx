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

  // ตัวเลือกของลูกค้า
  const [purchase_spiceLevel, setPurchaseSpiceLevel] = useState("ไม่เผ็ด");
  const [purchase_toppings, setPurchaseToppings] = useState([]);
  const [purchase_size, setPurchaseSize] = useState("ธรรมดา");
  const [purchase_description, setPurchaseDescription] = useState("");

  useEffect(() => {
    if (product_id) {
      setLoading(true);
      fetch(`/api/product/${product_id}`)
        .then((res) => res.json())
        .then((data) => {
          setProduct(data);
          setLoading(false);
        })
        .catch((err) => {
          console.error("โหลดสินค้าไม่สำเร็จ", err);
          setLoading(false);
        });
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
    setMessage(`✅ ${product.product_name} ถูกเพิ่มลงในตะกร้าแล้ว`);

    // ล้างข้อความหลัง 3 วินาที
    setTimeout(() => setMessage(""), 1000);
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      {/* กำลังโหลด */}
      {/* {loading && (
        <div className="text-center text-gray-500 py-10">กำลังโหลดสินค้า...</div>
      )} */}

      {/* แสดงข้อมูลสินค้า */}
      {product && !loading && (
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
            <label className="block font-semibold mb-1">
              รายละเอียดเพิ่มเติม:
            </label>
            <textarea
              value={purchase_description}
              onChange={(e) => setPurchaseDescription(e.target.value)}
              className="w-full border rounded px-3 py-2"
              placeholder="เช่น ไม่ใส่ผัก, ใช้น้ำมันน้อย ฯลฯ"
            />
          </div>

          {/* แจ้งเตือนเมื่อเพิ่มลงตะกร้า */}
          {message && (
            <div className="mb-4 p-3 bg-green-100 text-green-700 rounded text-center font-semibold">
              {message}
            </div>
          )}

          {/* ปุ่มเพิ่มลงตะกร้า */}
          <button
            className="mt-4 w-full bg-green-500 text-white py-2 rounded hover:bg-green-600 transition"
            onClick={() => handleAddToCart(product)}
          >
            ✅ เพิ่มในตะกร้า
          </button>

          {/* ปุ่มกลับไปเลือกสินค้าเพิ่ม */}
          <Link href={"/order/product"} className="block text-center mt-4">
            <button className="w-full bg-orange-500 text-white py-2 rounded hover:bg-orange-600 transition">
              🍽️ เลือกสินค้าเพิ่ม
            </button>
          </Link>

          {/* ปุ่มลอยไปยังตะกร้า */}
          <Link href={`/order/cart`} className="fixed bottom-6 right-6 z-50">
            <button className="bg-green-600 text-white px-5 py-2 rounded-full shadow-lg hover:bg-green-700 transition">
              🛒 ไปยังตะกร้า (
              {cart.reduce((sum, item) => sum + item.quantity, 0)})
            </button>
          </Link>
        </div>
      )}
    </div>
  );
}

export default Page;
