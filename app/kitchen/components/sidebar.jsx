"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ShoppingBasket,
  Layers,
  BadgeDollarSign
} from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();

  const menuItems = [
    { label: "คำสั่งซื้อตามโต๊ะ", icon: <ShoppingBasket className="w-5 h-5" />, href: "/kitchen/purchase" },
    { label: "คำสั่งซื้อตามเมนู", icon: <Layers className="w-5 h-5" />, href: "/kitchen/purchase/purchase_detail"},
    { label: "ชำระเงิน", icon: <BadgeDollarSign className="w-5 h-5" />, href: "/kitchen/payment" },
  ];

  return (
    <nav className="text-white space-y-2">
      <h2 className="text-xl font-bold mb-4">เมนูจัดการ</h2>
      {menuItems.map((item) => (
        <Link key={item.href} href={item.href}>
          <div
            className={`flex items-center gap-3 p-3 rounded-md cursor-pointer hover:bg-orange-300 transition 
            ${pathname.startsWith(item.href) ? "bg-orange-500" : ""}`}
          >
            {item.icon}
            <span>{item.label}</span>
          </div>
        </Link>
      ))}
    </nav>
  );
}
