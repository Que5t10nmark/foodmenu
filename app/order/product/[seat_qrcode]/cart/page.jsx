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
            {optionType}: {optionValue.map((opt) => opt.product_option_value || opt).join(", ")}
            {priceSum > 0 && ` +${priceSum} บาท`}
          </div>
        );
      } else if (optionValue && typeof optionValue === "object") {
        return (
          <div key={optionType} className="text-sm text-gray-600">
            {optionType}: {optionValue.product_option_value}{" "}
            {optionValue.product_option_price ? `+${optionValue.product_option_price} บาท` : ""}
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
  console.log("seatFromUrl at confirm:", seatFromUrl);
  if (!seatFromUrl || seatFromUrl.trim() === "") {
    showModal("error", "กรุณาใส่หมายเลขโต๊ะก่อนสั่งซื้อ");
    return;
  }

  // ใช้ seatFromUrl แทน seatQRCode ตรงนี้เลย
  const orderItems = cart.map((productItem) => ({
    product: {
      product_id: productItem.product_id,
      product_name: productItem.product_name,
      product_price: productItem.product_price,
      quantity: productItem.quantity,
    },
    seat_qrcode: seatFromUrl,
    selected_option: productItem.selected_option || {},
    description: productItem.purchase_description || "",
  }));

    try {
      const response = await fetch("/api/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cart: orderItems, seat_qrcode: seatQRCode }),
      });

      if (response.ok) {
        showModal("success", `คำสั่งซื้อของโต๊ะ ${seatQRCode} ถูกส่งไปยังครัวแล้ว`);
        setTimeout(() => {
          clearCart();
          router.push(`/order/product/${seatQRCode}`);
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
    <div className="bg-gradient-to-br from-amber-50 via-orange-100 to-rose-100 min-h-screen p-6 font-sarabun">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg sticky top-4 z-20 px-4 py-4 mb-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">
            🧾 สรุปรายการสั่งซื้อ {seatQRCode && `โต๊ะ ${seatQRCode}`}
          </h1>
          <div className="text-sm font-medium text-gray-600">{currentTime}</div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto space-y-6">
        {/* Table Info */}
        <div className="bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-xl shadow-xl p-6">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold text-black">{seatQRCode || "1"}</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold">โต๊ะ {seatQRCode || "1"}</h2>
              <p className="text-emerald-100 text-lg">รายการสั่งซื้อ | เวลา: {currentTime}</p>
            </div>
          </div>
        </div>

        {/* Cart Items */}
        {cart.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <p className="text-gray-600 text-lg font-medium">ไม่มีสินค้าในตะกร้า</p>
            <Link href={`/order/product/${seatQRCode}`}>
              <button className="mt-4 bg-amber-500 text-white py-2 px-6 rounded-lg font-medium hover:bg-amber-600 transition">
                ไปเลือกสินค้า
              </button>
            </Link>
          </div>
        ) : (
          <>
            {cart.map((productItem, productIndex) => (
              <div
                key={productIndex}
                className="bg-white rounded-xl shadow-lg p-5 hover:shadow-2xl hover:-translate-y-1 transition"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900">{productItem.product_name}</h3>
                    {renderSelectedOptions(productItem.selected_option)}
                    {productItem.purchase_description && (
                      <p className="text-sm text-gray-600 mt-1">หมายเหตุ: {productItem.purchase_description}</p>
                    )}
                    <div className="mt-2">
                      <span className="inline-block bg-green-100 text-green-700 text-sm font-medium px-3 py-1 rounded-full">
                        ราคา: {productItem.product_price + calculateOptionsPrice(productItem.selected_option)} บาท
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-green-600">
                      ฿
                      {productItem.quantity *
                        (productItem.product_price + calculateOptionsPrice(productItem.selected_option))}
                    </p>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => removeFromCart(productItem)}
                      className="bg-red-100 text-red-600 rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-200"
                    >
                      -
                    </button>
                    <span className="font-bold text-lg">{productItem.quantity}</span>
                    <button
                      onClick={() => addToCart(productItem)}
                      className="bg-green-100 text-green-600 rounded-full w-8 h-8 flex items-center justify-center hover:bg-green-200"
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => removeFromCart(productItem)}
                    className="text-red-500 hover:text-red-700 text-sm font-medium"
                  >
                    ลบรายการ
                  </button>
                </div>
              </div>
            ))}
          </>
        )}

        {/* Summary */}
        {cart.length > 0 && (
          <>
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold mb-4">สรุปคำสั่งซื้อ</h3>
              <div className="flex justify-between mb-2 text-base">
                <span className="text-gray-600">จำนวน:</span>
                <span>{cart.reduce((sum, productItem) => sum + productItem.quantity, 0)} รายการ</span>
              </div>
              <div className="flex justify-between text-xl font-bold">
                <span>รวม:</span>
                <span className="text-green-600">฿{totalAmount.toFixed(2)}</span>
              </div>
            </div>

            {isReady && (
              <button
                onClick={handleConfirm}
                disabled={!seatQRCode}
                className={`w-full py-4 rounded-xl font-bold text-lg transition ${
                  seatQRCode
                    ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:-translate-y-1"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                ✅ ยืนยันการสั่งซื้อ
              </button>
            )}

            <div className="grid grid-cols-2 gap-4">
              <Link href={`/order/product/${seatQRCode}`}>
                <button className=" bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-xl font-bold">
                  ➕ เลือกสินค้าเพิ่มเติม
                </button>
              </Link>
              <button
                onClick={() => {
                  if (confirm("ล้างตะกร้าทั้งหมด?")) clearCart();
                }}
                className="bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl font-bold"
              >
                ❌ ยกเลิกทั้งหมด
              </button>
            </div>
          </>
        )}
      </div>

      {/* Modal */}
      {modal.show && (
        <div className="fixed inset-0 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl shadow-lg max-w-sm w-full text-center animate-pop">
            <h3 className={`text-lg font-bold ${modal.type === "success" ? "text-green-600" : "text-red-600"}`}>
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
  );
}
