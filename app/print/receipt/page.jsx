"use client";
import { useEffect, useState } from "react";

export default function ReceiptPrintPage() {
  const [data, setData] = useState(null);
  const [isPrinting, setIsPrinting] = useState(false);

  useEffect(() => {
    const storedData = sessionStorage.getItem("receiptData");
    if (storedData) {
      const parsed = JSON.parse(storedData);
      setData(parsed);
    }
  }, []);

  if (!data) return <p>Loading...</p>;

  const { filteredOrders, total, discount, paymentMethod, selectedSeats } = data;

  const handlePrint = () => {
    setIsPrinting(true);
    setTimeout(() => {
      window.print();
      setTimeout(() => setIsPrinting(false), 500); // รีเซ็ตปุ่มหลังพิมพ์เสร็จ (optional)
    }, 100);
  };

  return (
    <>
      <style>{`
        @media print {
          @page {
            size: 80mm auto; /* ความกว้าง 80 มม. ความสูงออโต้ */
            margin: 5mm;
          }
          body * {
            visibility: hidden;
          }
          #receipt, #receipt * {
            visibility: visible;
          }
          #receipt {
            position: absolute;
            left: 0;
            top: 0;
            width: 80mm;
          }
          /* ซ่อนปุ่มตอนพิมพ์ */
          button {
            display: none !important;
          }
        }
      `}</style>

      <div
        id="receipt"
        className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md"
      >
        <h1 className="text-xl font-bold text-center">Steak NiWha</h1>
        <p className="text-center text-sm">ใบเสร็จรับเงิน</p>
        <p className="text-center text-sm">โต๊ะ: {selectedSeats.join(", ")}</p>
        <p className="text-center text-sm">วันที่: {new Date().toLocaleString()}</p>
        <hr className="my-4" />
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left py-1">สินค้า</th>
              <th className="text-center py-1">จำนวน</th>
              <th className="text-right py-1">ราคา</th>
              <th className="text-right py-1 ml-2">รวม</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((order, i) => (
              <tr key={i}>
                <td className="py-1">
                  {order.product_name}
                  <br />
                  <div className="text-sm text-gray-800">
                  {order.selected_option
                    ? Object.entries(order.selected_option).map(
                        ([option_type, option_value], idx) => (
                          <div key={idx}>
                            {option_type}:{" "}
                            {Array.isArray(option_value)
                              ? option_value.join(", ")
                              : option_value}
                          </div>
                        )
                      )
                    : "ไม่มีตัวเลือก"}
                  </div>
                </td>
                <td className="text-center py-1">{order.purchase_quantity}</td>
                <td className="text-right py-1">{order.product_price}</td>
                <td className="text-right py-1">
                  {(order.product_price * order.purchase_quantity).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <hr className="my-4" />
        <div className="flex justify-between text-sm">
          <span>ส่วนลด:</span>
          <span>{discount.toFixed(2)} บาท</span>
        </div>
        <div className="flex justify-between text-sm font-semibold">
          <span>รวมทั้งหมด:</span>
          <span>{total.toFixed(2)} บาท</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>วิธีชำระเงิน:</span>
          <span>{paymentMethod}</span>
        </div>
        <p className="text-center text-sm mt-4">ขอบคุณที่ใช้บริการ</p>
        {!isPrinting && (
          <div className="mt-4 text-center">
            <button
              onClick={handlePrint}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
            >
              พิมพ์ใบเสร็จ
            </button>
          </div>
        )}
      </div>
    </>
  );
}
