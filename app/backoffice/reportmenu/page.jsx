"use client";
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useReactToPrint } from "react-to-print";

export default function FoodSummaryReport() {
  const [reportData, setReportData] = useState([]);
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState(false);
  const printRef = useRef();

  useEffect(() => {
    if (date) {
      fetchReportData();
    } else {
      setReportData([]); // เคลียร์ตารางเมื่อไม่มีวันที่
    }
  }, [date]);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/purchase?date=${date}`);
      const data = response.data;

      const summary = {};
      data.forEach((item) => {
        const key = item.product_name;
        if (!summary[key]) {
          summary[key] = {
            product_name: key,
            product_quantity: 0,
            total_amount: 0,
          };
        }
        summary[key].product_quantity += item.purchase_quantity;
        summary[key].total_amount +=
          item.purchase_quantity * item.product_price;
      });

      setReportData(Object.values(summary));
    } catch (error) {
      console.error("เกิดข้อผิดพลาดในการดึงข้อมูล", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: `รายงานสรุปรายการอาหาร-${date}`,
  });

  return (
    <div className="p-6 max-h-screen overflow-auto bg-gray-50 min-h-screen">
      <h1 className="text-4xl font-bold mb-6 text-orange-700">
        รายงานสรุปรายการอาหาร
      </h1>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:gap-4">
        <div className="text-2xl relative flex-grow bg-gray-100 p-4 rounded-lg shadow-md mb-4 sm:mb-0">
          <label className="text-2xl mr-2 font-medium cursor-pointer">
            เลือกวันที่:
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="border rounded px-2 py-1 cursor-pointer"
          />
          {date && (
            <button
              onClick={() => setDate("")}
              className="text-sm text-blue-600 underline mt-1 md:mt-2 gap-3 ml-2"
            >
              ล้างวันที่
            </button>
          )}
        </div>

        {reportData.length > 0 && (
          <button
            onClick={handlePrint}
            className="text-2xl font-bold bg-blue-500 text-white p-4 rounded hover:bg-blue-700 cursor-pointer"
          >
            พิมพ์รายงาน PDF
          </button>
        )}
      </div>
      
      <div ref={printRef} className="bg-white p-4">
        <h2 className="text-xl font-semibold mb-2">
          รายงานประจำวันที่: {date || "—"}
        </h2>

        {loading ? (
          <div className="flex flex-row gap-2 justify-center items-center mt-100">
            <div className="w-4 h-4 rounded-full bg-blue-700 animate-bounce"></div>
            <div className="w-4 h-4 rounded-full bg-blue-700 animate-bounce [animation-delay:-.3s]"></div>
            <div className="w-4 h-4 rounded-full bg-blue-700 animate-bounce [animation-delay:-.5s]"></div>
          </div>
        ) : (
          <table className="min-w-full table-auto border-collapse">
            <thead className="bg-orange-100 text-orange-700 sticky top-0 z-10">
              <tr className="bg-gray-100 text-left">
                <th className="px-4 py-3 border border-gray-300 text-3xl text-center">
                  ชื่ออาหาร
                </th>
                <th className="px-4 py-3 border border-gray-300 text-3xl text-center">
                  จำนวนที่ขาย
                </th>
                <th className="px-4 py-3 border border-gray-300 text-3xl text-center">
                  ยอดรวม (บาท)
                </th>
              </tr>
            </thead>
            <tbody>
              {reportData.length > 0 ? (
                reportData.map((item, index) => (
                  <tr key={index} className="border-b">
                    <td className="text-2xl px-4 py-3 border border-gray-300 text-left">
                      {item.product_name}
                    </td>
                    <td className="text-2xl px-4 py-3 border border-gray-300 text-center">
                      {item.product_quantity}
                    </td>
                    <td className="text-2xl px-4 py-3 border border-gray-300 text-center">
                      {item.total_amount.toFixed(2)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="text-center p-6 text-gray-500" colSpan="3">
                    ไม่มีข้อมูล
                  </td>
                </tr>
              )}
            </tbody>
            {reportData.length > 0 && (
              <tfoot>
                <tr>
                  <td
                    colSpan="2"
                    className="text-right text-2xl font-semibold px-4 py-3 border border-gray-300"
                  >
                    ยอดรวมทั้งหมด:
                  </td>
                  <td className="text-2xl font-semibold px-4 py-3 border border-gray-300 text-center">
                    {reportData
                      .reduce((total, item) => total + item.total_amount, 0)
                      .toFixed(2)}{" "}
                    บาท
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        )}
      </div>
    </div>
  );
}
