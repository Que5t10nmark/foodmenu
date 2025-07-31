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

  useEffect(() => {
    const seatFromUrl = searchParams.get("seat_qrcode");
    if (seatFromUrl) {
      setSeatQRCode(seatFromUrl);
    }
  }, [searchParams]);

  const calculateOptionsPrice = (selectedOptions) => {
    if (!selectedOptions) return 0;
    let optionTotal = 0;

    for (const optionType in selectedOptions) {
      const optionValue = selectedOptions[optionType];

      if (Array.isArray(optionValue)) {
        optionValue.forEach((option) => {
          if (option && typeof option === "object" && option.product_option_price) {
            optionTotal += Number(option.product_option_price);
          }
        });
      } else if (optionValue && typeof optionValue === "object") {
        if (optionValue.product_option_price) {
          optionTotal += Number(optionValue.product_option_price);
        }
      }
    }
    return optionTotal;
  };

  const total = cart.reduce((sum, cartItem) => {
    const basePrice = cartItem.product_price || 0;
    const quantity = cartItem.quantity || 0;
    const optionsPrice = calculateOptionsPrice(cartItem.selected_option);
    return sum + quantity * (basePrice + optionsPrice);
  }, 0);

  const renderSelectedOptions = (selectedOptions) => {
    if (!selectedOptions) return null;

    return Object.entries(selectedOptions).map(([optionType, optionValue]) => {
      if (Array.isArray(optionValue)) {
        const totalOptionPrice = optionValue.reduce(
          (sum, option) => sum + (Number(option.product_option_price) || 0),
          0
        );
        return (
          <div key={optionType} className="text-sm text-gray-600">
            {optionType}:{" "}
            {optionValue
              .map((option) => option.product_option_value || option)
              .join(", ")}
            {totalOptionPrice > 0 ? ` +${totalOptionPrice} บาท` : ""}
          </div>
        );
      } else if (typeof optionValue === "object" && optionValue !== null) {
        return (
          <div key={optionType} className="text-sm text-gray-600">
            {optionType}: {optionValue.product_option_value || ""}
            {optionValue.product_option_price
              ? ` +${Number(optionValue.product_option_price)} บาท`
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

  const handleConfirm = async () => {
    let finalSeat = seatQRCode;

    if (!finalSeat) {
      finalSeat = prompt("กรุณาใส่หมายเลขโต๊ะ");
      if (!finalSeat) {
        alert("กรุณาใส่หมายเลขโต๊ะก่อนสั่งซื้อ");
        return;
      }
      setSeatQRCode(finalSeat); // อัปเดต state
    }

    try {
      const cartData = cart.map((cartItem) => ({
        product: {
          product_id: cartItem.product_id,
          product_name: cartItem.product_name,
          product_price: cartItem.product_price,
          quantity: cartItem.quantity,
        },
        seat_qrcode: finalSeat,
        selected_option: cartItem.selected_option || {},
        description: cartItem.purchase_description || "",
      }));

      const res = await fetch("/api/purchase", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ cart: cartData, seat_qrcode: finalSeat }),
      });

      if (res.ok) {
        alert("✅ สั่งซื้อเรียบร้อยแล้ว!");
        clearCart();
        router.push(`/order/product/${seatQRCode}`);
      } else {
        alert("❌ สั่งซื้อไม่สำเร็จ");
      }
    } catch (err) {
      console.error(err);
      alert("❌ เกิดข้อผิดพลาด");
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">
        🧾 สรุปรายการสั่งซื้อ {seatQRCode && `โต๊ะ ${seatQRCode}`}
      </h1>

      {cart.length === 0 ? (
        <p>ไม่มีสินค้าในตะกร้า</p>
      ) : (
        <>
          <ul className="space-y-4">
            {cart.map((cartItem, itemIndex) => (
              <li
                key={`${cartItem.product_id}-${itemIndex}`}
                className="border p-3 rounded"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-semibold">
                      {cartItem.product_name} × {cartItem.quantity}
                    </div>

                    {renderSelectedOptions(cartItem.selected_option)}

                    {cartItem.purchase_description && (
                      <div className="text-sm text-gray-600">
                        หมายเหตุ: {cartItem.purchase_description}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => removeFromCart(cartItem)}
                      className="bg-red-500 text-white px-2 rounded"
                    >
                      -
                    </button>
                    <button
                      onClick={() => addToCart(cartItem)}
                      className="bg-green-500 text-white px-2 rounded"
                    >
                      +
                    </button>
                    <div className="font-bold">
                      ฿
                      {cartItem.quantity *
                        (cartItem.product_price +
                          calculateOptionsPrice(cartItem.selected_option))}
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-6 text-right font-bold text-xl">รวม: ฿{total}</div>

          <button
            onClick={() => {
              if (confirm("คุณต้องการล้างตะกร้าทั้งหมดใช่หรือไม่?")) {
                clearCart();
              }
            }}
            className="mt-2 w-full bg-red-600 text-white py-2 rounded hover:bg-red-300"
          >
            🗑 ยกเลิกสินค้าในตะกร้าทั้งหมด
          </button>

          <button
            onClick={() => {
              if (confirm("คุณต้องการยืนยันการสั่งซื้อทั้งหมดใช่หรือไม่?")) {
                handleConfirm();
              }
            }}
            className="mt-4 w-full bg-green-600 text-white py-2 rounded hover:bg-green-300"
          >
            ยืนยันการสั่งซื้อ
          </button>

          <Link href={`/order/product/${seatQRCode}`}>
            <button className="mt-4 w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-300">
              เลือกสินค้าเพิ่ม
            </button>
          </Link>
        </>
      )}
    </div>
  );
}
