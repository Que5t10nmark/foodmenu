"use client";
import { useCart } from "../store/cartContext";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function CartPage() {
  const { cart, addToCart, removeFromCart, clearCart } = useCart();
  const router = useRouter();

  const total = cart.reduce((sum, item) => {
    let optionTotal = 0;

    if (item.selected_options) {
      for (const values of Object.values(item.selected_options)) {
        if (Array.isArray(values)) {
          optionTotal += values.length; // ราคาต่อ option จะเพิ่มใน backend หากจำเป็น
        } else {
          optionTotal += 1;
        }
      }
    }

    return sum + item.quantity * item.product_price; // คุณสามารถรวมราคาตัวเลือกได้หากต้องการ
  }, 0);

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
        selected_options: item.selected_options || {},
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

  const renderSelectedOptions = (options) => {
    if (!options) return null;

    return Object.entries(options).map(([type, value]) => (
      <div key={type} className="text-sm text-gray-600">
        {type}:{" "}
        {Array.isArray(value) ? value.join(", ") : value}
      </div>
    ));
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
              <li
                key={`${item.product_id}-${idx}`}
                className="border p-3 rounded"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-semibold">
                      {item.product_name} × {item.quantity}
                    </div>

                    {/* แสดงตัวเลือกทั้งหมดแบบ dynamic */}
                    {renderSelectedOptions(item.selected_options)}

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
                      ฿{item.quantity * item.product_price}
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

      <Link href={`/order/product`} className="fixed bottom-6 left-6 z-50">
        <button className="bg-red-600 text-white px-4 py-2 rounded-full shadow-lg">
          กลับ
        </button>
      </Link>
    </div>
  );
}
