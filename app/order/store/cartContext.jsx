"use client";
import { createContext, useContext, useState } from "react";

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);

  // สร้าง key สำหรับแยกสินค้าที่เหมือนกันแต่ตัวเลือกต่างกัน
  const generateCartKey = (product) => {
    const options = product.selected_option || {};
    const optionKey = Object.entries(options)
      .map(([optionType, optionValue]) => {
        if (Array.isArray(optionValue)) {
          // สมมติ optionValue เป็น array ของ object ที่มี option_value
          return `${optionType}:${optionValue
            .map((option) => (typeof option === "object" ? option.option_value : option))
            .sort()
            .join(",")}`;
        }
        // กรณีเป็น object หรือ string ปกติ
        if (typeof optionValue === "object" && optionValue !== null) {
          return `${optionType}:${optionValue.option_value || ""}`;
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

      if (existingProduct) {
        return previousCart.map((item) =>
          generateCartKey(item) === key
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [...previousCart, { ...product, quantity: 1 }];
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
