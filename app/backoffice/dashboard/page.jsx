"use client";
import { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import Chart from "chart.js/auto";
import Link from "next/link";
import { LayoutDashboard, Utensils, ListOrdered, FileText, Grid, Users, DollarSign } from "lucide-react";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const [dashboardData, setDashboardData] = useState({
    menuCount: 0,
    tableCount: 0,
    tablesAvailable: 0,
    staffCount: 0,
    dailySales: 0,
    topMenus: [],
    seats: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (status === "authenticated") {
      fetchDashboardData();
    }
  }, [status]);

  useEffect(() => {
    const menuCtx = document.getElementById("menuChart")?.getContext("2d");
    if (menuCtx) {
      if (chartRef.current) {
        chartRef.current.destroy();
      }

      chartRef.current = new Chart(menuCtx, {
        type: "bar",
        data: {
          labels: dashboardData.topMenus.map((menu) => menu.product_name),
          datasets: [
            {
              label: "จำนวนที่ขาย (จาน)",
              data: dashboardData.topMenus.map((menu) => menu.total_sold),
              backgroundColor: "#667eea",
              borderRadius: 8,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: { stepSize: 1 },
              grid: { color: "rgba(0,0,0,0.05 " },
            },
            x: { grid: { display: false } },
          },
        },
      });
    }

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
    };
  }, [dashboardData.topMenus]);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/dashboard", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.accessToken}`,
        },
      });

      if (!response.ok) {
        const contentType = response.headers.get("content-type");
        let errorMessage = "ไม่สามารถดึงข้อมูลแดชบอร์ดได้";
        if (contentType && contentType.includes("text/html")) {
          const text = await response.text();
          throw new Error(`ได้รับ HTML แทน JSON (สถานะ: ${response.status}): ${text.slice(0, 100)}`);
        }
        const errorData = await response.json();
        throw new Error(errorData.message || errorMessage);
      }

      const data = await response.json();
      setDashboardData(data);
    } catch (error) {
      setError(`เกิดข้อผิดพลาดในการดึงข้อมูล: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50 font-kanit">
        <div className="text-2xl text-gray-600 animate-pulse">กำลังโหลด...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-gray-50 font-kanit">
        <div className="text-2xl text-red-500 mb-4">เกิดข้อผิดพลาด: {error}</div>
        <button
          onClick={fetchDashboardData}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
        >
          ลองใหม่
        </button>
      </div>
    );
  }

  return (
    <div className="w-full bg-gray-50 font-kanit">
      {/* Header */}
      <header className="bg-gradient-to-br from-amber-700 via-amber-500 to-orange-300 text-white shadow-lg">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-opacity-20 p-2 rounded-lg">
                <LayoutDashboard className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Dashboard</h1>
                <p className="text-white text-opacity-80 text-xl">ระบบบริหารจัดการร้านอาหาร</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-white text-opacity-80 text-3xl">วันนี้</p>
                <p className="text-xl font-semibold">
                  {new Date().toLocaleDateString("th-TH", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    timeZone: "Asia/Bangkok",
                  })}
                </p>
              </div>
              <div className="bg-opacity-20 p-2 rounded-lg">
                <Grid className="w-6 h-6" />
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          <Link href="/backoffice/product">
            <button className="bg-white hover:bg-orange-300 border border-gray-300 rounded-xl shadow-md p-4 card-hover cursor-pointer text-center transition-all duration-300 w-full">
              <div className="bg-orange-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
                <Utensils className="w-6 h-6 text-orange-600" />
              </div>
              <p className="text-2xl text-black font-bold">จัดการเมนู</p>
            </button>
          </Link>
          <Link href="/backoffice/seat">
            <button className="bg-white hover:bg-green-300 border border-gray-300 cursor-pointer rounded-xl shadow-md p-4 card-hover text-center transition-all duration-300 w-full">
              <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
                <ListOrdered className="w-6 h-6 text-green-600" />
              </div>
             

 <p className="text-2xl font-bold text-black">จัดการโต๊ะ</p>
            </button>
          </Link>
          <Link href="/backoffice/reportmenu">
            <button className="bg-white hover:bg-purple-300 border border-gray-300 cursor-pointer rounded-xl shadow-md p-4 card-hover text-center transition-all duration-300 w-full">
              <div className="bg-purple-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
                <FileText className="w-6 h-6 text-purple-600" />
              </div>
              <p className="text-2xl font-bold text-black">รายงาน</p>
            </button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6 card-hover">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-800 text-xl font-bold">เมนูอาหาร</p>
                <p className="text-3xl font-bold text-gray-800 mt-1">{dashboardData.menuCount}</p>
                <p className="text-green-500 text-xl mt-2">
                  <span className="font-medium">+0</span> เมนูใหม่
                </p>
              </div>
              <div className="bg-orange-100 p-3 rounded-full">
                <Utensils className="w-8 h-8 text-orange-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 card-hover">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-800 text-xl font-bold">โต๊ะในร้าน</p>
                <p className="text-3xl font-bold text-gray-800 mt-1">{dashboardData.tableCount}</p>
                <p className="text-blue-500 text-xl mt-2">
                  <span className="font-medium">{dashboardData.tablesAvailable}</span> โต๊ะว่าง
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <ListOrdered className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 card-hover">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-800 text-xl font-bold">พนักงาน</p>
                <p className="text-3xl font-bold text-gray-800 mt-1">{dashboardData.staffCount}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <Users className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 card-hover">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-800 text-xl font-bold">ยอดขายวันนี้</p>
                <p className="text-3xl font-bold text-gray-800 mt-1">฿{dashboardData.dailySales.toLocaleString()}</p>
                {/* <p className="text-green-500 text-xl mt-2">
                  <span className="font-medium">+0%</span> จากเมื่อวาน
                </p> */}
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <DollarSign className="w-8 h-8 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Chart and Status Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white border border-gray-300 rounded-xl shadow-md p-6">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">สัดส่วนเมนูยอดนิยม (กราฟแท่ง)</h3>
            <div className="h-64">
              <canvas id="menuChart"></canvas>
            </div>
          </div>
          <div className="bg-white border border-gray-300 rounded-xl shadow-md p-6">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">สถานะโต๊ะ</h3>
            <div className="grid grid-cols-6 gap-2">
              {dashboardData.seats.map((seat) => (
                <div
                  key={seat.seat_id}
                  className={`aspect-square rounded-lg flex items-center justify-center text-3xl font-bold ${
                    !seat.isOccupied ? "bg-green-300 text-green-800" : "bg-red-300 text-red-800"
                  }`}
                >
                  {seat.seat_qrcode}
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-4 text-2xl">
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-green-300 rounded"></div>
                <span className="text-gray-600">ว่าง ({dashboardData.tablesAvailable})</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-red-300 rounded"></div>
                <span className="text-gray-600">มีออเดอร์ ({dashboardData.tableCount - dashboardData.tablesAvailable})</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}