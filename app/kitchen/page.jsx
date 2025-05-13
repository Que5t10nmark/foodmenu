"use client";
import { useEffect, useState } from "react";

export default function KitchenPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const now = new Date().toISOString();

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

    fetchOrders(); // โหลดครั้งแรก

    const interval = setInterval(fetchOrders, 2000); // โหลดซ้ำทุก 2 วิ

    return () => clearInterval(interval); // เคลียร์เมื่อ component ถูก unmount
  }, []);
  // ฟังก์ชันสำหรับอัพเดตสถานะคำสั่งซื้อ
  const handleStatusUpdate = async (purchaseId, newStatus) => {
    try {
      const response = await fetch(`/api/purchase/${purchaseId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error("ไม่สามารถอัพเดตสถานะคำสั่งซื้อได้");
      }

      setOrders((prev) =>
        prev.map((order) =>
          order.purchase_id === purchaseId
            ? { ...order, purchase_status: newStatus }
            : order
        )
      );
    } catch (error) {
      console.error("เกิดข้อผิดพลาดในการอัพเดตสถานะ:", error);
    }
  };

  if (loading) {
    return <div className="p-6 text-center text-gray-500">กำลังโหลด...</div>;
  }
  
  // แยกคำสั่งซื้อโดยโต๊ะ
  const groupedOrders = orders.reduce((acc, order) => {
    if (!acc[order.seat_id]) {
      acc[order.seat_id] = [];
    }
    acc[order.seat_id].push(order);
    return acc;
  }, {});

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">🍳 คำสั่งซื้อของห้องครัว</h1>

      {Object.keys(groupedOrders).length === 0 ? (
        <div className="text-center text-gray-500">ยังไม่มีคำสั่งซื้อ</div>
      ) : (
        Object.keys(groupedOrders).map((seatId) => (
          <div key={seatId} className="mb-6">
            <div className="font-bold text-xl mb-4">โต๊ะ: {seatId}</div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {groupedOrders[seatId].map((order) => (
                <div
                  key={order.purchase_id}
                  className="border rounded-xl shadow p-4 bg-white"
                >
                  <div className="font-bold text-lg">{order.product_name}</div>
                  <div className="text-sm text-gray-600 mb-2">
                    จำนวน: {order.purchase_quantity}
                  </div>
                  <div className="text-sm text-gray-600 mb-2">
                    ราคา: ฿{order.product_price * order.purchase_quantity}
                  </div>
                  <ul className="text-sm mb-2">
                    {order.purchase_size && (
                      <li>ขนาด: {order.purchase_size}</li>
                    )}
                    {order.purchase_spiceLevel && (
                      <li>ระดับความเผ็ด: {order.purchase_spiceLevel}</li>
                    )}
                    {order.purchase_toppings &&
                      order.purchase_toppings !== "[]" && (
                        <li>
                          ท็อปปิ้ง:{" "}
                          {Array.isArray(order.purchase_toppings)
                            ? order.purchase_toppings.join(", ")
                            : JSON.parse(order.purchase_toppings).join(", ")}
                        </li>
                      )}
                    {order.purchase_description && (
                      <li>หมายเหตุ: {order.purchase_description}</li>
                    )}
                  </ul>
                  <div className="text-sm mb-1">
                    วันที่สั่ง:{" "}
                    {new Date(order.purchase_date).toLocaleString("th-TH", {
                      timeZone: "Asia/Bangkok",
                    })}
                  </div>

                  <div className="text-sm">
                    สถานะ:{" "}
                    <span className="font-semibold text-blue-600">
                      {order.purchase_status}
                    </span>
                  </div>
                  <div className="flex space-x-2 mt-2">
                    <button
                      className="bg-blue-500 text-white px-3 py-1 rounded"
                      onClick={() =>
                        handleStatusUpdate(order.purchase_id, "กำลังทำ")
                      }
                    >
                      กำลังทำ
                    </button>
                    <button
                      className="bg-green-600 text-white px-3 py-1 rounded"
                      onClick={() =>
                        handleStatusUpdate(order.purchase_id, "เสร็จแล้ว")
                      }
                    >
                      เสร็จแล้ว
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
