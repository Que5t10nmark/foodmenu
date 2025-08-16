"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Head from "next/head";

export default function MyOrderPage() {
  const params = useParams();
  const seatQRCode = params.seat_qrcode;
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
          (order) => String(order.seat_id) === String(seatQRCode)
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

  const calculateOptionsPrice = (selectedOptions) => {
    if (!selectedOptions || typeof selectedOptions !== "object") return 0;
    let totalOptionPrice = 0;
    for (const optionType in selectedOptions) {
      const optionValue = selectedOptions[optionType];
      if (Array.isArray(optionValue)) {
        optionValue.forEach((option) => {
          totalOptionPrice += Number(option?.product_option_price || 0);
        });
      } else if (optionValue && typeof optionValue === "object") {
        totalOptionPrice += Number(optionValue.product_option_price || 0);
      }
    }
    return totalOptionPrice;
  };

  const calculateTotalPrice = (order) => {
    const basePrice = Number(order.product_price || 0);
    const quantity = Number(order.purchase_quantity || 1);
    const optionPrice = calculateOptionsPrice(order.selected_option);
    return quantity * (basePrice + optionPrice);
  };

  const renderSelectedOptions = (selectedOptions) => {
    if (!selectedOptions || typeof selectedOptions !== "object") return null;
    return Object.entries(selectedOptions).map(([optionType, optionValue]) => {
      if (Array.isArray(optionValue)) {
        return (
          <div key={optionType} className="text-sm text-gray-500">
            {optionType}:{" "}
            {optionValue
              .map((opt) => {
                if (typeof opt === "object" && opt !== null) {
                  return `${opt.product_option_value}${
                    opt.product_option_price
                      ? ` (+${Number(opt.product_option_price).toFixed(2)} บาท)`
                      : ""
                  }`;
                }
                return null;
              })
              .filter(Boolean)
              .join(", ")}
          </div>
        );
      } else if (typeof optionValue === "object" && optionValue !== null) {
        return (
          <div key={optionType} className="text-sm text-gray-500">
            {optionType}: {optionValue.product_option_value}
            {optionValue.product_option_price
              ? ` (+${Number(optionValue.product_option_price).toFixed(2)} บาท)`
              : ""}
          </div>
        );
      } else {
        return (
          <div key={optionType} className="text-sm text-gray-500">
            {optionType}: {optionValue}
          </div>
        );
      }
    });
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "กำลังทำ":
        return "bg-yellow-400 text-white px-4 py-2 rounded-full text-lg font-medium";
      case "เสร็จแล้ว":
        return "bg-green-500 text-white px-4 py-2 rounded-full text-lg font-medium";
      default:
        return "bg-gray-100 text-gray-700 px-2 py-1 rounded text-lg";
    }
  };

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const timeString = now.toLocaleTimeString("th-TH", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
      const currentTimeElement = document.getElementById("currentTime");
      if (currentTimeElement) {
        currentTimeElement.textContent = timeString;
      }
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const cards = document.querySelectorAll(".bg-white.rounded-2xl");
    cards.forEach((card) => {
      card.addEventListener("click", function () {
        this.style.transform = "scale(0.98)";
        setTimeout(() => {
          this.style.transform = "scale(1)";
        }, 150);
      });
    });
  }, [orders]);

  return (
    <>
      <Head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>สถานะออเดอร์</title>
        <link
          href="https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </Head>
      <div className="bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen">
        <div className="bg-white shadow-lg sticky top-0 z-10">
          <div className="px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    ></path>
                  </svg>
                </div>
                <h1 className="text-2xl font-bold text-gray-800">
                  สถานะออเดอร์
                </h1>
              </div>
              <div className="text-sm text-gray-500" id="currentTime"></div>
            </div>
          </div>
        </div>

        <div className="px-4 py-6">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl card-shadow overflow-hidden mb-6">
              <div className="p-4 border-b border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-bold text-2xl">
                        {seatQRCode}
                      </span>
                    </div>
                    <div>
                      <h2 className="font-bold text-gray-800 text-2xl">
                        โต๊ะ {seatQRCode}
                      </h2>
                      <p className="text-xl text-gray-500">ออเดอร์ทั้งหมด</p>
                    </div>
                  </div>
                </div>
                <div className="text-lg text-gray-400">
                  เวลาสั่ง:{" "}
                  {new Date().toLocaleTimeString("th-TH", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}{" "}
                  | จำนวน{" "}
                  {orders.reduce(
                    (sum, order) => sum + (order.purchase_quantity || 1),
                    0
                  )}{" "}
                  รายการ
                </div>
              </div>

              <div className="p-4 space-y-4">
                {loading ? (
                  <p className="text-gray-500 text-center">
                    กำลังโหลดข้อมูล...
                  </p>
                ) : orders.length === 0 ? (
                  <p className="text-gray-500 text-center">
                    ยังไม่มีคำสั่งซื้อสำหรับโต๊ะนี้
                  </p>
                ) : (
                  orders.map((order) => (
                    <div
                      key={order.purchase_id}
                      className="flex justify-between items-start border-b border-gray-50 pb-3"
                    >
                      <div className="flex-1">
                        <h3 className="text-2xl font-medium text-gray-800">
                          {order.product_name}
                        </h3>
                        {renderSelectedOptions(order.selected_option)}
                        {order.purchase_description && (
                          <p className="text-sm text-gray-500">
                            หมายเหตุ: {order.purchase_description}
                          </p>
                        )}
                        <div className="flex items-center mt-2 space-x-2">
                          <span className="text-xl bg-blue-100 text-blue-700 px-2 py-1 rounded">
                            จำนวน: {order.purchase_quantity}
                          </span>
                          <span
                            className={getStatusClass(order.purchase_status)}
                          >
                            {order.purchase_status}
                          </span>
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <p className="text-lg font-bold text-gray-800">
                          {calculateTotalPrice(order).toFixed(2)} บาท
                        </p>
                        <p className="text-sm text-gray-500">
                          {(calculateTotalPrice(order) / order.purchase_quantity).toFixed(2)}{" "}
                          บาท/รายการ
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="px-4 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-t border-gray-100">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-2xl font-bold text-gray-800">รวมทั้งหมด</span>
                  <span className="font-bold text-2xl text-blue-600">
                    {orders.reduce(
                      (sum, order) => sum + calculateTotalPrice(order),
                      0
                    ).toFixed(2)}{" "}
                    บาท
                  </span>
                </div>
                <div className="text-lg text-gray-500">
                  รวม{" "}
                  {orders.reduce(
                    (sum, order) => sum + (order.purchase_quantity || 1),
                    0
                  )}{" "}
                  รายการ
                </div>
              </div>
            </div>

            <Link
              href={`/order/product/${seatQRCode}`}
              className="fixed bottom-6 left-6 z-50"
            >
              <button className="bg-red-600 hover:bg-red-300 text-white px-4 py-2 rounded-full shadow-lg">
                กลับ
              </button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}