"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function KitchenPage() {
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

      setOrders((prevOrders) =>
        prevOrders.map((order) =>
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

  // กรุ๊ปตามโต๊ะ
  const seatGroupedOrders = activeOrders.reduce((groupedBySeat, order) => {
    if (!groupedBySeat[order.seat_id]) groupedBySeat[order.seat_id] = [];
    groupedBySeat[order.seat_id].push(order);
    return groupedBySeat;
  }, {});

  return (
    <div className="p-6 max-h-screen overflow-auto">
      <div className="mb-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">🍳 คำสั่งซื้อ (ตามโต๊ะ)</h1>
        <div>
          <Link
            href="/kitchen/kitchen_detail"
            className="text-blue-600 underline text-sm mr-4"
          >
            ดูคำสั่งซื้อแบบกรุ๊ปตามสินค้า
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

      {Object.keys(seatGroupedOrders).length === 0 ? (
        <div className="text-center text-gray-500">ยังไม่มีคำสั่งซื้อ</div>
      ) : (
        Object.entries(seatGroupedOrders).map(([seatId, seatOrders]) => (
          <div key={seatId} className="mb-8">
            <div className="font-bold text-xl mb-4 bg-gray-100 p-2 rounded">
              โต๊ะ: {seatId}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
              {seatOrders.map((order) => {
                let optionsObject = {};

                if (order.selected_option) {
                  if (typeof order.selected_option === "string") {
                    try {
                      optionsObject = JSON.parse(order.selected_option);
                    } catch {
                      return <p key={order.purchase_id}>{order.selected_option}</p>;
                    }
                  } else {
                    optionsObject = order.selected_option;
                  }
                }

                return (
                  <div
                    key={order.purchase_id}
                    className="border rounded-xl shadow p-4 bg-white"
                  >
                    <div className="font-bold text-2xl">{order.product_name}</div>
                    <div className="text-lg text-gray-600 mb-2">
                      จำนวน: {order.purchase_quantity}
                    </div>
                    <div className="text-lg text-gray-600 mb-2">
                      ราคา: ฿{order.product_price * order.purchase_quantity}
                    </div>

                    {Object.entries(optionsObject).length > 0 && (
                      <div className="mb-3 text-lg leading-relaxed">
                        {Object.entries(optionsObject).map(([optionKey, optionVal], idx) => {
                          const displayVal = Array.isArray(optionVal)
                            ? optionVal.join(", ")
                            : optionVal;
                          return (
                            <p key={idx} className="mb-2">
                              <span className="font-semibold">{optionKey}:</span>{" "}
                              {displayVal}
                            </p>
                          );
                        })}
                      </div>
                    )}

                    {order.purchase_description && (
                      <p className="text-lg mb-2">
                        <span className="font-semibold">หมายเหตุ:</span>{" "}
                        {order.purchase_description}
                      </p>
                    )}

                    <div className="text-lg mb-1">
                      วันที่สั่ง:{" "}
                      {new Date(order.purchase_date).toLocaleString("th-TH", {
                        timeZone: "Asia/Bangkok",
                      })}
                    </div>

                    <div className="text-lg mb-1">
                      สถานะ:{" "}
                      <span className="font-semibold text-blue-600">
                        {order.purchase_status}
                      </span>
                    </div>

                    <div className="flex space-x-2 mt-3 flex-wrap">
                      <button
                        className="bg-blue-600 hover:bg-blue-300 text-white px-3 py-1 rounded"
                        onClick={() =>
                          handleStatusUpdate(order.purchase_id, "กำลังทำ")
                        }
                      >
                        กำลังทำ
                      </button>
                      <button
                        className="bg-green-600 hover:bg-green-300 text-white px-3 py-1 rounded"
                        onClick={() =>
                          handleStatusUpdate(order.purchase_id, "เสร็จแล้ว")
                        }
                      >
                        เสร็จแล้ว
                      </button>
                      <button
                        className="bg-red-600 hover:bg-red-300 text-white px-3 py-1 rounded"
                        onClick={() =>
                          handleStatusUpdate(order.purchase_id, "ยกเลิก")
                        }
                      >
                        ยกเลิก
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
