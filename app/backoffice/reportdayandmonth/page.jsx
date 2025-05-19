"use client";
import { useEffect, useState } from "react";
export default function FinishedOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSeat, setSelectedSeat] = useState("");
  const [allSeats, setAllSeats] = useState([]);

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
    const interval = setInterval(fetchFinishedOrders, 1000);
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
    <div className="p-6 max-h-screen overflow-auto">
      <h1 className="text-2xl font-bold mb-4">📦 คำสั่งซื้อที่เสร็จแล้ว</h1>
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

      {Object.keys(groupedOrders).length === 0 ? (
        <div className="text-center text-gray-500">
          {selectedDate || selectedSeat
            ? "ไม่มีคำสั่งซื้อที่ตรงกับเงื่อนไข"
            : "ยังไม่มีคำสั่งซื้อที่เสร็จแล้ว"}
        </div>
      ) : (
        Object.keys(groupedOrders).map((seatId) => (
          <div key={seatId} className="mb-8">
            <h2 className="text-xl font-bold mb-2">โต๊ะ: {seatId}</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full table-auto border border-gray-300 rounded">
                <thead className="bg-gray-100 text-sm">
                  <tr>
                    <th className="border px-3 py-2">วันที่สั่ง</th>
                    <th className="border px-3 py-2">เมนู</th>
                    <th className="border px-3 py-2">จำนวน</th>
                    <th className="border px-3 py-2">ราคา</th>
                    <th className="border px-3 py-2">รายละเอียด</th>
                    <th className="border px-3 py-2">หมายเหตุ</th>
                    <th className="border px-3 py-2">สถานะ</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {groupedOrders[seatId].map((order) => (
                    <tr key={order.purchase_id} className="hover:bg-gray-50">
                      <td className="border px-3 py-2">
                        {new Date(order.purchase_date).toLocaleString("th-TH", {
                          timeZone: "Asia/Bangkok",
                        })}
                      </td>
                      <td className="border px-3 py-2">{order.product_name}</td>
                      <td className="border px-3 py-2">
                        {order.purchase_quantity}
                      </td>
                      <td className="border px-3 py-2">
                        ฿{order.product_price * order.purchase_quantity}
                      </td>
                      <td className="border px-3 py-2">
                        <ul className="list-disc list-inside space-y-1">
                          {order.purchase_size && (
                            <li>ขนาด: {order.purchase_size}</li>
                          )}
                          {order.purchase_spiceLevel && (
                            <li>เผ็ด: {order.purchase_spiceLevel}</li>
                          )}
                          {order.purchase_toppings &&
                            order.purchase_toppings !== "[]" && (
                              <li>
                                ท็อปปิ้ง:{" "}
                                {Array.isArray(order.purchase_toppings)
                                  ? order.purchase_toppings.join(", ")
                                  : JSON.parse(order.purchase_toppings).join(
                                      ", "
                                    )}
                              </li>
                            )}
                        </ul>
                      </td>
                      <td className="border px-3 py-2">
                        {order.purchase_description || "-"}
                      </td>
                      <td className="border px-3 py-2 text-green-600 font-semibold">
                        {order.purchase_status}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
