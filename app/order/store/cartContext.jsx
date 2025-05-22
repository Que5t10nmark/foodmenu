"use client";
import { createContext, useContext, useState } from "react";

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);

  // ใช้ selected_options เพื่อสร้าง key ที่ไม่ซ้ำกัน
  const generateCartKey = (product) => {
    const options = product.selected_options || {};
    const optionKey = Object.entries(options)
      .map(([key, value]) => {
        if (Array.isArray(value)) {
          return `${key}:${value.sort().join(",")}`;
        }
        return `${key}:${value}`;
      })
      .sort()
      .join("|");

    const description = product.purchase_description || "";

    return `${product.product_id}-${optionKey}-${description}`;
  };

  const addToCart = (product) => {
    setCart((prevCart) => {
      const key = generateCartKey(product);
      const existingProduct = prevCart.find(
        (item) => generateCartKey(item) === key
      );

      if (existingProduct) {
        return prevCart.map((item) =>
          generateCartKey(item) === key
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [...prevCart, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (product) => {
    setCart((prevCart) => {
      const key = generateCartKey(product);
      return prevCart.flatMap((item) => {
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
