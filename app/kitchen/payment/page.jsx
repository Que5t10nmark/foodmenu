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
      try {
        const res = await fetch(`/api/purchase`);
        if (!res.ok) throw new Error("ไม่สามารถดึงข้อมูลคำสั่งซื้อได้");
        const data = await res.json();
        const finishedOrders = data.filter(
          (order) => order.purchase_status === "เสร็จแล้ว"
        );
        // แปลง product_price เป็น number ในกรณีที่เป็น string
        const normalizedOrders = finishedOrders.map((order) => ({
          ...order,
          product_price: Number(order.product_price) || 0,
          selected_option:
            typeof order.selected_option === "string"
              ? JSON.parse(order.selected_option || "{}")
              : order.selected_option || {},
        }));
        setOrders(normalizedOrders);

        const uniqueSeats = [
          ...new Set(normalizedOrders.map((order) => order.seat_id)),
        ];
        setPaidSeats(uniqueSeats);
      } catch (err) {
        console.error("เกิดข้อผิดพลาดในการดึงข้อมูล:", err);
        setMessage("เกิดข้อผิดพลาดในการดึงข้อมูลคำสั่งซื้อ");
        setTimeout(() => setMessage(null), 1000);
      }
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

  // ฟังก์ชันคำนวณราคาตัวเลือก
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

  // ฟังก์ชันคำนวณราคารวมต่อออเดอร์
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

  // ฟังก์ชันแสดงผลตัวเลือก
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
          <div key={optionType} className="text-base text-gray-600">
            {optionType}: {displayValue}
            {totalPrice > 0 ? ` (+${totalPrice.toFixed(2)} บาท)` : ""}
          </div>
        );
      } else if (typeof optionValues === "object" && optionValues !== null) {
        const displayValue = optionValues.product_option_value || "";
        const price = Number(optionValues.product_option_price) || 0;
        return (
          <div key={optionType} className="text-base text-gray-600">
            {optionType}: {displayValue}
            {price > 0 ? ` (+${price.toFixed(2)} บาท)` : ""}
          </div>
        );
      }
      return null;
    });
  };

  const filteredOrders = orders.filter((order) =>
    selectedSeats.includes(order.seat_id)
  );

  const subtotal = filteredOrders.reduce(
    (sum, order) => sum + calculateTotalPrice(order),
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
          total,
        }),
      });

      if (res.ok) {
        setMessage(`อัปเดตสถานะเป็น "ชำระเงินแล้ว"`);
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
        setSelectedSeats([]);
        setTimeout(() => {
          window.location.reload();
        }, 500);
      } else {
        const error = await res.json();
        setMessage("❌ เกิดข้อผิดพลาด: " + error.message);
        setTimeout(() => setMessage(null), 1000);
      }
    } catch (err) {
      console.error("เกิดข้อผิดพลาดในการชำระเงิน:", err);
      setMessage("เกิดข้อผิดพลาดในการชำระเงิน");
      setTimeout(() => setMessage(null), 1000);
    }
  };

  const handlePrint = (selectedSeats, filteredOrders, total, discount, paymentMethod) => {
    const printData = {
      selectedSeats,
      filteredOrders: filteredOrders.map((order) => ({
        ...order,
        totalPrice: calculateTotalPrice(order),
      })),
      total,
      discount,
      paymentMethod,
    };
    sessionStorage.setItem("receiptData", JSON.stringify(printData));
    window.open(
      "/print/receipt",
      "receiptWindow",
      "width=500,height=500,top=100,left=100,resizable=yes,scrollbars=yes"
    );
  };

  return (
    <div className="flex h-screen">
      {message && (
        <div
          className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
          bg-green-500 text-white border border-green-300 px-10 py-6 
          rounded-xl shadow-2xl z-50 animate-fade text-xl sm:text-2xl"
        >
          {message}
        </div>
      )}
      <div className="w-3/2 p-6 max-h-screen bg-gray-100 overflow-auto">
        <h2 className="text-4xl font-bold mb-6 flex items-center gap-2">
          <SquareMousePointer className="w-10 h-10 text-gray-600" />
          เลือกโต๊ะชำระเงิน
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {paidSeats.map((seatId) => (
            <button
              key={seatId}
              onClick={() => toggleSeatSelection(seatId)}
              className={`p-6 text-2xl sm:text-3xl font-bold border rounded-xl shadow hover:bg-green-100 transition cursor-pointer ${
                selectedSeats.includes(seatId)
                  ? "bg-green-500 text-white shadow-lg shadow-green-500/50"
                  : "bg-white"
              }`}
            >
              โต๊ะ {seatId}
            </button>
          ))}
        </div>
      </div>

      <div className="w-1/2 p-6 max-h-screen bg-white overflow-auto">
        <h2 className="text-3xl font-bold mb-6 flex items-center gap-2">
          {selectedSeats.length > 0 ? (
            <>
              <TextSelect className="w-10 h-10 text-gray-600" />
              รายการของโต๊ะ {selectedSeats.join(", ")}
            </>
          ) : (
            <>
              <NotebookPen className="w-10 h-10 text-gray-600" />
              กรุณาเลือกโต๊ะ
            </>
          )}
        </h2>

        {selectedSeats.length > 0 && filteredOrders.length > 0 ? (
          <>
            <ul className="space-y-4 mb-6">
              {filteredOrders.map((order) => {
                const selectedOptions =
                  typeof order.selected_option === "string"
                    ? JSON.parse(order.selected_option || "{}")
                    : order.selected_option || {};
                return (
                  <li
                    key={order.purchase_id}
                    className="border p-4 rounded-xl shadow bg-gray-50"
                  >
                    <div className="text-lg font-bold text-gray-800">
                      {order.product_name} จำนวน: {order.purchase_quantity}
                    </div>
                    <div className="text-base text-gray-600">
                      ราคา: ฿{(Number(order.product_price) || 0).toFixed(2)}
                    </div>
                    {selectedOptions && Object.keys(selectedOptions).length > 0 && (
                      <div className="mt-2">
                        <p className="font-medium text-gray-700 text-base">
                          ตัวเลือก:
                        </p>
                        <div className="space-y-1">{renderSelectedOptions(selectedOptions)}</div>
                      </div>
                    )}
                    <div className="text-base font-semibold text-gray-800 mt-2">
                      รวม: ฿{calculateTotalPrice(order).toFixed(2)}
                    </div>
                  </li>
                );
              })}
            </ul>

            <div className="space-y-6 mb-8">
              <div>
                <label className="font-semibold block mb-2 text-xl">
                  ใส่ส่วนลด (บาท)
                </label>
                <input
                  type="number"
                  min={0}
                  value={discount}
                  onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                  className="w-full border p-3 rounded text-lg"
                />
              </div>
              <div>
                <label className="font-semibold block mb-2 text-xl">
                  เลือกการชำระเงิน
                </label>
                <div className="flex gap-4">
                  {["เงินสด", "โอน"].map((method) => (
                    <button
                      key={method}
                      onClick={() => setPaymentMethod(method)}
                      className={`px-6 py-3 text-lg font-semibold rounded border cursor-pointer ${
                        paymentMethod === method
                          ? "bg-green-500 text-white shadow-lg shadow-green-500/50"
                          : "bg-white hover:bg-gray-100"
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
                      className="form-checkbox h-6 w-6 text-green-600"
                    />
                    <span className="ml-3 text-xl">พิมพ์ใบเสร็จ</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="text-right font-bold text-2xl mb-4">
              รวมทั้งสิ้น: ฿{total.toFixed(2)}
            </div>

            <button
              onClick={() => setShowConfirm(true)}
              className="w-full bg-green-600 hover:bg-green-500 cursor-pointer shadow-lg shadow-green-500/50 text-white py-4 rounded text-xl transition"
              disabled={selectedSeats.length === 0}
            >
              ยืนยันชำระเงิน ฿{total.toFixed(2)}
            </button>

            {showConfirm && (
              <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-center items-center z-50">
                <div className="bg-white p-6 rounded-xl shadow-lg text-center space-y-4 w-[90%] max-w-md">
                  <p className="text-2xl">คุณต้องการชำระเงิน ฿{total.toFixed(2)} ใช่หรือไม่?</p>
                  <div className="flex justify-around">
                    <button
                      onClick={() => {
                        handlePayment();
                        setShowConfirm(false);
                      }}
                      className="text-white bg-green-600 px-8 py-3 rounded hover:bg-green-700 shadow-lg shadow-green-500/50 cursor-pointer"
                    >
                      ใช่
                    </button>
                    <button
                      onClick={() => setShowConfirm(false)}
                      className="text-white bg-red-600 px-8 py-3 rounded hover:bg-red-700 shadow-lg shadow-red-500/50 cursor-pointer"
                    >
                      ยกเลิก
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-gray-500 text-center mt-10 text-xl">
            ยังไม่มีรายการในโต๊ะนี้
          </div>
        )}
      </div>
    </div>
  );
}