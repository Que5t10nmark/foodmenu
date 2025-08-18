"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

export default function ProductSalesPage() {
  const { data: session, status } = useSession();
  const [reportData, setReportData] = useState({ topSellers: [], lowSellers: [], totalProducts: 0 });
  const [date, setDate] = useState("");
  const [limit, setLimit] = useState(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch report data
  useEffect(() => {
    if (status === "authenticated" && session?.user?.role === "เจ้าของร้าน" && date) {
      fetchReportData();
    } else {
      setReportData({ topSellers: [], lowSellers: [], totalProducts: 0 });
      setError(null);
    }
  }, [date, limit, status, session]);

  const fetchReportData = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (date) params.append("date", date);
      params.append("limit", limit);

      const response = await fetch(`/api/product_sales?${params.toString()}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error("ไม่สามารถดึงข้อมูลยอดขายสินค้าได้");
      }

      const data = await response.json();
      console.log("ข้อมูลจาก /api/product_sales:", JSON.stringify(data, null, 2));

      if (data.topSellers.length === 0 && data.lowSellers.length === 0) {
        setError("ไม่มีข้อมูลยอดขายสินค้าสำหรับวันที่เลือก");
      }

      setReportData(data);
    } catch (error) {
      console.error("เกิดข้อผิดพลาดในการดึงข้อมูล:", error);
      setError("เกิดข้อผิดพลาดในการดึงข้อมูล: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-red-50">
        <div className="text-2xl text-gray-600">กำลังโหลด...</div>
      </div>
    );
  }

  if (status === "unauthenticated" || session?.user?.role !== "เจ้าของร้าน") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-red-50">
        <div className="text-2xl text-red-500">คุณไม่มีสิทธิ์เข้าถึงหน้านี้</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-orange-700 mb-8 text-center">
          รายงานยอดขายสินค้าขายดีและไม่ดี
        </h1>

        <div className="flex flex-col sm:flex-row sm:items-center sm:gap-6 mb-8 bg-white p-6 rounded-lg shadow-md">
          <div className="flex-1">
            <label className="text-xl font-medium text-gray-700 mr-2">เลือกวันที่:</label>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              {date && (
                <button
                  onClick={() => setDate("")}
                  className="text-sm text-blue-600 hover:underline"
                >
                  ล้างวันที่
                </button>
              )}
            </div>
          </div>
          <div className="flex-1 mt-4 sm:mt-0">
            <label className="text-xl font-medium text-gray-700 mr-2">จำนวนสินค้า:</label>
            <select
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
              className="border border-gray-300 rounded-lg px-3 py-2 text-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value={5}>Top 5</option>
              <option value={10}>Top 10</option>
              <option value={20}>Top 20</option>
            </select>
          </div>
        </div>

        {error && (
          <div className="text-center p-6 text-red-500 text-xl bg-white rounded-lg shadow-md mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center">
            <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* สินค้าขายดี */}
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">สินค้าขายดี (Top {limit})</h2>
              {reportData.topSellers.length > 0 ? (
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                  <table className="min-w-full table-auto">
                    <thead className="bg-orange-100 text-orange-700">
                      <tr>
                        <th className="px-6 py-4 text-lg text-left">ชื่อสินค้า</th>
                        <th className="px-6 py-4 text-lg text-center">จำนวนที่ขายได้</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.topSellers.map((item, idx) => (
                        <tr key={item.product_id} className="border-b hover:bg-orange-50">
                          <td className="text-lg px-6 py-4 text-left">{item.product_name}</td>
                          <td className="text-lg px-6 py-4 text-center">{item.total_sold} ชิ้น</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center p-6 text-gray-500 text-lg bg-white rounded-lg shadow-md">
                  ไม่มีข้อมูลสินค้าขายดีสำหรับวันที่เลือก
                </div>
              )}
            </div>

            {/* สินค้าขายไม่ดี */}
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">สินค้าขายไม่ดี (Bottom {limit})</h2>
              {reportData.lowSellers.length > 0 ? (
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                  <table className="min-w-full table-auto">
                    <thead className="bg-orange-100 text-orange-700">
                      <tr>
                        <th className="px-6 py-4 text-lg text-left">ชื่อสินค้า</th>
                        <th className="px-6 py-4 text-lg text-center">จำนวนที่ขายได้</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.lowSellers.map((item, idx) => (
                        <tr key={item.product_id} className="border-b hover:bg-orange-50">
                          <td className="text-lg px-6 py-4 text-left">{item.product_name}</td>
                          <td className="text-lg px-6 py-4 text-center">{item.total_sold} ชิ้น</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center p-6 text-gray-500 text-lg bg-white rounded-lg shadow-md">
                  ไม่มีข้อมูลสินค้าขายไม่ดีสำหรับวันที่เลือก
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}