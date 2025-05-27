"use client";
import { useEffect, useState } from "react";

export default function PaymentPage() {
  const [orders, setOrders] = useState([]);
  const [selectedSeat, setSelectedSeat] = useState("");
  const [paidSeats, setPaidSeats] = useState([]);
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("เงินสด");
  const [printReceipt, setPrintReceipt] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      const res = await fetch(`/api/purchase`);
      const data = await res.json();

      const finishedOrders = data.filter(order => order.purchase_status === "เสร็จแล้ว");
      setOrders(finishedOrders);

      const uniqueSeats = [...new Set(finishedOrders.map((o) => o.seat_id))];
      setPaidSeats(uniqueSeats);
    };

    fetchOrders();
    const interval = setInterval(fetchOrders, 3000);
    return () => clearInterval(interval);
  }, []);

  const filteredOrders = orders.filter((o) => o.seat_id === selectedSeat);
  const subtotal = filteredOrders.reduce((sum, o) => sum + (o.product_price * o.purchase_quantity), 0);
  const total = subtotal - discount;

  const handlePayment = async () => {
    if (!selectedSeat) return;

    try {
      const res = await fetch(`/api/payment/${selectedSeat}/pay`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ discount, method: paymentMethod, printReceipt }),
      });

      if (res.ok) {
        alert("✅ ชำระเงินเรียบร้อยแล้ว");
        setSelectedSeat("");
        setDiscount(0);
        setPaymentMethod("เงินสด");
        setPrintReceipt(true);
        setOrders((prev) => prev.filter((o) => o.seat_id !== selectedSeat));
        setPaidSeats((prev) => prev.filter((s) => s !== selectedSeat));
      } else {
        const error = await res.json();
        alert("❌ เกิดข้อผิดพลาด: " + error.message);
      }
    } catch (err) {
      console.error("Error:", err);
      alert("❌ ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์");
    }
  };

  return (
    <div className="flex h-screen">
      {/* ฝั่งซ้าย: รายการโต๊ะ */}
      <div className="w-1/2 p-4 bg-gray-100 overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4">🪑 โต๊ะที่พร้อมชำระเงิน</h2>
        <div className="grid grid-cols-3 gap-4">
          {paidSeats.map((seatId) => (
            <button
              key={seatId}
              onClick={() => setSelectedSeat(seatId)}
              className={`p-6 border rounded-lg text-xl font-bold shadow hover:bg-blue-100 transition ${
                selectedSeat === seatId ? "bg-blue-500 text-white" : "bg-white"
              }`}
            >
              โต๊ะ {seatId}
            </button>
          ))}
        </div>
      </div>

      {/* ฝั่งขวา: รายการสินค้าในโต๊ะ */}
      <div className="w-1/2 p-6 overflow-y-auto bg-white">
        <h2 className="text-2xl font-bold mb-4">
          {selectedSeat ? `📋 รายการของโต๊ะ ${selectedSeat}` : "🔍 กรุณาเลือกโต๊ะ"}
        </h2>

        {selectedSeat && filteredOrders.length > 0 ? (
          <>
            <ul className="space-y-3 mb-4">
              {filteredOrders.map((order) => (
                <li
                  key={order.purchase_id}
                  className="border p-1 rounded shadow bg-gray-50"
                >
                  <div className="font-bold text-lg">{order.product_name}</div>
                  <div className="text-sm text-gray-600">จำนวน: {order.purchase_quantity}</div>
                  <div className="text-sm text-gray-600">ราคา: {order.product_price} บาท</div>
                </li>
              ))}
            </ul>

            {/* ส่วนลดและวิธีชำระ */}
            <div className="space-y-4 mb-6">
              <div>
                <label className="font-semibold block mb-1">💸 ส่วนลด (บาท):</label>
                <input
                  type="number"
                  min={0}
                  value={discount}
                  onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                  className="w-full border p-2 rounded"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">💳 วิธีชำระ:</label>
                <div className="flex gap-4">
                  <button
                    onClick={() => setPaymentMethod("เงินสด")}
                    className={`px-4 py-2 rounded border font-semibold ${
                      paymentMethod === "เงินสด" ? "bg-green-500 text-white" : "bg-white"
                    }`}
                  >
                    เงินสด
                  </button>
                  <button
                    onClick={() => setPaymentMethod("โอน")}
                    className={`px-4 py-2 rounded border font-semibold ${
                      paymentMethod === "โอน" ? "bg-green-500 text-white" : "bg-white"
                    }`}
                  >
                    โอน
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={printReceipt}
                  onChange={(e) => setPrintReceipt(e.target.checked)}
                  id="printReceipt"
                />
                <label htmlFor="printReceipt">🖨 พิมพ์ใบเสร็จ</label>
              </div>
            </div>

            {/* รวมยอด */}
            <div className="text-right font-bold text-xl mb-2">
              💰 รวมทั้งสิ้น: {total.toFixed(2)} บาท
            </div>

            <button
              onClick={handlePayment}
              className="w-full bg-green-600 hover:bg-green-500 text-white py-3 rounded text-lg transition"
            >
              ✅ ยืนยันชำระเงิน
            </button>
          </>
        ) : (
          <div className="text-gray-500 text-center mt-10">
            🕐 ยังไม่มีรายการในโต๊ะนี้
          </div>
        )}
      </div>
    </div>
  );
}
