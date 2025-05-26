"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function MyOrderPage() {
  const [orders, setOrders] = useState([]);
  const [selectedSeat, setSelectedSeat] = useState("");
  const [allSeats, setAllSeats] = useState([]);

  useEffect(() => {
    const fetchOrders = async () => {
      const res = await fetch(`/api/purchase`);
      const data = await res.json();
      setOrders(data);

      const seatIds = [...new Set(data.map((order) => order.seat_id))];
      setAllSeats(seatIds);
    };

    fetchOrders();
    const interval = setInterval(fetchOrders, 3000);
    return () => clearInterval(interval);
  }, []);

  const filteredOrders = selectedSeat
    ? orders.filter((order) => order.seat_id === selectedSeat)
    : [];

  // เปลี่ยน key: type → optionType, value → optionValue
  const renderSelectedOptions = (selectedOptions) => {
    if (!selectedOptions) return null;

    return Object.entries(selectedOptions).map(([optionType, optionValue]) => (
      <div key={optionType} className="text-sm text-gray-600">
        {optionType}:{" "}
        {Array.isArray(optionValue) ? optionValue.join(", ") : optionValue}
      </div>
    ));
  };

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h1 className="text-xl font-bold mb-4">🍽 รายการของคุณ</h1>
      <div className="mb-4">
        <label className="block mb-1 font-medium">เลือกโต๊ะ</label>
        <select
          value={selectedSeat}
          onChange={(e) => setSelectedSeat(e.target.value)}
          className="w-full border rounded p-2"
        >
          <option value="">-- เลือกโต๊ะ --</option>
          {allSeats.map((seatId) => (
            <option key={seatId} value={seatId}>
              โต๊ะ {seatId}
            </option>
          ))}
        </select>
      </div>

      {selectedSeat === "" ? (
        <div className="text-gray-500">กรุณาเลือกโต๊ะ</div>
      ) : filteredOrders.length === 0 ? (
        <div className="text-gray-500">ยังไม่มีคำสั่งซื้อสำหรับโต๊ะนี้</div>
      ) : (
        <ul className="space-y-3">
          {filteredOrders.map((order) => (
            <li
              key={order.purchase_id}
              className="border p-4 rounded shadow bg-white "
            >
              <div className="font-bold">{order.product_name}</div>
              <div className="text-sm">จำนวน: {order.purchase_quantity}</div>
              <div className="text-sm">ราคา: {order.product_price} บาท</div>

              {/* ตัวเลือกที่เลือก */}
              {renderSelectedOptions(order.selected_option)}

              {/* หมายเหตุเพิ่มเติม */}
              {order.purchase_description && (
                <div className="text-sm text-gray-600">
                  หมายเหตุ: {order.purchase_description}
                </div>
              )}

              <div className="text-sm mt-1">
                สถานะ:{" "}
                <span className="font-semibold text-blue-600">
                  {order.purchase_status}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
      <Link href="/order/product" className="fixed bottom-6 left-6 z-50">
        <button className="bg-red-600 hover:bg-red-300 text-white px-4 py-2 rounded-full shadow-lg">
          กลับ
        </button>
      </Link>
    </div>
  );
}
