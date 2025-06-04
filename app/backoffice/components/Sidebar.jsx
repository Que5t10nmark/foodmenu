"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ShoppingBasket,
  BadgeDollarSign,
  HandPlatter,
  Utensils,
  ListOrdered,
  UserCog,
  LayoutDashboard,
  Tags,
  Layers,
  FileText,
  ChevronDown,
} from "lucide-react";
import { useState } from "react";

export default function Sidebar() {
  const pathname = usePathname();

  const menuItems = [
    { label: "หน้าหลัก", icon: <LayoutDashboard className="w-5 h-5" />, href: "/" },
    { label: "เมนูอาหาร", icon: <Utensils className="w-5 h-5" />, href: "/backoffice/product" },
    { label: "ประเภทอาหาร", icon: <Layers className="w-5 h-5" />, href: "/backoffice/product_type" },
    { label: "ตัวเลือกอาหาร", icon: <Tags className="w-5 h-5" />, href: "/backoffice/product_option" },
    { label: "ข้อมูลโต๊ะ", icon: <ListOrdered className="w-5 h-5" />, href: "/backoffice/seat" },
    { label: "ข้อมูลพนักงาน", icon: <UserCog className="w-5 h-5" />, href: "/backoffice/staff" },
    { label: "สั่งซื้อ", icon: <ShoppingBasket className="w-5 h-5" />, href: "/order/product" },
    { label: "คำสั่งซื้อตามโต๊ะ", icon: <ShoppingBasket className="w-5 h-5" />, href: "/kitchen/purchase" },
    { label: "คำสั่งซื้อตามเมนู", icon: <HandPlatter className="w-5 h-5" />, href: "/kitchen/purchase/purchase_detail" },
    { label: "ชำระเงิน", icon: <BadgeDollarSign className="w-5 h-5" />, href: "/kitchen/payment" },
  ];

  const reportItems = [
    { label: "รายงานสรุปรายการอาหารตามวันหรือเดือน", href: "/backoffice/reportdayandmonth" },
    { label: "รายงานการขายรายวันหรือรายเดือน", href: "/backoffice/reportmenu" },
    { label: "รายงานยอดขายรายการอาหารที่ขายดีหรือไม่ดี", href: "/backoffice/reportgoodandbad" },
  ];

  // เช็คว่าหน้าปัจจุบันอยู่ในรายงานหรือไม่
  const isActiveReport = reportItems.some((item) =>
    pathname === item.href || pathname.startsWith(item.href + "/")
  );
  const [isReportOpen, setIsReportOpen] = useState(isActiveReport);

  return (
    <aside className="bg-orange-500 text-white w-70 min-h-screen p-6 flex flex-col">
      <h2 className="text-4xl font-bold mb-6">Steak NiWha</h2>

      <nav className="space-y-2">
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

        {/* เมนูรายงาน */}
        <div>
          <button
            onClick={() => setIsReportOpen(!isReportOpen)}
            className="flex items-center text-lg gap-3 w-full p-3 rounded-md hover:bg-orange-300 transition"
          >
            <FileText className="w-5 h-5" />
            <span>รายงาน</span>
            <ChevronDown className={`ml-auto transition-transform ${isReportOpen ? "rotate-180" : ""}`} />
          </button>

          {isReportOpen && (
            <div className="ml-6 mt-2 space-y-2">
              {reportItems.map((item) => (
                <Link key={item.href} href={item.href}>
                  <div
                    className={`text-lg px-3 py-2 rounded-md hover:bg-orange-300 transition 
                    ${pathname === item.href || pathname.startsWith(item.href + "/") ? "bg-orange-700" : ""}`}
                  >
                    {item.label}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </nav>
    </aside>
  );
}
