"use client";
import { useEffect, useState } from "react";

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

  const handleStatusUpdate = async (productName, newStatus) => {
    try {
      const targetOrders = orders.filter(order => order.product_name === productName);
      const response = await Promise.all(
        targetOrders.map(order =>
          fetch(`/api/purchase/${order.purchase_id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: newStatus }),
          })
        )
      );

      if (!response.every(res => res.ok)) {
        throw new Error("ไม่สามารถอัพเดตสถานะคำสั่งซื้อได้");
      }

      setOrders(prev =>
        prev.map(order =>
          order.product_name === productName ? { ...order, purchase_status: newStatus } : order
        )
      );

      setMessage(`อัปเดตสถานะเป็น "${newStatus}" สำเร็จสำหรับ ${productName}`);
      setTimeout(() => setMessage(null), 2000);
    } catch (error) {
      console.error("เกิดข้อผิดพลาดในการอัพเดตสถานะ:", error);
      setMessage("เกิดข้อผิดพลาดในการอัพเดตสถานะ");
      setTimeout(() => setMessage(null), 2000);
    }
  };

  const renderSelectedOptions = (selectedOptions) => {
    if (!selectedOptions || typeof selectedOptions !== "object") return "-";
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("th-TH", {
      timeZone: "Asia/Bangkok",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen text-4xl text-gray-600">กำลังโหลด...</div>;
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

  Object.keys(groupedOrders).forEach((productName) => {
    groupedOrders[productName].sort((a, b) => new Date(a.purchase_date) - new Date(b.purchase_date));
  });

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans">
      <h1 className="text-4xl font-bold text-gray-800 mb-9 text-center">🍽️ คำสั่งซื้อ (จัดกลุ่มตามเมนู)</h1>

      {message && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-green-100 text-green-800 px-8 py-6 rounded-lg shadow-lg z-50 text-4xl">
          {message}
        </div>
      )}

      {Object.keys(groupedOrders).length === 0 ? (
        <div className="text-center text-4xl text-gray-500 mt-40">ยังไม่มีคำสั่งซื้อที่ใช้งานอยู่</div>
      ) : (
        <div className="space-y-16">
          {Object.entries(groupedOrders).map(([productName, productOrders]) => {
            const totalQuantity = productOrders.reduce((sum, o) => sum + o.purchase_quantity, 0);
            const uniqueStatus = new Set(productOrders.map(o => o.purchase_status));
            const displayStatus = uniqueStatus.size === 1 ? [...uniqueStatus][0] : "ผสม";

            return (
              <div key={productName} className="bg-white rounded-2xl shadow-md p-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-5xl font-semibold text-gray-800">{productName}</h2>
                  <span className="text-3xl text-gray-600">ทั้งหมด {totalQuantity} ชิ้น</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-3xl">
                    <thead>
                      <tr className="bg-gray-100 text-gray-700 uppercase">
                        <th className="py-6 px-8">ลำดับ</th>
                        <th className="py-6 px-8">โต๊ะ</th>
                        <th className="py-6 px-8">จำนวน</th>
                        <th className="py-6 px-8">ตัวเลือก</th>
                        <th className="py-6 px-8">หมายเหตุ</th>
                        <th className="py-6 px-8">เวลาสั่ง</th>
                        <th className="py-6 px-8">สถานะ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {productOrders.map((order, index) => (
                        <tr key={order.purchase_id} className="border-b hover:bg-gray-50">
                          <td className="py-6 px-8">{index + 1}</td>
                          <td className="py-6 px-8 font-medium">{order.seat_id}</td>
                          <td className="py-6 px-8">{order.purchase_quantity}</td>
                          <td className="py-6 px-8">{renderSelectedOptions(order.selected_option)}</td>
                          <td className="py-6 px-8 text-gray-600">{order.purchase_description || "-"}</td>
                          <td className="py-6 px-8 text-gray-600">{formatDate(order.purchase_date)}</td>
                          <td className="py-6 px-8 font-medium text-blue-600">{order.purchase_status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-6 flex justify-end space-x-4">
                  <button
                    onClick={() => handleStatusUpdate(productName, "กำลังทำ")}
                    className="bg-blue-500 text-white px-10 py-4 rounded-lg text-3xl font-medium hover:bg-blue-600 transition cursor-pointer"
                  >
                    กำลังทำ
                  </button>
                  <button
                    onClick={() => handleStatusUpdate(productName, "เสร็จแล้ว")}
                    className="bg-green-500 text-white px-10 py-4 rounded-lg text-3xl font-medium hover:bg-green-600 transition cursor-pointer"
                  >
                    เสร็จแล้ว
                  </button>
                  <button
                    onClick={() => handleStatusUpdate(productName, "ยกเลิก")}
                    className="bg-red-500 text-white px-10 py-4 rounded-lg text-3xl font-medium hover:bg-red-600 transition cursor-pointer"
                  >
                    ยกเลิก
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}