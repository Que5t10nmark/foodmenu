"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function KitchenProductPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    const fetchOrders = () => {
      fetch("/api/purchase")
        .then((res) => res.json())
        .then((data) => {
          setOrders(data);
          setLoading(false);
        })
        .catch((err) => {
          console.error("โหลดคำสั่งซื้อไม่สำเร็จ", err);
          setLoading(false);
        });
    };

    fetchOrders();
    const interval = setInterval(fetchOrders, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleStatusUpdate = async (purchaseId, newStatus) => {
    try {
      const response = await fetch(`/api/purchase/${purchaseId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error("ไม่สามารถอัพเดตสถานะคำสั่งซื้อได้");

      setOrders((prev) =>
        prev.map((order) =>
          order.purchase_id === purchaseId
            ? { ...order, purchase_status: newStatus }
            : order
        )
      );

      setMessage(`อัปเดตสถานะเป็น "${newStatus}" สำเร็จ`);
      setTimeout(() => setMessage(null), 2000);
    } catch (error) {
      console.error("เกิดข้อผิดพลาดในการอัพเดตสถานะ:", error);
      setMessage("เกิดข้อผิดพลาดในการอัพเดตสถานะ");
      setTimeout(() => setMessage(null), 2000);
    }
  };

  if (loading) {
    return <div className="p-6 text-center text-gray-500">กำลังโหลด...</div>;
  }

  // กรองเอาเฉพาะออเดอร์ที่ยังไม่เสร็จและไม่ถูกยกเลิก
  const activeOrders = orders.filter(
    (order) =>
      order.purchase_status !== "เสร็จแล้ว" &&
      order.purchase_status !== "ยกเลิก"
  );

  // กรุ๊ปตาม product_id
  const groupedByProduct = activeOrders.reduce((acc, order) => {
    if (!acc[order.product_id]) acc[order.product_id] = [];
    acc[order.product_id].push(order);
    return acc;
  }, {});

  return (
    <div className="p-6 max-h-screen overflow-auto">
      <div className="mb-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">🍳 คำสั่งซื้อของห้องครัว (กรุ๊ปตามสินค้า)</h1>
        <div>
          <Link
            href="/kitchen/kitchen_detail"
            className="text-blue-600 underline text-sm mr-4"
          >
            ดูคำสั่งซื้อที่เสร็จแล้ว
          </Link>
          <Link href="/kitchen" className="text-blue-600 underline text-sm">
            ดูคำสั่งซื้อแบบกรุ๊ปตามโต๊ะ
          </Link>
        </div>
      </div>

      {message && (
        <div
          className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
          bg-green-700 text-white border border-green-300 px-6 py-3 
          rounded-xl shadow-lg z-50 animate-fade"
        >
          {message}
        </div>
      )}

      {Object.keys(groupedByProduct).length === 0 ? (
        <div className="text-center text-gray-500">ยังไม่มีคำสั่งซื้อ</div>
      ) : (
        Object.entries(groupedByProduct).map(([productId, orders]) => {
          // รวมจำนวนและโต๊ะที่สั่ง (ไม่ซ้ำกัน)
          const totalQuantity = orders.reduce(
            (sum, order) => sum + order.purchase_quantity,
            0
          );
          const tables = [...new Set(orders.map((o) => o.seat_id))];

          // ข้อมูลสินค้าเลือก order แรกแทน
          const orderExample = orders[0];

          return (
            <div key={productId} className="mb-10">
              <div className="font-bold text-xl mb-3 bg-gray-100 p-2 rounded">
                {orderExample.product_name}
              </div>

              <div className="overflow-x-auto border rounded-lg shadow">
                <table className="min-w-full text-sm text-left">
                  <thead className="bg-gray-200">
                    <tr>
                      <th className="px-4 py-2 border-r">โต๊ะ</th>
                      <th className="px-4 py-2 border-r">จำนวน</th>
                      <th className="px-4 py-2 border-r">ราคา</th>
                      <th className="px-4 py-2 border-r">ขนาด</th>
                      <th className="px-4 py-2 border-r">ระดับความเผ็ด</th>
                      <th className="px-4 py-2 border-r">ท็อปปิ้ง</th>
                      <th className="px-4 py-2 border-r">หมายเหตุ</th>
                      <th className="px-4 py-2 border-r">วันที่สั่ง</th>
                      <th className="px-4 py-2 border-r">สถานะ</th>
                      <th className="px-4 py-2">จัดการ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr
                        key={order.purchase_id}
                        className="even:bg-gray-50 odd:bg-white"
                      >
                        <td className="border px-3 py-2">{order.seat_id}</td>
                        <td className="border px-3 py-2">{order.purchase_quantity}</td>
                        <td className="border px-3 py-2">
                          ฿{order.product_price * order.purchase_quantity}
                        </td>
                        <td className="border px-3 py-2">{order.purchase_size || "-"}</td>
                        <td className="border px-3 py-2">{order.purchase_spiceLevel || "-"}</td>
                        <td className="border px-3 py-2 max-w-xs">
                          {order.purchase_toppings &&
                          order.purchase_toppings !== "[]"
                            ? Array.isArray(order.purchase_toppings)
                              ? order.purchase_toppings.join(", ")
                              : JSON.parse(order.purchase_toppings).join(", ")
                            : "-"}
                        </td>
                        <td className="border px-3 py-2 max-w-xs break-words">
                          {order.purchase_description || "-"}
                        </td>
                        <td className="border px-3 py-2 whitespace-nowrap">
                          {new Date(order.purchase_date).toLocaleString("th-TH", {
                            timeZone: "Asia/Bangkok",
                          })}
                        </td>
                        <td className="border px-3 py-2 text-blue-600 font-semibold">
                          {order.purchase_status}
                        </td>
                        <td className="border px-3 py-2 space-x-1 flex flex-wrap">
                          <button
                            className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-xs"
                            onClick={() =>
                              handleStatusUpdate(order.purchase_id, "กำลังทำ")
                            }
                          >
                            กำลังทำ
                          </button>
                          <button
                            className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded text-xs"
                            onClick={() =>
                              handleStatusUpdate(order.purchase_id, "เสร็จแล้ว")
                            }
                          >
                            เสร็จแล้ว
                          </button>
                          <button
                            className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs"
                            onClick={() =>
                              handleStatusUpdate(order.purchase_id, "ยกเลิก")
                            }
                          >
                            ยกเลิก
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-3 text-sm text-gray-700">
                รวมจำนวนทั้งหมด: <span className="font-semibold">{totalQuantity}</span> ชิ้น | สั่งจากโต๊ะ:{" "}
                <span className="font-semibold">{tables.join(", ")}</span>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
