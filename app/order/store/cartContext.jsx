"use client";
import { createContext, useContext, useState } from "react";

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

// ฟังก์ชันคำนวณราคาสินค้ารวมตัวเลือก
const calculateTotalPrice = (product) => {
  const basePrice = product.product_price || 0;
  let optionsPrice = 0;

  const options = product.selected_option || {};

  Object.values(options).forEach((optionValue) => {
    if (Array.isArray(optionValue)) {
      optionValue.forEach((opt) => {
        optionsPrice += (opt.product_option_price || 0);
      });
    } else if (typeof optionValue === "object" && optionValue !== null) {
      optionsPrice += (optionValue.product_option_price || 0);
    }
  });

  return basePrice + optionsPrice;
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);

  // สร้าง key สำหรับแยกสินค้าที่เหมือนกันแต่ตัวเลือกต่างกัน
  const generateCartKey = (product) => {
    const options = product.selected_option || {};
    const optionKey = Object.entries(options)
      .map(([optionType, optionValue]) => {
        if (Array.isArray(optionValue)) {
          return `${optionType}:${optionValue
            .map((option) => (typeof option === "object" ? option.product_option_value : option))
            .sort()
            .join(",")}`;
        }
        if (typeof optionValue === "object" && optionValue !== null) {
          return `${optionType}:${optionValue.product_option_value || ""}`;
        }
        return `${optionType}:${optionValue}`;
      })
      .sort()
      .join("|");

    const description = product.purchase_description || "";

    return `${product.product_id}-${optionKey}-${description}`;
  };

  const addToCart = (product) => {
    setCart((previousCart) => {
      const key = generateCartKey(product);
      const existingProduct = previousCart.find(
        (item) => generateCartKey(item) === key
      );

      // คำนวณราคาสินค้ารวมตัวเลือกก่อนเก็บลงตะกร้า
      const updatedProduct = {
        ...product,
        total_price: calculateTotalPrice(product),
      };

      if (existingProduct) {
        return previousCart.map((item) =>
          generateCartKey(item) === key
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [...previousCart, { ...updatedProduct, quantity: 1 }];
    });
  };

  const removeFromCart = (product) => {
    setCart((previousCart) => {
      const key = generateCartKey(product);
      return previousCart.flatMap((item) => {
        if (generateCartKey(item) === key) {
          if (item.quantity > 1) {
            return [{ ...item, quantity: item.quantity - 1 }];
          } else {
            return [];
          }
        }
        return [item];
      });
    });
  };

  const clearCart = () => {
    setCart([]);
  };

  return (
    <CartContext.Provider
      value={{ cart, addToCart, removeFromCart, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
};
