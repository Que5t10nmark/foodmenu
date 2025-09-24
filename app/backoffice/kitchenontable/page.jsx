"use client";
import { useEffect, useState } from "react";

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

  const calculateOptionsPrice = (selectedOptions) => {
    if (!selectedOptions || typeof selectedOptions !== "object") return 0;
    let totalOptionPrice = 0;
    for (const optionType in selectedOptions) {
      const optionValues = selectedOptions[optionType];
      if (Array.isArray(optionValues)) {
        totalOptionPrice += optionValues.reduce(
          (sum, opt) => sum + (Number(opt.product_option_price) || 0),
          0
        );
      } else if (typeof optionValues === "object" && optionValues !== null) {
        totalOptionPrice += Number(optionValues.product_option_price) || 0;
      }
    }
    return totalOptionPrice;
  };

  const calculateTotalPrice = (order) => {
    const basePrice = Number(order.product_price || 0);
    const quantity = Number(order.purchase_quantity || 1);
    const optionPrice = calculateOptionsPrice(
      typeof order.selected_option === "string"
        ? JSON.parse(order.selected_option || "{}")
        : order.selected_option || {}
    );
    return (basePrice + optionPrice) * quantity;
  };

  const renderSelectedOptions = (selectedOptions) => {
    if (!selectedOptions || typeof selectedOptions !== "object") return null;
    return Object.entries(selectedOptions).map(([optionType, optionValues]) => {
      if (Array.isArray(optionValues)) {
        const displayValue = optionValues
          .map((opt) => opt.product_option_value)
          .filter(Boolean)
          .join(", ");
        const totalPrice = optionValues.reduce(
          (sum, opt) => sum + (Number(opt.product_option_price) || 0),
          0
        );
        return (
          <div key={optionType} className="text-2xl text-gray-700">
            <span className="font-semibold">{optionType}:</span> {displayValue}
            {totalPrice > 0 ? ` (+${totalPrice.toFixed(2)} บาท)` : ""}
          </div>
        );
      } else if (typeof optionValues === "object" && optionValues !== null) {
        const displayValue = optionValues.product_option_value || "";
        const price = Number(optionValues.product_option_price) || 0;
        return (
          <div key={optionType} className="text-2xl text-gray-700">
            <span className="font-semibold">{optionType}:</span> {displayValue}
            {price > 0 ? ` (+${price.toFixed(2)} บาท)` : ""}
          </div>
        );
      }
      return null;
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "รอดำเนินการ":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "กำลังทำ":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "เสร็จแล้ว":
        return "bg-green-100 text-green-800 border-green-200";
      case "ยกเลิก":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "รอดำเนินการ":
        return "📋";
      case "กำลังทำ":
        return "👨‍🍳";
      case "เสร็จแล้ว":
        return "✅";
      case "ยกเลิก":
        return "❌";
      default:
        return "📋";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-4xl text-gray-600">กำลังโหลด...</div>
    );
  }

  const activeOrders = orders.filter(
    (order) =>
      order.purchase_status !== "เสร็จแล้ว" && order.purchase_status !== "ยกเลิก"
  );

  const seatGroupedOrders = activeOrders.reduce((groupedBySeat, order) => {
    if (!groupedBySeat[order.seat_id]) groupedBySeat[order.seat_id] = [];
    groupedBySeat[order.seat_id].push(order);
    return groupedBySeat;
  }, {});

  // เรียงลำดับตามเวลาสั่ง (จากเก่าไปใหม่)
  Object.keys(seatGroupedOrders).forEach((seatId) => {
    seatGroupedOrders[seatId].sort((a, b) => new Date(a.purchase_date) - new Date(b.purchase_date));
  });

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans">
      <h1 className="text-4xl font-bold text-gray-800 mb-9 text-center">🍽️ คำสั่งซื้อ (จัดกลุ่มตามโต๊ะ)</h1>

      {message && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-green-100 text-green-800 px-8 py-6 rounded-lg shadow-lg z-50 text-4xl">
          {message}
        </div>
      )}

      {Object.keys(seatGroupedOrders).length === 0 ? (
        <div className="text-center text-4xl text-gray-500 mt-40">ยังไม่มีคำสั่งซื้อที่ใช้งานอยู่</div>
      ) : (
        <div className="space-y-16">
          {Object.entries(seatGroupedOrders).map(([seatId, seatOrders]) => (
            <div key={seatId} className="bg-white rounded-2xl shadow-md p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-5xl font-semibold text-gray-800">🪑 โต๊ะ {seatId}</h2>
                <span className="text-3xl text-gray-600">ทั้งหมด {seatOrders.length} รายการ</span>
              </div>
              <div className="overflow-x-auto">
                <div className="flex gap-8">
                  {seatOrders.map((order) => {
                    const selectedOptions =
                      typeof order.selected_option === "string"
                        ? JSON.parse(order.selected_option || "{}")
                        : order.selected_option || {};
                    return (
                      <div
                        key={order.purchase_id}
                        className="bg-white border border-gray-300 rounded-xl p-6 hover:shadow-xl transition-all duration-200 min-w-[22rem] flex-shrink-0"
                      >
                        <div className="flex justify-between items-start mb-6">
                          <h3 className="font-bold text-gray-800 text-3xl">
                            {order.product_name}
                          </h3>
                          <span
                            className={`px-4 py-2 rounded-full text-xl font-medium border ${getStatusColor(
                              order.purchase_status
                            )}`}
                          >
                            {getStatusIcon(order.purchase_status)}{" "}
                            {order.purchase_status}
                          </span>
                        </div>

                        <div className="space-y-4 text-2xl mb-6">
                          <div className="flex justify-between">
                            <span className="text-gray-600">จำนวน:</span>
                            <span className="text-gray-800">
                              {order.purchase_quantity}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">ราคา:</span>
                            <span className="text-gray-800 font-semibold">
                              ฿{calculateTotalPrice(order).toFixed(2)}
                            </span>
                          </div>
                        </div>

                        {selectedOptions &&
                          Object.keys(selectedOptions).length > 0 && (
                            <div className="mb-6">
                              <p className="font-medium text-gray-700 text-2xl mb-3">
                                ตัวเลือก:
                              </p>
                              <div className="space-y-2">
                                {renderSelectedOptions(selectedOptions)}
                              </div>
                            </div>
                          )}

                        <div className="text-xl text-gray-500 mb-6">
                          วันที่สั่ง:{" "}
                          {new Date(order.purchase_date).toLocaleString(
                            "th-TH",
                            { timeZone: "Asia/Bangkok" }
                          )}
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                          <button
                            className={`px-6 py-3 text-xl font-medium rounded-full transition-all duration-200 hover:scale-105 bg-blue-500 text-white hover:bg-blue-600 cursor-pointer ${
                              order.purchase_status === "กำลังทำ"
                                ? "opacity-50 cursor-not-allowed"
                                : "hover:shadow-md"
                            }`}
                            onClick={() =>
                              handleStatusUpdate(order.purchase_id, "กำลังทำ")
                            }
                            disabled={order.purchase_status === "กำลังทำ"}
                          >
                            👨‍🍳 กำลังทำ
                          </button>
                          <button
                            className={`px-6 py-3 text-xl font-medium rounded-full transition-all duration-200 hover:scale-105 bg-green-500 text-white hover:bg-green-600 cursor-pointer ${
                              order.purchase_status === "เสร็จแล้ว"
                                ? "opacity-50 cursor-not-allowed"
                                : "hover:shadow-md"
                            }`}
                            onClick={() =>
                              handleStatusUpdate(order.purchase_id, "เสร็จแล้ว")
                            }
                            disabled={order.purchase_status === "เสร็จแล้ว"}
                          >
                            ✅ เสร็จแล้ว
                          </button>
                          <button
                            className={`px-6 py-3 text-xl font-medium rounded-full transition-all duration-200 hover:scale-105 bg-red-500 text-white hover:bg-red-600 cursor-pointer ${
                              order.purchase_status === "ยกเลิก"
                                ? "opacity-50 cursor-not-allowed"
                                : "hover:shadow-md"
                            }`}
                            onClick={() =>
                              handleStatusUpdate(order.purchase_id, "ยกเลิก")
                            }
                            disabled={order.purchase_status === "ยกเลิก"}
                          >
                            ❌ ยกเลิก
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}