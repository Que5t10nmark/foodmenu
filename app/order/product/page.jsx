"use client";
import { useEffect, useState } from "react";
import { useCart } from "../store/cartContext";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

export default function ProductPage() {
  const { seatId } = useSearchParams();
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("ทั้งหมด");
  const [message, setMessage] = useState("");
  const { addToCart, cart } = useCart();
  const router = useRouter();

  useEffect(() => {
    fetch("/api/product")
      .then((res) => res.json())
      .then(setProducts);
  }, []);

  const handleDetail = (product) => {
    router.push(`/order/product/product_detail/${product.product_id}`);
  };

  const handleAddToCart = (product, e) => {
    e.stopPropagation();
    // addToCart(product);
    router.push(`/order/product/product_detail/${product.product_id}`);
  };

  const categories = [
    "ทั้งหมด",
    ...Array.from(new Set(products.map((p) => p.product_type_name))),
  ];

  const filteredProducts =
    selectedCategory === "ทั้งหมด"
      ? products
      : products.filter((p) => p.product_type_name === selectedCategory);

  // เรียงสินค้าที่ไม่มีสินค้าไว้ล่างสุด
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (a.product_status === "มีสินค้า" && b.product_status !== "มีสินค้า")
      return -1;
    if (a.product_status !== "มีสินค้า" && b.product_status === "มีสินค้า")
      return 1;
    return 0;
  });

  return (
    <div className="p-4 relative">
      <h1 className="text-xl font-bold mb-4">🍽️ เมนูสำหรับโต๊ะ {seatId}</h1>

      <div className="flex space-x-2 overflow-x-auto mb-4 pb-2">
        {categories.map((category) => (
          <button
            key={category}
            className={`px-4 py-1 rounded-full border whitespace-nowrap ${
              selectedCategory === category
                ? "bg-orange-500 text-white"
                : "bg-white text-gray-700"
            }`}
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </button>
        ))}

        <Link href={`/order/cart/cart_detail/${seatId}`}>
        <div className="px-4 py-1 rounded-full border whitespace-nowrap">
          รายการสั่งซื้อ
        </div>
        </Link>

      </div> 
      {message && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded shadow z-50">
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {sortedProducts.map((p) => {
          const isOutOfStock = p.product_status !== "มีสินค้า";
          return (
            <div
              key={p.product_id}
              className={`border rounded-xl shadow-sm p-2 flex flex-col transform transition-transform ${
                isOutOfStock
                  ? "bg-gray-200 cursor-not-allowed"
                  : "cursor-pointer hover:scale-101"
              }`}
              onClick={() => {
                if (!isOutOfStock) handleDetail(p);
              }}
            >
              <div
                className={`text-center font-bold mb-2 ${
                  isOutOfStock ? "text-gray-500" : ""
                }`}
              >
                {p.product_name}
              </div>
              <div className="relative w-full h-40">
                {p.product_image ? (
                  <Image
                    src={"/uploads/" + p.product_image}
                    alt={p.product_name}
                    fill
                    className={`object-cover rounded ${
                      isOutOfStock ? "opacity-50" : ""
                    }`}
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    No Image
                  </div>
                )}
              </div>
              <div
                className={`mt-2 text-center font-semibold ${
                  isOutOfStock ? "text-gray-500" : "text-green-600"
                }`}
              >
                ฿{p.product_price}
              </div>

              <button
                disabled={isOutOfStock}
                className={`mt-2 py-1 rounded ${
                  isOutOfStock
                    ? "bg-gray-400 text-white cursor-not-allowed"
                    : "bg-orange-500 text-white"
                }`}
                onClick={(e) => {
                  if (!isOutOfStock) handleAddToCart(p, e);
                }}
              >
                {isOutOfStock ? "❌ ไม่มีสินค้า" : "เพิ่มในตะกร้า"}
              </button>
            </div>
          );
        })}
      </div>

      <Link href={`/order/cart`} className="fixed bottom-6 right-6 z-50">
        <button className="bg-green-600 text-white px-4 py-2 rounded-full shadow-lg">
          🛒 ไปยังตะกร้า ({cart.reduce((sum, item) => sum + item.quantity, 0)})
        </button>
      </Link>

      {/* <Link href={`/backoffice/product`} className="fixed bottom-6 left-6 z-50">
        <button className="bg-red-600 text-white px-4 py-2 rounded-full shadow-lg">
          กลับ
        </button>
      </Link> */}
    </div>
  );
}
