"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ShoppingBasket, BadgeDollarSign, HandPlatter, LogOut, AlignJustify, X } from "lucide-react";
import { useSession, signOut } from "next-auth/react";

export default function KitchenLayoutClient({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const router = useRouter();

  const menuItems = [
    { label: "คำสั่งซื้อตามโต๊ะ", icon: <ShoppingBasket className="w-5 h-5" />, href: "/kitchen/purchase" },
    { label: "คำสั่งซื้อตามเมนู", icon: <HandPlatter className="w-5 h-5" />, href: "/kitchen/purchase/purchase_detail" },
    { label: "ชำระเงิน", icon: <BadgeDollarSign className="w-5 h-5" />, href: "/kitchen/payment" },
  ];

  useEffect(() => {
    if (status === "loading") return;
    if (status !== "authenticated" || session?.user?.role !== "พนักงาน") {
      router.push("/login");
    }
  }, [status, session, router]);

  const SidebarContent = () => (
    <div className="flex flex-col h-full justify-between">
      {/* Logo */}
      <div>
        <div className="text-4xl font-bold mb-2">Steak NiWha</div>

        {/* Menu */}
        <nav className="space-y-2">
          {menuItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <div
                className={`flex items-center gap-3 p-3 rounded-md cursor-pointer hover:bg-orange-300 transition
                ${pathname === item.href || pathname.startsWith(item.href + "/") ? "bg-orange-700 text-white" : ""}`}
              >
                {item.icon}
                <span className="truncate">{item.label}</span>
              </div>
            </Link>
          ))}
        </nav>
      </div>

      {/* User info & logout */}
      {session && (
        <div className="mt-2 pt-2 border-t border-white/30"> {/* ลด mt-4 และ pt-4 เป็น mt-2 และ pt-2 */}
          <div className="flex items-center gap-3 mb-2"> {/* ลด mb-4 เป็น mb-2 */}
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-lg font-semibold">{session.user.name ? session.user.name[0] : "U"}</span>
            </div>
            <div className="flex flex-col">
              <p className="text-lg font-medium truncate">{session.user.name || "ผู้ใช้"}</p>
              <p className="text-sm text-white/80 truncate">{session.user.role || "ไม่มีบทบาท"}</p>
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
      {/* Sidebar slide-in */}
      <div
        className={`bg-orange-500 text-white w-64 p-6 h-full z-40 transition-transform duration-300 absolute
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <button
          onClick={() => setSidebarOpen(false)}
          className="text-white text-2xl mb-4 block"
        >
          <X className="w-8 h-8" />
        </button>
        <SidebarContent />
      </div>

      {/* Main content */}
      <div
        className={`flex-1 flex flex-col w-full transition-all duration-300
        ${sidebarOpen ? "ml-64" : "ml-0"}`}
      >
        {/* Top bar */}
        <div className="bg-white shadow p-4 flex items-center z-10 relative">
          <button onClick={() => setSidebarOpen(true)} className="text-3xl mr-4">
            <AlignJustify className="w-9 h-9 text-black" />
          </button>
          <h1 className="text-2xl font-bold">ห้องครัว</h1>
        </div>

        <main className="flex-1 p-4 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}