"use client";
import { useState } from "react";
import Link from "next/link";

export default function Sidebar() {
  const [isReportOpen, setIsReportOpen] = useState(false);

  const toggleReportMenu = () => {
    setIsReportOpen((prev) => !prev);
  };

  return (
    <aside className="bg-orange-500 text-white w-1/6 min-h-screen p-6 flex flex-col">
      <h2 className="text-2xl font-bold mb-6">Steak NiWha</h2>

      <nav className="flex flex-col space-y-4">
        <Link
          href="/"
          className="hover:bg-white hover:text-orange-500 text-white px-4 py-2 rounded-md"
        >
          หน้าหลัก
        </Link>
        <Link
          href="/backoffice/product"
          className="hover:bg-white hover:text-orange-500 text-white px-4 py-2 rounded-md"
        >
          เมนูอาหาร
        </Link>
        <Link
          href="/backoffice/product_type"
          className="hover:bg-white hover:text-orange-500 text-white px-4 py-2 rounded-md"
        >
          ประเภทอาหาร
        </Link>
        <Link
          href="/backoffice/product_option"
          className="hover:bg-white hover:text-orange-500 text-white px-4 py-2 rounded-md"
        >
          ตัวเลือกอาหาร
        </Link>
        <Link
          href="/backoffice/seat"
          className="hover:bg-white hover:text-orange-500 text-white px-4 py-2 rounded-md"
        >
          ข้อมูลโต๊ะ
        </Link>
        <Link
          href="/backoffice/staff"
          className="hover:bg-white hover:text-orange-500 text-white px-4 py-2 rounded-md"
        >
          ข้อมูลพนักงาน
        </Link>
        <Link
          href="/order/product"
          className="hover:bg-white hover:text-orange-500 text-white px-4 py-2 rounded-md"
        >
          สั่งซื้อ
        </Link>
        <Link
          href="/order/cart"
          className="hover:bg-white hover:text-orange-500 text-white px-4 py-2 rounded-md"
        >
          รายการสั่งซื้อ
        </Link>

        {/* ปุ่มรายงาน */}
        <div className="flex flex-col">
          <button
            onClick={toggleReportMenu}
            className="hover:bg-white hover:text-orange-500 text-white px-4 py-2 rounded-md text-left w-full"
            suppressHydrationWarning
          >
            รายงาน
          </button>

          {/* Dropdown submenu */}
          {isReportOpen && (
            <div className="flex flex-col space-y-2 pl-4 mt-2">
              <Link
                href="/backoffice/reportdayandmonth"
                className="hover:bg-white hover:text-orange-500 text-white px-4 py-2 rounded-md"
              >
                รายงานสรุปรายการอาหารตามวันหรือเดือน
              </Link>
              <Link
                href="/backoffice/reportmenu"
                className="hover:bg-white hover:text-orange-500 text-white px-4 py-2 rounded-md"
              >
                รายงานการขายรายวันหรือรายเดือน
              </Link>
              <Link
                href="/backoffice/reportgoodandbad"
                className="hover:bg-white hover:text-orange-500 text-white px-4 py-2 rounded-md"
              >
                รายงานยอดขายรายการอาหารที่ขายดีหรือไม่ดี
              </Link>
            </div>
          )}
        </div>
      </nav>
    </aside>
  );
}
