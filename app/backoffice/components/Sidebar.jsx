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
  AlignJustify,
  X,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";

export default function SidebarLayout({ children }) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const menuItems = [
    {
      label: "หน้าหลัก",
      icon: <LayoutDashboard className="w-5 h-5" />,
      href: "/backoffice/dashboard",
    },
    {
      label: "เมนูอาหาร",
      icon: <Utensils className="w-5 h-5" />,
      href: "/backoffice/product",
    },
    {
      label: "ประเภทอาหาร",
      icon: <Layers className="w-5 h-5" />,
      href: "/backoffice/product_type",
    },
    {
      label: "ตัวเลือกอาหาร",
      icon: <Tags className="w-5 h-5" />,
      href: "/backoffice/product_option",
    },
    {
      label: "ข้อมูลโต๊ะ",
      icon: <ListOrdered className="w-5 h-5" />,
      href: "/backoffice/seat",
    },
    {
      label: "ข้อมูลพนักงาน",
      icon: <UserCog className="w-5 h-5" />,
      href: "/backoffice/staff",
    },
    {
      label: "สั่งซื้อ",
      icon: <ShoppingBasket className="w-5 h-5" />,
      href: "/order/product/${seatQRCode}",
    },
    {
      label: "คำสั่งซื้อตามโต๊ะ",
      icon: <ShoppingBasket className="w-5 h-5" />,
      href: "/backoffice/kitchenontable",
    },
    {
      label: "คำสั่งซื้อตามเมนู",
      icon: <HandPlatter className="w-5 h-5" />,
      href: "/backoffice/kitchenonmenu",
    },
    {
      label: "ชำระเงิน",
      icon: <BadgeDollarSign className="w-5 h-5" />,
      href: "/backoffice/payment",
    },
  ];

  const reportItems = [
    {
      label: "รายงานสรุปรายการอาหารตามวันหรือเดือน",
      href: "/backoffice/reportmenu",
    },
    {
      label: "รายงานการขายรายวันหรือรายเดือน",
      href: "/backoffice/reportdayandmonth",
    },
    {
      label: "รายงานยอดขายรายการอาหารที่ขายดีหรือไม่ดี",
      href: "/backoffice/reportgoodandbad",
    },
  ];

  const isActiveReport = reportItems.some(
    (item) => pathname === item.href || pathname.startsWith(item.href + "/")
  );
  useEffect(() => {
    setIsReportOpen(isActiveReport);
  }, [isActiveReport]);

  const SidebarContent = () => (
    <div className="flex flex-col h-full justify-between">
      <div>
        <div className="bg-orange-500 p-4 rounded-full justify-center items-center mb-4 flex shadow-2xl">
          <Utensils className="w-14 h-14 text-white" />
        </div>
        <h2 className="text-3xl font-bold mb-2">สเต็กนี่หว่า</h2>
        <p className="text-xl text-white font-bold mb-4">NiWha Steak</p>

        <nav className="space-y-2">
          {menuItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <div
                className={`flex items-center text-lg gap-4 p-4 rounded-full shadow-lg cursor-pointer hover:bg-orange-300 transition 
                ${
                  pathname === item.href || pathname.startsWith(item.href + "/")
                    ? "bg-orange-700"
                    : ""
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </div>
            </Link>
          ))}

          {/* Report Dropdown */}
          <div>
            <button
              onClick={() => setIsReportOpen(!isReportOpen)}
              className="flex items-center text-lg gap-3 w-full p-3 rounded-full hover:bg-orange-300 transition"
            >
              <FileText className="w-5 h-5" />
              <span>รายงาน</span>
              <ChevronDown
                className={`ml-auto transition-transform ${
                  isReportOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {isReportOpen && (
              <div className="ml-6 mt-2 space-y-2">
                {reportItems.map((item) => (
                  <Link key={item.href} href={item.href}>
                    <div
                      className={`text-lg px-3 py-2 rounded-full hover:bg-orange-300 transition 
                      ${pathname === item.href ? "bg-orange-700" : ""}`}
                    >
                      {item.label}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </nav>
      </div>

      {status === "authenticated" && session?.user && (
        <div className="mt-4 pt-4 border-t border-white/20">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-lg font-semibold">
                {session.user.name ? session.user.name[0] : "U"}
              </span>
            </div>
            <div className="flex flex-col">
              <p className="text-lg font-medium truncate">
                {session.user.name || "ผู้ใช้"}
              </p>
              <p className="text-sm text-white/80 truncate">
                {session.user.role || "ไม่มีบทบาท"}
              </p>
            </div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex items-center gap-3 w-full p-3 rounded-md hover:bg-orange-300 transition"
          >
            <LogOut className="w-5 h-5" />
            <span>ออกจากระบบ</span>
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <div
        className={`bg-gradient-to-b from-orange-400 to-orange-700 text-white w-64 p-6 h-full z-40 transition-all duration-300
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        fixed md:static top-0 left-0`}
      >
        <button
          onClick={() => setSidebarOpen(false)}
          className="text-white text-2xl mb-4 block md:hidden"
        >
          <X className="w-8 h-8" />
        </button>
        <SidebarContent />
      </div>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col w-full transition-all duration-300">
        <div className="">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-3xl mr-4 md:hidden"
          >
            <AlignJustify className="w-9 h-9 text-black" />
          </button>
        </div>
        <main className="flex-1 p-4 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
