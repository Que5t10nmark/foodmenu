"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function KitchenGroupedByProduct() {
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
    const interval = setInterval(fetchOrders, 1000);
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
      setTimeout(() => setMessage(null), 1000);
    } catch (error) {
      console.error("เกิดข้อผิดพลาดในการอัพเดตสถานะ:", error);
      setMessage("เกิดข้อผิดพลาดในการอัพเดตสถานะ");
      setTimeout(() => setMessage(null), 1000);
    }
  };

  if (loading) {
    return <div className="p-6 text-center text-gray-500">กำลังโหลด...</div>;
  }

  const activeOrders = orders.filter(
    (order) =>
      order.purchase_status !== "เสร็จแล้ว" &&
      order.purchase_status !== "ยกเลิก"
  );

  const groupedOrders = activeOrders.reduce((grouped, order) => {
    const name = order.product_name;
    if (!grouped[name]) grouped[name] = [];
    grouped[name].push(order);
    return grouped;
  }, {});

  return (
    <div className="p-6 max-h-screen overflow-auto text-base">
      <div className="mb-4 flex justify-between items-center">
        <h1 className="text-3xl font-bold">🍽️ คำสั่งซื้อ (ตามเมนูอาหาร)</h1>
        <Link href="/kitchen" className="text-blue-600 underline text-lg">
          ดูคำสั่งซื้อแบบกรุ๊ปตามโต๊ะ
        </Link>
      </div>

      {message && (
        <div
          className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
          bg-green-700 text-white border border-green-300 px-6 py-3 
          rounded-xl shadow-lg z-50 animate-fade text-xl"
        >
          {message}
        </div>
      )}

      {Object.keys(groupedOrders).length === 0 ? (
        <div className="text-center text-gray-500 text-2xl">ยังไม่มีคำสั่งซื้อ</div>
      ) : (
        Object.entries(groupedOrders).map(([productName, productOrders]) => {
          const total = productOrders.reduce((sum, o) => sum + o.purchase_quantity, 0);
          return (
            <div key={productName} className="mb-10">
              <div className="font-bold text-5xl mb-4 bg-gray-100 p-4 rounded">
                {productName} — ทั้งหมด {total} จาน
              </div>
              <div className="overflow-x-auto rounded-xl shadow-lg">
                <table className="min-w-full bg-white border border-gray-500 rounded-xl text-3xl">
                  <thead className="bg-gray-300">
                    <tr>
                      <th className="p-3 border-b text-center">โต๊ะ</th>
                      <th className="p-3 border-b text-center">จำนวน</th>
                      <th className="p-3 border-b text-center">ตัวเลือก</th>
                      <th className="p-3 border-b text-center">หมายเหตุ</th>
                      <th className="p-3 border-b text-center">วันที่สั่ง</th>
                      <th className="p-3 border-b text-center">สถานะ</th>
                      <th className="p-3 border-b text-center">การจัดการ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productOrders.map((order) => {
                      let optionsObj = {};
                      if (order.selected_option) {
                        try {
                          optionsObj =
                            typeof order.selected_option === "string"
                              ? JSON.parse(order.selected_option)
                              : order.selected_option;
                        } catch {
                          optionsObj = { ตัวเลือก: order.selected_option };
                        }
                      }

                      return (
                        <tr key={order.purchase_id} className="border-t">
                          <td className="p-3 text-center">{order.seat_id}</td>
                          <td className="p-3 text-center">{order.purchase_quantity}</td>
                          <td className="p-3 text-center">
                            {Object.entries(optionsObj).map(([optionName, optionValue], i) => (
                              <div key={i}>
                                <span className="font-medium">{optionName}:</span>{" "}
                                {Array.isArray(optionValue)
                                  ? optionValue.join(", ")
                                  : optionValue}
                              </div>
                            ))}
                          </td>
                          <td className="p-3 text-center">{order.purchase_description}</td>
                          <td className="p-3 text-center">
                            {new Date(order.purchase_date).toLocaleString("th-TH", {
                              timeZone: "Asia/Bangkok",
                            })}
                          </td>
                          <td className="p-3 text-blue-600 font-semibold text-center">
                            {order.purchase_status}
                          </td>
                          <td className="p-3 space-x-2 flex">
                            <button
                              className="bg-blue-600 hover:bg-blue-300 text-white px-3 py-2 rounded flex-1 text-base"
                              onClick={() =>
                                handleStatusUpdate(order.purchase_id, "กำลังทำ")
                              }
                            >
                              กำลังทำ
                            </button>
                            <button
                              className="bg-green-600 hover:bg-green-300 text-white px-3 py-2 rounded flex-1 text-base"
                              onClick={() =>
                                handleStatusUpdate(order.purchase_id, "เสร็จแล้ว")
                              }
                            >
                              เสร็จแล้ว
                            </button>
                            <button
                              className="bg-red-600 hover:bg-red-300 text-white px-3 py-2 rounded flex-1 text-base"
                              onClick={() =>
                                handleStatusUpdate(order.purchase_id, "ยกเลิก")
                              }
                            >
                              ยกเลิก
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
