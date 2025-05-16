"use client";

import { useEffect, useRef, useState } from "react";
import Chart from "chart.js/auto";
import ChartDataLabels from "chartjs-plugin-datalabels";

Chart.register(ChartDataLabels); // ✅ ลงทะเบียน plugin

export default function ReportSummaryPage() {
  const chartRef = useRef(null);
  const [products, setProducts] = useState([]);
  const [chartInstance, setChartInstance] = useState(null);

  useEffect(() => {
    async function fetchData() {
      const res = await fetch("/api/purchase");
      const data = await res.json();
      setProducts(data);
    }
    fetchData();
  }, []);

  useEffect(() => {
    if (!products.length || !chartRef.current) return;

    const productSales = {};
    products.forEach((p) => {
      const name = p.product_name || "ไม่ระบุ";
      productSales[name] = (productSales[name] || 0) + p.purchase_quantity;
    });

    const labels = Object.keys(productSales);
    const data = Object.values(productSales);

    const chartData = {
      labels,
      datasets: [
        {
          label: "ยอดขาย (หน่วย)",
          data,
          backgroundColor: labels.map(
            (_, i) => `hsl(${(i * 360) / labels.length}, 70%, 60%)`
          ),
        },
      ],
    };

    if (chartInstance) {
      chartInstance.destroy();
    }

    const newChart = new Chart(chartRef.current, {
      type: "doughnut",
      data: chartData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "right",
            labels: {
              boxWidth: 20,
            },
          },
          tooltip: {
            callbacks: {
              label: (context) =>
                `${context.label}: ${context.raw} หน่วย`,
            },
          },
          datalabels: {
            color: "#333",
            font: {
              weight: "bold",
              size: 14,
            },
            formatter: (value) => `${value} ชิ้น`,
          },
        },
      },
      plugins: [ChartDataLabels],
    });

    setChartInstance(newChart);
  }, [products]);

  const rankedProducts = Object.entries(
    products.reduce((acc, p) => {
      acc[p.product_name] = (acc[p.product_name] || 0) + p.purchase_quantity;
      return acc;
    }, {})
  )
    .map(([name, qty]) => ({ name, qty }))
    .sort((a, b) => b.qty - a.qty);

  return (
    <div className="p-6 max-w-7xl mx-auto min-h-screen">
      <h1 className="text-2xl font-bold mb-6">📊 รายงานยอดขายสินค้า</h1>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="w-full lg:w-1/2 bg-white rounded shadow p-4 h-[400px]">
          <div className="relative w-full h-full">
            <canvas ref={chartRef} className="w-full h-full" />
          </div>
        </div>

        <div className="w-full lg:w-1/2 bg-white rounded shadow p-4 overflow-x-auto">
          <h2 className="text-lg font-semibold mb-3">📈 อันดับยอดขาย</h2>
          <table className="w-full table-auto border-collapse text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-3 py-2 border">#</th>
                <th className="px-3 py-2 border">ชื่อเมนู</th>
                <th className="px-3 py-2 border">จำนวนที่ขาย</th>
              </tr>
            </thead>
            <tbody>
              {rankedProducts.map((item, i) => (
                <tr key={i} className="text-center">
                  <td className="px-3 py-2 border">{i + 1}</td>
                  <td className="px-3 py-2 border">{item.name}</td>
                  <td className="px-3 py-2 border">{item.qty}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
