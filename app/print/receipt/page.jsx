"use client";
import { useEffect, useState } from "react";

export default function ReceiptPrintPage() {
  const [data, setData] = useState(null);
  const [isPrinting, setIsPrinting] = useState(false);

  useEffect(() => {
    const storedData = sessionStorage.getItem("receiptData");
    if (storedData) {
      const parsed = JSON.parse(storedData);
      // Normalize data: แปลง product_price และ product_option_price เป็น number
      const normalizedData = {
        ...parsed,
        filteredOrders: parsed.filteredOrders.map((order) => ({
          ...order,
          product_price: Number(order.product_price) || 0,
          totalPrice: Number(order.totalPrice) || 0,
          selected_option:
            typeof order.selected_option === "string"
              ? JSON.parse(order.selected_option || "{}")
              : order.selected_option || {},
        })),
        total: Number(parsed.total) || 0,
        discount: Number(parsed.discount) || 0,
      };
      setData(normalizedData);
    }
  }, []);

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
          <div key={optionType} className="text-xs text-gray-600">
            {optionType}: {displayValue}
            {totalPrice > 0 ? ` (+${totalPrice.toFixed(2)} บาท)` : ""}
          </div>
        );
      } else if (typeof optionValues === "object" && optionValues !== null) {
        const displayValue = optionValues.product_option_value || "";
        const price = Number(optionValues.product_option_price) || 0;
        return (
          <div key={optionType} className="text-xs text-gray-600">
            {optionType}: {displayValue}
            {price > 0 ? ` (+${price.toFixed(2)})` : ""}
          </div>
        );
      }
      return null;
    });
  };

  if (!data) return <p className="text-center text-base text-gray-600">Loading...</p>;

  const { filteredOrders, total, discount, paymentMethod, selectedSeats } = data;

  const handlePrint = () => {
    setIsPrinting(true);
    setTimeout(() => {
      window.print();
      setTimeout(() => setIsPrinting(false), 500);
    }, 100);
  };

  return (
    <>
      <style>{`
        @media print {
          @page {
            size: 80mm auto;
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
            font-family: 'Kanit', sans-serif;
          }
          button {
            display: none !important;
          }
        }
      `}</style>

      <div
        id="receipt"
        className="max-w-[80mm] mx-auto bg-white p-6 rounded-lg shadow-md"
      >
        <h1 className="text-lg font-bold text-center text-gray-800">Steak NiWha</h1>
        <p className="text-center text-sm text-gray-600">ใบเสร็จรับเงิน</p>
        <p className="text-center text-sm text-gray-600">โต๊ะ: {selectedSeats.join(", ")}</p>
        <p className="text-center text-sm text-gray-600">
          วันที่: {new Date().toLocaleString("th-TH", { timeZone: "Asia/Bangkok" })}
        </p>
        <hr className="my-4 border-gray-300" />
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-gray-300">
              <th className="text-left py-1 font-semibold">สินค้า</th>
              <th className="text-center py-1 font-semibold">จำนวน</th>
              <th className="text-right py-1 font-semibold">ราคา</th>
              <th className="text-right py-1 font-semibold">รวม</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((order, i) => {
              const selectedOptions =
                typeof order.selected_option === "string"
                  ? JSON.parse(order.selected_option || "{}")
                  : order.selected_option || {};
              return (
                <tr key={i}>
                  <td className="py-1">
                    {order.product_name}
                    <div className="mt-1">{renderSelectedOptions(selectedOptions)}</div>
                  </td>
                  <td className="text-center py-1">{order.purchase_quantity}</td>
                  <td className="text-right py-1">
                    ฿{(Number(order.product_price) || 0).toFixed(2)}
                  </td>
                  <td className="text-right py-1">
                    ฿{(Number(order.totalPrice) || 0).toFixed(2)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <hr className="my-4 border-gray-300" />
        <div className="flex justify-between text-sm text-gray-800">
          <span>ส่วนลด:</span>
          <span>฿{(Number(discount) || 0).toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm font-semibold text-gray-800">
          <span>รวมทั้งหมด:</span>
          <span>฿{(Number(total) || 0).toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm text-gray-800">
          <span>วิธีชำระเงิน:</span>
          <span>{paymentMethod}</span>
        </div>
        <p className="text-center text-sm text-gray-600 mt-4">ขอบคุณที่ใช้บริการ</p>
        {!isPrinting && (
          <div className="mt-4 text-center">
            <button
              onClick={handlePrint}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm"
            >
              พิมพ์ใบเสร็จ
            </button>
          </div>
        )}
      </div>
    </>
  );
}