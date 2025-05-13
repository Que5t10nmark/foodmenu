"use client";
import { createContext, useContext, useState } from "react";

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);

  // สร้าง unique key สำหรับสินค้าแต่ละแบบ
  const generateCartKey = (product) => {
    return `${product.product_id}-${product.purchase_size || ""}-${product.purchase_spiceLevel || ""}-${(product.purchase_toppings || []).join(",")}-${product.purchase_description || ""}`;
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
