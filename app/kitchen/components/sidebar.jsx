"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ShoppingBasket,
  BadgeDollarSign,
  HandPlatter 
} from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();

  const menuItems = [
    { label: "คำสั่งซื้อตามโต๊ะ", icon: <ShoppingBasket className="w-5 h-5" />, href: "/kitchen/purchase" },
    { label: "คำสั่งซื้อตามเมนู", icon: <HandPlatter  className="w-5 h-5" />, href: "/kitchen/purchase/purchase_detail"},
    { label: "ชำระเงิน", icon: <BadgeDollarSign className="w-5 h-5" />, href: "/kitchen/payment" },
  ];

  return (
    <nav className="text-white space-y-2">
      <h2 className="text-3xl font-bold mb-4">เมนูจัดการ</h2>
      {menuItems.map((item) => (
        <Link key={item.href} href={item.href}>
          <div
            className={`flex items-center text-lg gap-3 p-3 rounded-md cursor-pointer hover:bg-orange-300 transition 
            ${pathname === item.href || pathname.startsWith(item.href + "/") ? "bg-orange-700" : ""}`}
          >
            {item.icon}
            <span>{item.label}</span>
          </div>
        </Link>
      ))}
    </nav>
  );
}
