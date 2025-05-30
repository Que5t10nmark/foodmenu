"use client";
import { useState } from "react";
import Sidebar from "./components/Sidebar";
import { AlignJustify, X } from 'lucide-react';

export default function KitchenLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar Slide-in */}
      <div
        className={`bg-orange-500 text-white w-64 p-6 h-full z-40 transition-transform duration-300
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} absolute`}
      >
        {/* ปุ่มปิด */}
        <button
          onClick={() => setSidebarOpen(false)}
          className="text-white text-2xl mb-4 block"
        >
          <X className="w-8 h-8" />
        </button>
        <Sidebar />
      </div>

      {/* Main content */}
      <div
        className={`flex-1 flex flex-col w-full transition-all duration-300
        ${sidebarOpen ? "ml-64" : "ml-0"}`}
      >
        {/* Top bar */}
        <div className="bg-white shadow p-4 flex items-center z-10 relative">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-3xl mr-4"
          >
            <AlignJustify className="w-9 h-9 text-black" />
          </button>
          <h1 className="text-2xl font-bold">ห้องครัว</h1>
        </div>

        <main className="flex-1 p-4 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
