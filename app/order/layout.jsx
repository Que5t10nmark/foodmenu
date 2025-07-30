import { CartProvider } from "./store/cartContext";

export default function CustomerLayout({ children }) {
  return <CartProvider>{children}</CartProvider>;
}
