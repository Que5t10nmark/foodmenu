"use client";
import { useEffect, useState } from "react";

export default function FinishedOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSeat, setSelectedSeat] = useState(""); // 🆕 เพิ่มตัวกรองโต๊ะ
  const [allSeats, setAllSeats] = useState([]); // 🆕 สำหรับแสดงใน dropdown

  useEffect(() => {
    const fetchFinishedOrders = () => {
      const params = new URLSearchParams();
      params.append("status", "เสร็จแล้ว");
      if (selectedDate) params.append("date", selectedDate);

      fetch(`/api/purchase?${params.toString()}`)
        .then((res) => res.json())
        .then((data) => {
          setOrders(data);
          const uniqueSeats = [...new Set(data.map((o) => o.seat_id))];
          setAllSeats(uniqueSeats);
          setLoading(false);
        })
        .catch((err) => {
          console.error("โหลดคำสั่งซื้อไม่สำเร็จ", err);
          setLoading(false);
        });
    };

    fetchFinishedOrders();
    const interval = setInterval(fetchFinishedOrders, 2000);
    return () => clearInterval(interval);
  }, [selectedDate]);

  if (loading) return <div className="p-6 text-center">กำลังโหลด...</div>;

  // 🧠 กรองข้อมูลตามโต๊ะที่เลือก (ถ้ามี)
  const filteredOrders = selectedSeat
    ? orders.filter((order) => order.seat_id === selectedSeat)
    : orders;

  const groupedOrders = filteredOrders.reduce((acc, order) => {
    if (!acc[order.seat_id]) acc[order.seat_id] = [];
    acc[order.seat_id].push(order);
    return acc;
  }, {});

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">📦 คำสั่งซื้อที่เสร็จแล้ว</h1>

      {/* 🎯 ตัวเลือกวันที่ */}
      <div className="mb-4 flex flex-wrap items-center gap-4">
        <label htmlFor="date" className="font-semibold">
          เลือกวันที่:
        </label>
        <input
          id="date"
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="border rounded px-3 py-1"
        />
        {selectedDate && (
          <button
            onClick={() => setSelectedDate("")}
            className="text-sm text-blue-600 underline"
          >
            ล้างวันที่
          </button>
        )}
      </div>

      {/* 🎯 ตัวเลือกโต๊ะ */}
      <div className="mb-6 flex flex-wrap items-center gap-4">
        <label htmlFor="seat" className="font-semibold">
          เลือกโต๊ะ:
        </label>
        <select
          id="seat"
          value={selectedSeat}
          onChange={(e) => setSelectedSeat(e.target.value)}
          className="border rounded px-3 py-1"
        >
          <option value="">-- แสดงทุกโต๊ะ --</option>
          {allSeats.map((seat) => (
            <option key={seat} value={seat}>
              โต๊ะ {seat}
            </option>
          ))}
        </select>
        {selectedSeat && (
          <button
            onClick={() => setSelectedSeat("")}
            className="text-sm text-blue-600 underline"
          >
            ล้างโต๊ะ
          </button>
        )}
      </div>

      {/* 📦 แสดงรายการ */}
      {Object.keys(groupedOrders).length === 0 ? (
        <div className="text-center text-gray-500">
          {selectedDate || selectedSeat
            ? "ไม่มีคำสั่งซื้อที่ตรงกับเงื่อนไข"
            : "ยังไม่มีคำสั่งซื้อที่เสร็จแล้ว"}
        </div>
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
