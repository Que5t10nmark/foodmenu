"use client";
import { useEffect, useState } from "react";

export default function FinishedOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFinishedOrders = () => {
      fetch("/api/purchase?status=เสร็จแล้ว")
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

    fetchFinishedOrders(); // โหลดครั้งแรก

    const interval = setInterval(fetchFinishedOrders, 2000); // รีเฟรชทุก 2 วินาที
    return () => clearInterval(interval); // ล้าง interval เมื่อ component ถูก unmount
  }, []);

  if (loading) return <div className="p-6 text-center">กำลังโหลด...</div>;

  // แบ่งกลุ่มตามโต๊ะ
  const groupedOrders = orders.reduce((acc, order) => {
    if (!acc[order.seat_id]) acc[order.seat_id] = [];
    acc[order.seat_id].push(order);
    return acc;
  }, {});

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">📦 คำสั่งซื้อที่เสร็จแล้ว</h1>

      {Object.keys(groupedOrders).length === 0 ? (
        <div className="text-center text-gray-500">ยังไม่มีคำสั่งซื้อที่เสร็จแล้ว</div>
      ) : (
        Object.keys(groupedOrders).map((seatId) => (
          <div key={seatId} className="mb-6">
            <div className="font-bold text-xl mb-4">โต๊ะ: {seatId}</div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {groupedOrders[seatId].map((order) => (
                <div
                  key={order.purchase_id}
                  className="border rounded-xl shadow p-4 bg-white"
                >
                  <div className="font-bold text-lg">{order.product_name}</div>
                  <div className="text-sm text-gray-600 mb-1">
                    จำนวน: {order.purchase_quantity}
                  </div>
                  <div className="text-sm text-gray-600 mb-1">
                    ราคา: ฿{order.product_price * order.purchase_quantity}
                  </div>
                  <ul className="text-sm mb-2">
                    {order.purchase_size && <li>ขนาด: {order.purchase_size}</li>}
                    {order.purchase_spiceLevel && (
                      <li>ระดับความเผ็ด: {order.purchase_spiceLevel}</li>
                    )}
                    {order.purchase_toppings && order.purchase_toppings !== "[]" && (
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
                  <div className="text-sm">
                    วันที่สั่ง:{" "}
                    {new Date(order.purchase_date).toLocaleString("th-TH", {
                      timeZone: "Asia/Bangkok",
                    })}
                  </div>
                  <div className="text-sm font-semibold text-green-600">
                    สถานะ: {order.purchase_status}
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
