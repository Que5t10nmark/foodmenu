"use client";
import { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import Chart from "chart.js/auto";

export default function ReportByDatePage() {
  const [selectedDate, setSelectedDate] = useState("");
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    if (!selectedDate) return;
    const params = new URLSearchParams();
    params.append("status", "เสร็จแล้ว");
    params.append("date", selectedDate);

    fetch(`/api/purchase?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => setOrders(data))
      .catch((err) => console.error("โหลดข้อมูลไม่สำเร็จ", err));
  }, [selectedDate]);

  const productCounts = orders.reduce((acc, order) => {
    const name = order.product_name || "ไม่ระบุ";
    acc[name] = (acc[name] || 0) + order.purchase_quantity;
    return acc;
  }, {});

  const productLabels = Object.keys(productCounts);
  const productData = Object.values(productCounts);

  // ✅ สร้างสีให้แต่ละแท่ง (แบบ HSL ไม่ซ้ำกัน)
  const colors = productLabels.map((_, i) =>
    `hsl(${(i * 360) / productLabels.length}, 70%, 55%)`
  );

  const chartData = {
    labels: productLabels,
    datasets: [
      {
        label: "จำนวนที่ขาย",
        data: productData,
        backgroundColor: colors,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: "จำนวนสินค้าที่ขายต่อเมนู",
        font: { size: 18 },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { precision: 0 },
      },
      x: {
        ticks: {
          autoSkip: false,
          maxRotation: 45,
          minRotation: 30,
        },
      },
    },
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">📊 รายงานการขายตามวัน</h1>

      <div className="mb-6 flex items-center gap-4">
        <label htmlFor="date" className="font-semibold">
          เลือกวันที่:
        </label>
        <input
          type="date"
          id="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="border rounded px-3 py-1"
        />
        {selectedDate && (
          <button
            onClick={() => setSelectedDate("")}
            className="text-sm text-blue-600 underline"
          >
            ล้างวันที่
          </button>
        )}
      </div>

      {orders.length > 0 ? (
        <div className="bg-white p-4 rounded shadow h-[400px]">
          <Bar data={chartData} options={options} />
        </div>
      ) : selectedDate ? (
        <div className="text-gray-500">ไม่มีข้อมูลการขายในวันที่เลือก</div>
      ) : (
        <div className="text-gray-400">กรุณาเลือกวันที่</div>
      )}
    </div>
  );
}
