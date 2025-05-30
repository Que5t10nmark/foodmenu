"use client";
import { useEffect, useState } from "react";

export default function ReceiptPrintPage() {
  const [data, setData] = useState(null);

  useEffect(() => {
    const storedData = sessionStorage.getItem("receiptData");
    if (storedData) {
      const parsed = JSON.parse(storedData);
      setData(parsed);

      setTimeout(() => {
        window.print();
        setTimeout(() => window.close(), 1000);
      }, 500);
    }
  }, []);

  if (!data) return <p>Loading...</p>;

  const { filteredOrders, total, discount, paymentMethod, selectedSeats } = data;

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
      <h1 className="text-xl font-bold text-center">Steak NiWha</h1>
      <p className="text-center text-sm">ใบเสร็จรับเงิน</p>
      <p className="text-center text-sm">โต๊ะ: {selectedSeats.join(", ")}</p>
      <p className="text-center text-sm">
        วันที่: {new Date().toLocaleString()}
      </p>
      <hr className="my-4" />
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b">
            <th className="text-left py-1">สินค้า</th>
            <th className="text-center py-1">จำนวน</th>
            <th className="text-right py-1">ราคา/หน่วย</th>
            <th className="text-right py-1">รวม</th>
          </tr>
        </thead>
        <tbody>
          {filteredOrders.map((order, i) => (
            <tr key={i}>
              <td className="py-1">
                {order.product_name}
                <br />
                {order.selected_option
                  ? Object.entries(order.selected_option).map(([type, value], idx) => (
                      <div key={idx}>
                        {type}: {Array.isArray(value) ? value.join(", ") : value}
                      </div>
                    ))
                  : "ไม่มีตัวเลือก"}
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
    </div>
  );
}
