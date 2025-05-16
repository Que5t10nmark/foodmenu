"use client";

import { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend,} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function ProductReportPage() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    async function fetchProducts() {
      const res = await fetch("/api/product");
      const data = await res.json();
      setProducts(data);
    }
    fetchProducts();
  }, []);

  // กลุ่มตามประเภท
  const productTypeCounts = products.reduce((acc, product) => {
    const typeName = product.product_type_name || "ไม่ระบุประเภท";
    acc[typeName] = (acc[typeName] || 0) + 1;
    return acc;
  }, {});

  const labels = Object.keys(productTypeCounts);
  const counts = Object.values(productTypeCounts);

  // สุ่มสีให้แต่ละแท่ง
  const getColors = (count) => {
    const palette = [
      "#f97316", "#10b981", "#3b82f6", "#ec4899", "#facc15", "#8b5cf6",
      "#ef4444", "#14b8a6", "#e11d48", "#22d3ee", "#6366f1"
    ];
    return Array.from({ length: count }, (_, i) => palette[i % palette.length]);
  };

  const data = {
    labels,
    datasets: [
      {
        label: "จำนวนเมนู",
        data: counts,
        backgroundColor: getColors(counts.length),
        borderRadius: 6,
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
        text: "กราฟแสดงจำนวนสินค้าแต่ละประเภท",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { precision: 0 },
      },
    },
  };

  // กำหนดความสูงของกราฟ
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">รายงานจำนวนสินค้าต่อประเภทอาหาร</h1>

      <div className="bg-white p-6 rounded shadow-md mb-8 h-[400px]">
        <Bar data={data} options={options} />
      </div>

      <div className="bg-white p-6 rounded shadow-md">
        <h2 className="text-xl font-semibold mb-4">สรุปจำนวนสินค้าแต่ละประเภท</h2>
        <table className="w-full table-auto border-collapse">
          <thead>
            <tr className="bg-orange-500 text-white">
              <th className="px-4 py-2 border">ประเภทสินค้า</th>
              <th className="px-4 py-2 border">จำนวนเมนู</th>
            </tr>
          </thead>
          <tbody>
            {labels.map((type, index) => (
              <tr key={index} className="text-center">
                <td className="px-4 py-2 border">{type}</td>
                <td className="px-4 py-2 border">{counts[index]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

