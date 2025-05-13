"use client";
import { useCart } from "../store/cartContext";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function CartPage() {
  const { cart, addToCart, removeFromCart, clearCart } = useCart();
  const router = useRouter();

  const total = cart.reduce(
    (sum, item) => sum + item.quantity * item.product_price,
    0
  );

  const handleConfirm = async () => {
    const seatId = prompt("กรุณาใส่หมายเลขโต๊ะ"); // หรือคุณกำหนดจาก QR

    if (!seatId) {
      alert("กรุณาใส่หมายเลขโต๊ะก่อนสั่งซื้อ");
      return;
    }

    try {
      // แปลงข้อมูล cart ให้อยู่ในรูปแบบที่ API คาดหวัง
      const cartData = cart.map((item) => ({
        product: {
          product_id: item.product_id,
          product_name: item.product_name,
          product_price: item.product_price,
          quantity: item.quantity,
        },
        seat_id: seatId,
        size: item.purchase_size || "ธรรมดา",
        spiceLevel: item.purchase_spiceLevel || "ไม่เผ็ด",
        toppings: item.purchase_toppings || [],
        description: item.purchase_description || "",
      }));

      const res = await fetch("/api/purchase", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cart: cartData,  // ส่งข้อมูลในรูปแบบใหม่ที่ตรงตามที่ API ต้องการ
          seatId,
        }),
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
            {cart.map((item) => (
              <li
                key={item.product_id + item.purchase_description}
                className="border p-3 rounded"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-semibold">
                      {item.product_name} × {item.quantity}
                    </div>
                    <div className="text-sm text-gray-600">
                      ขนาด: {item.purchase_size || "ธรรมดา"} | เผ็ด:{" "}
                      {item.purchase_spiceLevel || "ไม่เผ็ด"}
                    </div>
                    {item.purchase_toppings?.length > 0 && (
                      <div className="text-sm text-gray-600">
                        ท็อปปิ้ง: {item.purchase_toppings.join(", ")}
                      </div>
                    )}
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
