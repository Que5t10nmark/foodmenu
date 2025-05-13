import { CartProvider } from "@/app/order/store/cartContext";

export default function CustomerLayout({ children }) {
  return <CartProvider>{children}</CartProvider>;
}
