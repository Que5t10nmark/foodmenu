"use client";
import { useEffect, useState } from "react";
import { TextSelect, NotebookPen, SquareMousePointer } from "lucide-react";
export default function PaymentPage() {
  const [orders, setOrders] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [paidSeats, setPaidSeats] = useState([]);
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("เงินสด");
  const [printReceipt, setPrintReceipt] = useState(true);
  const [showConfirm, setShowConfirm] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      const res = await fetch(`/api/purchase`);
      const data = await res.json();
      const finishedOrders = data.filter(
        (order) => order.purchase_status === "เสร็จแล้ว"
      );
      setOrders(finishedOrders);

      const uniqueSeats = [
        ...new Set(finishedOrders.map((order) => order.seat_id)),
      ];
      setPaidSeats(uniqueSeats);
    };

    fetchOrders();
    const interval = setInterval(fetchOrders, 2000);
    return () => clearInterval(interval);
  }, []);

  const toggleSeatSelection = (seatId) => {
    setSelectedSeats((prev) =>
      prev.includes(seatId)
        ? prev.filter((id) => id !== seatId)
        : [...prev, seatId]
    );
  };

  const filteredOrders = orders.filter((order) =>
    selectedSeats.includes(order.seat_id)
  );
  const subtotal = filteredOrders.reduce(
    (sum, order) => sum + order.product_price * order.purchase_quantity,
    0
  );
  const total = subtotal - discount;

  const handlePayment = async () => {
    if (selectedSeats.length === 0) return;

    try {
      const res = await fetch(`/api/payment/[seat_id]/pay`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          seat_ids: selectedSeats,
          discount,
          method: paymentMethod,
          printReceipt,
        }),
      });

      if (res.ok) {
        setMessage(`อัปเดตสถานะเป็น "ชำระเงินแล้ว" `);
        setTimeout(() => setMessage(null), 1000);

        if (printReceipt) {
          handlePrint(
            selectedSeats,
            filteredOrders,
            total,
            discount,
            paymentMethod
          );
        }

        setDiscount(0);
        setPaymentMethod("เงินสด");
        setPrintReceipt(true);
        setOrders((prev) =>
          prev.filter((order) => !selectedSeats.includes(order.seat_id))
        );
        setPaidSeats((prev) =>
          prev.filter((seatId) => !selectedSeats.includes(seatId))
        );
        setTimeout(() => {
          window.location.reload();
        }, 500);
      } else {
        const error = await res.json();
        alert("❌ เกิดข้อผิดพลาด: " + error.message);
      }
    } catch (err) {
      console.error("เกิดข้อผิดพลาดในการชาระเงิน:", err);
      setMessage("เกิดข้อผิดพลาดในกาชารชำระเงิน");
      setTimeout(() => setMessage(null), 1000);
    }
  };
  // ฝั่ง PaymentPage ก่อนเปิดหน้าพิมพ์ใบเสร็จ
  const handlePrint = () => {
    const printData = {
      filteredOrders,
      total,
      discount,
      paymentMethod,
      selectedSeats,
    };
    sessionStorage.setItem("receiptData", JSON.stringify(printData));
    window.open(
      "/print/receipt",
      "receiptWindow",
      "width500,height=500,top=100,left=100,resizable=yes,scrollbars=yes"
    );
    // window.print() จะถูกเรียกในหน้าพิมพ์ใบเสร็จ
  };

  return (
    <div className="flex h-screen">
      {message && (
        <div
          className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
          bg-green-600 text-white border border-green-300 px-6 py-3 
          rounded-xl shadow-lg z-50 animate-fade text-xl"
        >
          {message}
        </div>
      )}
      <div className="w-3/2 p-6 max-h-screen bg-gray-100 overflow-auto">
        <h2 className="text-3xl font-bold mb-4">
          <SquareMousePointer className="inline-block w-9 h-8 text-gray-600" />
          เลือกโต๊ะชำระเงิน
        </h2>
        <div className="grid grid-cols-3 gap-6">
          {paidSeats.map((seatId) => (
            <button
              key={seatId}
              onClick={() => toggleSeatSelection(seatId)}
              className={`p-6 text-3xl cursor-pointer font-bold border rounded-lg shadow hover:bg-green-100 transition ${
                selectedSeats.includes(seatId)
                  ? "bg-green-500 text-white shadow-lg shadow-green-500/50 "
                  : "bg-white"
              }`}
            >
              โต๊ะ {seatId}
            </button>
          ))}
        </div>
      </div>

      <div className="w-1/2 p-6 max-h-screen bg-white overflow-auto">
        <h2 className="text-3xl font-bold mb-4 flex items-center gap-2">
          {selectedSeats.length > 0 ? (
            <>
              <TextSelect className="w-8 h-8 text-gray-600" />
              รายการของโต๊ะ {selectedSeats.join(", ")}
            </>
          ) : (
            <>
              <NotebookPen className="w-8 h-8 text-gray-600" />
              กรุณาเลือกโต๊ะ
            </>
          )}
        </h2>

        {selectedSeats.length > 0 && filteredOrders.length > 0 ? (
          <>
            <ul className="space-y-3 mb-4">
              {filteredOrders.map((order) => (
                <li
                  key={order.purchase_id}
                  className="border p-1 rounded shadow bg-gray-50"
                >
                  <div className="text-md font-bold">
                    {order.product_name} จำนวน: {order.purchase_quantity} ราคา:{" "}
                    {order.product_price} บาท
                  </div>
                  <div className="text-sm text-gray-800">
                    {order.selected_option
                      ? Object.entries(order.selected_option)
                          .map(([optionType, optionValue]) => {
                            const displayValue = Array.isArray(optionValue)
                              ? optionValue
                                  .map((item) => item?.option_value || item)
                                  .join(", ")
                              : typeof optionValue === "object" &&
                                optionValue !== null
                              ? optionValue.option_value ||
                                JSON.stringify(optionValue)
                              : optionValue;

                            return `${optionType}: ${displayValue}`;
                          })
                          .join(", ")
                      : "ไม่มีตัวเลือก"}
                  </div>
                </li>
              ))}
            </ul>

            <div className="space-y-4 mb-6">
              <div>
                <label className="font-semibold block mb-1">
                  ใส่ส่วนลด (บาท)
                </label>
                <input
                  type="number"
                  min={0}
                  value={discount}
                  onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                  className="w-full border p-2 rounded"
                />
              </div>
              <div>
                <label className="font-semibold block mb-2 text-2xl">
                  เลือกการชำระเงิน
                </label>
                <div className="flex gap-4">
                  {["เงินสด", "โอน"].map((method) => (
                    <button
                      key={method}
                      onClick={() => setPaymentMethod(method)}
                      className={`px-6 py-4 rounded border font-semibold cursor-pointer ${
                        paymentMethod === method
                          ? "bg-green-500 text-white shadow-lg shadow-green-500/50"
                          : "bg-white"
                      }`}
                    >
                      {method}
                    </button>
                  ))}
                </div>

                <div className="mt-6">
                  <label className="inline-flex items-center">
                    <input
                      type="checkbox"
                      checked={printReceipt}
                      onChange={(e) => setPrintReceipt(e.target.checked)}
                      className="form-checkbox h-8 w-8 text-green-600 "
                    />
                    <span className="ml-4 text-2xl">พิมพ์ใบเสร็จ</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="text-right font-bold text-xl mb-2">
              รวมทั้งสิ้น: {total.toFixed(2)} บาท
            </div>

            <button
              onClick={() => setShowConfirm(true)}
              className="w-full bg-green-600 hover:bg-green-500 shadow-lg shadow-green-500/50 cursor-pointer text-white py-3 rounded text-lg transition"
            >
              ยืนยันชำระเงิน {total.toFixed(2)} บาท
            </button>

            {showConfirm && (
              <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-center items-center z-50">
                <div className="bg-white p-4 rounded-lg shadow-lg text-center space-y-2 w-[90%] max-w-md">
                  <p className="text-2xl">คุณต้องการชำระเงินใช่หรือไม่?</p>
                  <div className="flex justify-around mt-4">
                    <button
                      onClick={() => {
                        handlePayment();
                        setShowConfirm(false);
                      }}
                      className="text-white bg-green-600 px-6 py-4 rounded hover:bg-green-300 shadow-lg shadow-green-500/50 "
                    >
                      ใช่
                    </button>
                    <button
                      onClick={() => setShowConfirm(false)}
                      className="text-white bg-red-600 px-6 py-4 rounded hover:bg-red-300 shadow-lg shadow-red-500/50 "
                    >
                      ยกเลิก
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-gray-500 text-center mt-10">
            ยังไม่มีรายการในโต๊ะนี้
          </div>
        )}
      </div>
    </div>
  );
}
