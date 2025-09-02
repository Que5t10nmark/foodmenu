"use client";
import { useCart } from "../../../store/cartContext";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function CartPage() {
  const { cart, addToCart, removeFromCart, clearCart } = useCart();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [seatQRCode, setSeatQRCode] = useState("");
  const [isReady, setIsReady] = useState(false);
  const [currentTime, setCurrentTime] = useState("");
  const [modal, setModal] = useState({ type: "", message: "", show: false });

  useEffect(() => {
    const seatFromUrl = searchParams.get("seat_qrcode");
    if (seatFromUrl) {
      setSeatQRCode(seatFromUrl);
    }
    setIsReady(true);
  }, [searchParams]);

  useEffect(() => {
    setCurrentTime(
      new Date().toLocaleTimeString("th-TH", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
    );
    const interval = setInterval(() => {
      setCurrentTime(
        new Date().toLocaleTimeString("th-TH", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const calculateOptionsPrice = (selectedOptions) => {
    if (!selectedOptions) return 0;
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

  const totalAmount = cart.reduce((totalSum, productItem) => {
    const basePrice = productItem.product_price || 0;
    const quantity = productItem.quantity || 0;
    const optionPrice = calculateOptionsPrice(productItem.selected_option);
    return totalSum + quantity * (basePrice + optionPrice);
  }, 0);

  const renderSelectedOptions = (selectedOptions) => {
    if (!selectedOptions) return null;
    return Object.entries(selectedOptions).map(([optionType, optionValue]) => {
      if (Array.isArray(optionValue)) {
        const priceSum = optionValue.reduce(
          (sum, option) => sum + Number(option.product_option_price || 0),
          0
        );
        return (
          <div key={optionType} className="text-sm text-gray-600">
            {optionType}:{" "}
            {optionValue
              .map((opt) => opt.product_option_value || opt)
              .join(", ")}
            {priceSum > 0 && ` +${priceSum} บาท`}
          </div>
        );
      } else if (optionValue && typeof optionValue === "object") {
        return (
          <div key={optionType} className="text-sm text-gray-600">
            {optionType}: {optionValue.product_option_value}
            {optionValue.product_option_price
              ? ` +${optionValue.product_option_price} บาท`
              : ""}
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

  const showModal = (type, message) => {
    setModal({ type, message, show: true });
  };

  const handleConfirm = async () => {
    const seatFromUrl = searchParams.get("seat_qrcode");
    if (!seatFromUrl || seatFromUrl.trim() === "") {
      showModal("error", "กรุณาใส่หมายเลขโต๊ะก่อนสั่งซื้อ");
      return;
    }

    // ตรวจสอบว่า cart มี selected_option ที่ถูกต้อง
    const orderItems = cart.map((productItem) => ({
      product: {
        product_id: productItem.product_id,
        product_name: productItem.product_name,
        product_price: productItem.product_price,
        quantity: productItem.quantity,
      },
      seat_qrcode: seatFromUrl,
      selected_option: productItem.selected_option || null, // ส่ง null หากไม่มีตัวเลือก
      description: productItem.purchase_description || "",
    }));

    try {
      const response = await fetch("/api/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cart: orderItems, seat_qrcode: seatFromUrl }),
      });

      if (response.ok) {
        showModal(
          "success",
          `คำสั่งซื้อของโต๊ะ ${seatFromUrl} ถูกส่งไปยังครัวแล้ว`
        );
        setTimeout(() => {
          clearCart();
          router.push(`/order/product/${seatFromUrl}`);
        }, 2000);
      } else {
        showModal("error", "❌ สั่งซื้อไม่สำเร็จ");
      }
    } catch (error) {
      console.error(error);
      showModal("error", "❌ เกิดข้อผิดพลาดในการสั่งซื้อ");
    }
  };

  return (
    <>
      <div className="bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen p-6">
        <div className="bg-white rounded-xl shadow-lg sticky top-4 z-20 px-4 py-4 mb-4">
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
              <h1 className="text-lg font-bold text-gray-800">
                สรุปรายการสั่งซื้อ {seatQRCode && `โต๊ะ ${seatQRCode}`}
              </h1>
            </div>
            <div className="text-sm text-gray-500">{currentTime}</div>
          </div>
        </div>

        <div className="max-w-3xl mx-auto space-y-6">
          <div className="bg-white rounded-2xl card-shadow overflow-hidden">
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-bold text-xl">
                      {seatQRCode || "1"}
                    </span>
                  </div>
                  <div>
                    <h2 className="font-bold text-gray-800 text-lg">
                      โต๊ะ {seatQRCode || "1"}
                    </h2>
                    <p className="text-sm text-gray-500">ออเดอร์</p>
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
                {cart.reduce((sum, item) => sum + (item.quantity || 1), 0)}{" "}
                รายการ
              </div>
            </div>

            <div className="p-4 space-y-4">
              {cart.length === 0 ? (
                <div className="text-center">
                  <p className="text-gray-600 text-lg font-medium">
                    ไม่มีสินค้าในตะกร้า
                  </p>
                  <Link href={`/order/product/${seatQRCode}`}>
                    <button className="mt-4 bg-amber-500 text-white py-2 px-6 rounded-lg font-medium hover:bg-amber-600 transition cursor-pointer">
                      ไปเลือกสินค้า
                    </button>
                  </Link>
                </div>
              ) : (
                cart.map((productItem, productIndex) => (
                  <div
                    key={productIndex}
                    className="flex justify-between items-start border-b border-gray-50 pb-3"
                  >
                    <div className="flex-1">
                      <h3 className="front-bold font-medium text-gray-800 text-lg">
                        {productItem.product_name}
                      </h3>
                      {renderSelectedOptions(productItem.selected_option)}
                      {productItem.purchase_description && (
                        <p className="text-lg text-gray-500">
                          หมายเหตุ: {productItem.purchase_description}
                        </p>
                      )}
                      {/* <div className="flex items-center mt-2 space-x-2">
                        <span className="text-sm bg-blue-100 text-blue-700 px-2 py-1 rounded">
                          จำนวน: {productItem.quantity}
                        </span>
                      </div> */}
                    </div>
                    <div className="text-right ml-4">
                      <p className="font-bold text-gray-800">
                        {productItem.quantity *
                          (productItem.product_price +
                            calculateOptionsPrice(
                              productItem.selected_option
                            ))}{" "}
                        บาท
                      </p>
                      <p className="text-sm text-gray-500">
                        {productItem.product_price}
                        บาท/รายการ
                      </p>
                      <div className="flex items-center justify-end space-x-2 mt-2">
                        <button
                          onClick={() => removeFromCart(productItem)}
                          className="bg-red-100 text-red-600 rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-200"
                        >
                          -
                        </button>
                        <span className="font-bold text-lg">
                          {productItem.quantity}
                        </span>
                        <button
                          onClick={() => addToCart(productItem)}
                          className="bg-green-100 text-green-600 rounded-full w-8 h-8 flex items-center justify-center hover:bg-green-200"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className="px-4 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-t border-gray-100">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-gray-800 text-xl">รวมทั้งหมด</span>
                  <span className="font-bold text-2xl text-blue-600">
                    {totalAmount.toFixed(2)} บาท
                  </span>
                </div>
                <div className="text-lg text-gray-500">
                  รวม{" "}
                  {cart.reduce((sum, item) => sum + (item.quantity || 1), 0)}{" "}
                  รายการ
                </div>
              </div>
            )}
          </div>

          {cart.length > 0 && (
            <>
              {isReady && (
                <button
                  onClick={handleConfirm}
                  disabled={!seatQRCode}
                  className={`w-full py-4 rounded-xl font-bold text-lg transition ${
                    seatQRCode
                      ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:-translate-y-1 cursor-pointer"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  ✅ ยืนยันการสั่งซื้อ
                </button>
              )}
              <div className="grid grid-cols-2 gap-4 mt-4">
                <Link href={`/order/product/${seatQRCode}`}>
                  <button className="bg-gradient-to-r from-blue-400 to-indigo-500 text-white py-3 rounded-xl font-bold cursor-pointer">
                    ➕ เลือกสินค้าเพิ่มเติม
                  </button>
                </Link>
                <button
                  onClick={() => {
                    if (confirm("ล้างตะกร้าทั้งหมด?")) clearCart();
                  }}
                  className="bg-gradient-to-r from-red-400 to-rose-500 text-white py-3 rounded-xl font-bold cursor-pointer"
                >
                  ❌ ยกเลิกทั้งหมด
                </button>
              </div>
            </>
          )}
        </div>

        {modal.show && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm ">
            <div className="bg-white p-6 rounded-xl shadow-lg max-w-sm w-full text-center animate-pop">
              <h3
                className={`text-lg font-bold ${
                  modal.type === "success" ? "text-green-600" : "text-red-600"
                }`}
              >
                {modal.type === "success" ? "✅ สำเร็จ" : "❌ ข้อผิดพลาด"}
              </h3>
              <p className="text-gray-700 mt-2 mb-4">{modal.message}</p>
              <button
                onClick={() => setModal({ ...modal, show: false })}
                className="bg-gray-700 text-white py-2 px-4 rounded-lg hover:bg-gray-800 transition"
              >
                ปิด
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
