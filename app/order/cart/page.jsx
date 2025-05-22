"use client";
import { useCart } from "../store/cartContext";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function CartPage() {
  const { cart, addToCart, removeFromCart, clearCart } = useCart();
  const router = useRouter();

  // ฟังก์ชันช่วยคำนวณราคารวมของตัวเลือก (รองรับ array หรือ object)
  const calculateOptionsPrice = (selected_option) => {
    if (!selected_option) return 0;
    let optionTotal = 0;

    for (const key in selected_option) {
      const value = selected_option[key];

      if (Array.isArray(value)) {
        value.forEach((opt) => {
          if (opt && typeof opt === "object" && opt.option_price) {
            optionTotal += Number(opt.option_price);
          }
        });
      } else if (value && typeof value === "object") {
        if (value.option_price) {
          optionTotal += Number(value.option_price);
        }
      }
    }
    return optionTotal;
  };

  // คำนวณราคารวมทั้งหมดในตะกร้า
  const total = cart.reduce((sum, item) => {
    const basePrice = item.product_price || 0;
    const quantity = item.quantity || 0;
    const optionsPrice = calculateOptionsPrice(item.selected_option);
    return sum + quantity * (basePrice + optionsPrice);
  }, 0);

  // ฟังก์ชันแสดงตัวเลือก พร้อมราคาเพิ่ม
  const renderSelectedOptions = (options) => {
    if (!options) return null;

    return Object.entries(options).map(([type, value]) => {
      if (Array.isArray(value)) {
        const totalOptionPrice = value.reduce(
          (sum, v) => sum + (Number(v.option_price) || 0),
          0
        );
        return (
          <div key={type} className="text-sm text-gray-600">
            {type}: {value.map((v) => v.option_value || v).join(", ")}
            {totalOptionPrice > 0 ? ` +${totalOptionPrice} บาท` : ""}
          </div>
        );
      } else if (typeof value === "object" && value !== null) {
        return (
          <div key={type} className="text-sm text-gray-600">
            {type}: {value.option_value || ""}
            {value.option_price ? ` +${Number(value.option_price)} บาท` : ""}
          </div>
        );
      } else {
        return (
          <div key={type} className="text-sm text-gray-600">
            {type}: {value}
          </div>
        );
      }
    });
  };

  const handleConfirm = async () => {
    const seatId = prompt("กรุณาใส่หมายเลขโต๊ะ");

    if (!seatId) {
      alert("กรุณาใส่หมายเลขโต๊ะก่อนสั่งซื้อ");
      return;
    }

    try {
      const cartData = cart.map((item) => ({
        product: {
          product_id: item.product_id,
          product_name: item.product_name,
          product_price: item.product_price,
          quantity: item.quantity,
        },
        seat_id: seatId,
        selected_option: item.selected_option || {},
        description: item.purchase_description || "",
      }));

      const res = await fetch("/api/purchase", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ cart: cartData, seatId }),
      });

      if (res.ok) {
        alert("✅ สั่งซื้อเรียบร้อยแล้ว!");
        clearCart();
        router.push("/order/product");
      } else {
        alert("❌ สั่งซื้อไม่สำเร็จ");
      }
    } catch (err) {
      console.error(err);
      alert("❌ เกิดข้อผิดพลาด");
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">🧾 สรุปรายการสั่งซื้อ</h1>
      {cart.length === 0 ? (
        <p>ไม่มีสินค้าในตะกร้า</p>
      ) : (
        <>
          <ul className="space-y-4">
            {cart.map((item, idx) => (
              <li key={`${item.product_id}-${idx}`} className="border p-3 rounded">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-semibold">
                      {item.product_name} × {item.quantity}
                    </div>

                    {renderSelectedOptions(item.selected_option)}

                    {item.purchase_description && (
                      <div className="text-sm text-gray-600">
                        หมายเหตุ: {item.purchase_description}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => removeFromCart(item)}
                      className="bg-red-500 text-white px-2 rounded"
                    >
                      -
                    </button>
                    <button
                      onClick={() => addToCart(item)}
                      className="bg-green-500 text-white px-2 rounded"
                    >
                      +
                    </button>
                    <div className="font-bold">
                      ฿
                      {item.quantity *
                        (item.product_price + calculateOptionsPrice(item.selected_option))}
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-6 text-right font-bold text-xl">รวม: ฿{total}</div>

          <button
            onClick={() => {
              if (confirm("คุณต้องการล้างตะกร้าทั้งหมดใช่หรือไม่?")) {
                clearCart();
              }
            }}
            className="mt-2 w-full bg-red-600 text-white py-2 rounded hover:bg-red-300"
          >
            🗑 ยกเลิกสินค้าในตะกร้าทั้งหมด
          </button>

          <button
            onClick={() => {
              if (confirm("คุณต้องการยืนยันการสั่งซื้อทั้งหมดใช่หรือไม่?")) {
                handleConfirm();
              }
            }}
            className="mt-4 w-full bg-green-600 text-white py-2 rounded hover:bg-green-300"
          >
            ยืนยันการสั่งซื้อ
          </button>

          <Link href={"/order/product"}>
            <button className="mt-4 w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-300">
              เลือกสินค้าเพิ่ม
            </button>
          </Link>
        </>
      )}
    </div>
  );
}
