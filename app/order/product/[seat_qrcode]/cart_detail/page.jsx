"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation"; // ใช้ useParams ดึงค่า dynamic route
import Link from "next/link";

export default function MyOrderPage() {
  const params = useParams();
  const seatQRCode = params.seat_qrcode; // ดึงเลขโต๊ะจาก URL
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!seatQRCode) return;

    const fetchOrders = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/purchase`);
        const data = await res.json();
        const filteredOrders = data.filter(
          (order) => order.seat_id === seatQRCode
        );
        setOrders(filteredOrders);
      } catch (error) {
        console.error("โหลดคำสั่งซื้อไม่สำเร็จ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
    const interval = setInterval(fetchOrders, 3000);
    return () => clearInterval(interval);
  }, [seatQRCode]);

  // ฟังก์ชันคำนวณราคาสินค้ารวมกับราคาตัวเลือกทั้งหมด
  const calculateTotalPrice = (order) => {
    let total = Number(order.product_price || 0);

    if (order.selected_option) {
      Object.values(order.selected_option).forEach((opt) => {
        if (Array.isArray(opt)) {
          opt.forEach((item) => {
            if (typeof item === "object" && item.option_price) {
              total += Number(item.option_price);
            }
          });
        } else if (typeof opt === "object" && opt.option_price) {
          total += Number(opt.option_price);
        }
      });
    }

    return total * (order.purchase_quantity || 1);
  };

  // แสดงตัวเลือกในรายการสั่งซื้อ
  const renderSelectedOptions = (selectedOptions) => {
    if (!selectedOptions) return null;

    return Object.entries(selectedOptions).map(([optionType, optionValue]) => {
      if (Array.isArray(optionValue)) {
        return (
          <div key={optionType} className="text-sm text-gray-600">
            {optionType}:{" "}
            {optionValue
              .map((opt) =>
                typeof opt === "object"
                  ? `${opt.option_value}${opt.option_price ? ` (+${opt.option_price} บาท)` : ""}`
                  : opt
              )
              .join(", ")}
          </div>
        );
      } else if (typeof optionValue === "object" && optionValue !== null) {
        return (
          <div key={optionType} className="text-sm text-gray-600">
            {optionType}: {optionValue.option_value}
            {optionValue.option_price ? ` (+${optionValue.option_price} บาท)` : ""}
          </div>
        );
      } else {
        return (
          <div key={optionType} className="text-sm text-gray-600">
            {optionType}: {optionValue}
          </div>
        );
      }
    });
  };

  if (!seatQRCode) {
    return (
      <div className="p-4 max-w-xl mx-auto text-center">
        <p className="text-red-600 font-bold">
          ❌ ไม่พบเลขโต๊ะ กรุณาเข้าสู่ระบบใหม่อีกครั้ง
        </p>
        <Link href={`/order/product`}>
          <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded">
            กลับไปหน้าเมนู
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h1 className="text-xl font-bold mb-4">🍽 รายการสั่งซื้อโต๊ะ {seatQRCode}</h1>

      {loading ? (
        <p>กำลังโหลดข้อมูล...</p>
      ) : orders.length === 0 ? (
        <p className="text-gray-500">ยังไม่มีคำสั่งซื้อสำหรับโต๊ะนี้</p>
      ) : (
        <ul className="space-y-3">
          {orders.map((order) => (
            <li
              key={order.purchase_id}
              className="border p-4 rounded shadow bg-white"
            >
              <div className="font-bold">{order.product_name}</div>
              <div className="text-sm">จำนวน: {order.purchase_quantity}</div>
              <div className="text-sm">
                ราคา: {calculateTotalPrice(order)} บาท
              </div>
              {renderSelectedOptions(order.selected_option)}
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

      <Link href={`/order/product/${seatQRCode}`} className="fixed bottom-6 left-6 z-50">
        <button className="bg-red-600 hover:bg-red-300 text-white px-4 py-2 rounded-full shadow-lg">
          กลับ
        </button>
      </Link>
    </div>
  );
}
