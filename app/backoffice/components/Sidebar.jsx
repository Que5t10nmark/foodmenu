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
  LogOut,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";

export default function Sidebar() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [isReportOpen, setIsReportOpen] = useState(false);

  const menuItems = [
    { label: "หน้าหลัก", icon: <LayoutDashboard className="w-5 h-5" />, href: "/" },
    { label: "เมนูอาหาร", icon: <Utensils className="w-5 h-5" />, href: "/backoffice/product" },
    { label: "ประเภทอาหาร", icon: <Layers className="w-5 h-5" />, href: "/backoffice/product_type" },
    { label: "ตัวเลือกอาหาร", icon: <Tags className="w-5 h-5" />, href: "/backoffice/product_option" },
    { label: "ข้อมูลโต๊ะ", icon: <ListOrdered className="w-5 h-5" />, href: "/backoffice/seat" },
    { label: "ข้อมูลพนักงาน", icon: <UserCog className="w-5 h-5" />, href: "/backoffice/staff" },
    { label: "สั่งซื้อ", icon: <ShoppingBasket className="w-5 h-5" />, href: "/order/product/${seatQRCode}" },
    { label: "คำสั่งซื้อตามโต๊ะ", icon: <ShoppingBasket className="w-5 h-5" />, href: "/kitchen/purchase" },
    { label: "คำสั่งซื้อตามเมนู", icon: <HandPlatter className="w-5 h-5" />, href: "/kitchen/purchase/purchase_detail" },
    { label: "ชำระเงิน", icon: <BadgeDollarSign className="w-5 h-5" />, href: "/kitchen/payment" },
  ];

  const reportItems = [
    { label: "รายงานสรุปรายการอาหารตามวันหรือเดือน", href: "/backoffice/reportmenu" },
    { label: "รายงานการขายรายวันหรือรายเดือน", href: "/backoffice/reportdayandmonth" },
    { label: "รายงานยอดขายรายการอาหารที่ขายดีหรือไม่ดี", href: "/backoffice/reportgoodandbad" },
  ];

  // Check if current page is a report page
  const isActiveReport = reportItems.some((item) => pathname === item.href || pathname.startsWith(item.href + "/"));

  // Set report menu open state based on current page
  useEffect(() => {
    setIsReportOpen(isActiveReport);
  }, [isActiveReport]);

  // Log session for debugging
  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      console.log("Sidebar session:", { name: session.user.name, role: session.user.role });
    }
  }, [session, status]);

  return (
    <aside className="bg-gradient-to-b from-orange-400 to-orange-700 text-white w-70 min-h-screen p-6 flex flex-col">
      <h2 className="text-4xl font-bold mb-6">Steak NiWha</h2>

      <nav className="space-y-2 flex-1">
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

        {/* Report Menu */}
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

      {/* User Info and Logout Button */}
      <div className="mt-6 pt-4 border-t border-white/30">
        {status === "authenticated" && session?.user ? (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3 p-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-lg font-semibold">
                  {session.user.name ? session.user.name[0] : "U"}
                </span>
              </div>
              <div>
                <p className="text-lg font-medium">{session.user.name || "ผู้ใช้"}</p>
                <p className="text-sm text-white/80">{session.user.role || "ไม่มีบทบาท"}</p>
              </div>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="flex items-center text-lg gap-3 p-3 rounded-md hover:bg-orange-300 transition"
            >
              <LogOut className="w-5 h-5" />
              <span>ออกจากระบบ</span>
            </button>
          </div>
        ) : (
          <p className="text-sm text-white/80">กำลังโหลดข้อมูลผู้ใช้...</p>
        )}
      </div>
    </aside>
  );
}