"use client";
import { useEffect, useState, useRef } from "react";

export default function FoodSummaryReport() {
  const [reportData, setReportData] = useState([]);
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [printMode, setPrintMode] = useState(false);
  const printRef = useRef(null);

  useEffect(() => {
    if (date) {
      fetchReportData();
    } else {
      setReportData([]);
    }
  }, [date]);

  // Debug printRef.current
  useEffect(() => {
    if (printRef.current) {
      console.log("printRef.current is set:", printRef.current);
    } else {
      console.log("printRef.current is null");
    }
  }, [reportData, loading, printMode]);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/sale_report?date=${date}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.statusText}`);
      }
      const data = await response.json();

      const summary = {};
      data.forEach((item) => {
        const key = item.product_name;
        if (!summary[key]) {
          summary[key] = {
            product_name: key,
            product_quantity: 0,
          };
        }
        summary[key].product_quantity += Number(item.purchase_quantity) || 0;
      });

      setReportData(Object.values(summary));
    } catch (error) {
      console.error("เกิดข้อผิดพลาดในการดึงข้อมูล", error);
    } finally {
      setLoading(false);
    }
  };

  const onClickPrint = () => {
    if (loading) {
      alert("กรุณารอข้อมูลโหลดให้เสร็จก่อนพิมพ์");
      return;
    }
    if (!reportData.length) {
      alert("ไม่มีข้อมูลสำหรับพิมพ์");
      return;
    }
    if (!printRef.current) {
      alert("ไม่สามารถพิมพ์ได้ เนื่องจากหน้าเอกสารยังไม่พร้อม");
      console.error("printRef.current is null in onClickPrint");
      return;
    }
    setPrintMode(true);
    setTimeout(() => {
      window.print();
      setPrintMode(false);
    }, 100);
  };

  return (
    <>
      <style>{
  `@page {
  size: A4 portrait;
  margin: 0; /* เอาขอบออก เพื่อให้กินเต็มกระดาษ */
}

@media print {
  body {
    font-family: 'Kanit', sans-serif;
    margin: 0;
    padding: 0;
  }

  body * {
    visibility: hidden;
  }

  #print-area, #print-area * {
    visibility: visible;
  }

  #print-area {
    position: absolute;
    top: 0;
    left: 0;
    width: 210mm;   /* ความกว้าง A4 เต็ม */
    height: 297mm;  /* ความสูง A4 เต็ม */
    margin: 0;
    padding: 15mm;  /* ระยะห่างขอบด้านใน */
    box-sizing: border-box;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 10mm;
  }

  th, td {
    border: 1px solid #d1d5db;
    padding: 8px;
    text-align: center;
  }

  th {
    background-color: #fed7aa;
    color: #000000;
    font-size: 16pt;
  }

  td {
    font-size: 14pt;
  }

  .header {
    text-align: center;
    margin-bottom: 10mm;
  }

  .header h1 {
    font-size: 24pt;
    font-weight: bold;
    color: #000000;
  }

  .header p {
    font-size: 12pt;
    color: #4b5563;
  }

  .footer {
    text-align: center;
    font-size: 10pt;
    color: #4b5563;
    margin-top: 10mm;
  }
}

      `}</style>
      <div className="p-6 bg-gradient-to-br from-orange-50 to-red-50">
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
              onClick={onClickPrint}
              className="text-2xl font-bold bg-blue-500 text-white p-4 rounded hover:bg-blue-700 cursor-pointer"
              disabled={loading}
            >
              พิมพ์รายงาน PDF
            </button>
          )}
        </div>

        <div
          id="print-area"
          ref={printRef}
          className="bg-white p-4 rounded-lg shadow-md"
        >
          <div className="header">
            <h1>สเต็กนี่หว่า</h1>
            <p>รายงานสรุปรายการอาหาร</p>
            <p>ประจำวันที่: {date || "—"}</p>
            <p>
              วันที่พิมพ์:{" "}
              {new Date().toLocaleDateString("th-TH", {
                timeZone: "Asia/Bangkok",
              })}
            </p>
          </div>

          {loading ? (
            <div className="flex flex-row gap-2 justify-center items-center mt-10">
              <div className="w-4 h-4 rounded-full bg-blue-700 animate-bounce"></div>
              <div className="w-4 h-4 rounded-full bg-blue-700 animate-bounce [animation-delay:-.1s]"></div>
              <div className="w-4 h-4 rounded-full bg-blue-700 animate-bounce [animation-delay:-.3s]"></div>
            </div>
          ) : (
            <table className="min-w-full table-auto border-collapse ">
              <thead className="bg-orange-100 text-orange-700 sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-3 border border-gray-300 text-3xl text-center">
                    ชื่ออาหาร
                  </th>
                  <th className="px-4 py-3 border border-gray-300 text-3xl text-center">
                    จำนวนที่ขาย
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
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      className="text-center p-6 text-gray-500 text-2xl"
                      colSpan="2"
                    >
                      ไม่มีข้อมูล
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}
