"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function MyOrderPage({ params }) {
  const seatId = params.seatId; // สมมุติว่า seatId ส่งมาจาก URL หรือ props
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const fetchOrders = async () => {
      const res = await fetch(`/api/purchase`);
      const data = await res.json();
      setOrders(data);
    };

    fetchOrders();
    const interval = setInterval(fetchOrders, 3000); 

    return () => clearInterval(interval);
  }, [seatId]);

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h1 className="text-xl font-bold mb-4">🍽 รายการของคุณ</h1>
      {orders.length === 0 ? (
        <div className="text-gray-500">ยังไม่มีคำสั่งซื้อ</div>
      ) : (
        <ul className="space-y-3">
          {orders.map((order) => (
            <li
              key={order.purchase_id}
              className="border p-4 rounded shadow bg-white"
            >
              <div className="font-bold">{order.product_name}</div>
              <div className="text-sm">จำนวน: {order.purchase_quantity}</div>
              <div className="text-sm">ราคา: {order.product_price} บาท</div>
              <div className="text-sm">สถานะ: <span className="font-semibold">{order.purchase_status}</span></div>
            </li>
          ))}
        </ul>
      )}
          <Link href={"/order/product"} className="fixed bottom-6 left-6 z-50">
            <button className="bg-red-600 text-white px-4 py-2 rounded-full shadow-lg">
              กลับ
            </button>
          </Link>
    </div>
    
  );
}
