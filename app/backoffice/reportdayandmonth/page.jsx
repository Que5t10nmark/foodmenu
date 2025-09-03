"use client";
import { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";

export default function SalesReportPage() {
  const { data: session, status } = useSession();
  const [reportData, setReportData] = useState([]);
  const [date, setDate] = useState("");
  const [selectedSeat, setSelectedSeat] = useState("all");
  const [seats, setSeats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [printMode, setPrintMode] = useState(false); // เปลี่ยนจาก printing เป็น printMode
  const printRef = useRef(null);

  // ดึงข้อมูลโต๊ะ
  useEffect(() => {
    const fetchSeats = async () => {
      try {
        const response = await fetch("/api/seat", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.accessToken}`,
          },
        });
        if (!response.ok) throw new Error("ไม่สามารถดึงข้อมูลโต๊ะได้");
        const data = await response.json();
        setSeats(data);
      } catch (error) {
        console.error("เกิดข้อผิดพลาดในการดึงข้อมูลโต๊ะ:", error);
        setError("ไม่สามารถดึงข้อมูลโต๊ะได้");
      }
    };

    if (status === "authenticated" && session?.user?.role === "เจ้าของร้าน") {
      fetchSeats();
    }
  }, [status, session]);

  // ดึงข้อมูลรายงาน
  useEffect(() => {
    if (
      status === "authenticated" &&
      session?.user?.role === "เจ้าของร้าน" &&
      date
    ) {
      fetchReportData();
    } else {
      setReportData([]);
      setError(null);
    }
  }, [date, selectedSeat, status, session]);

  const calculateOptionsPrice = (selectedOption) => {
    if (!selectedOption || typeof selectedOption !== "object") return 0;
    let totalOptionPrice = 0;
    for (const optionType in selectedOption) {
      const optionValues = selectedOption[optionType];
      if (Array.isArray(optionValues)) {
        totalOptionPrice += optionValues.reduce(
          (sum, opt) => sum + (Number(opt.product_option_price) || 0),
          0
        );
      } else if (typeof optionValues === "object" && optionValues !== null) {
        totalOptionPrice += Number(optionValues.product_option_price) || 0;
      }
    }
    return totalOptionPrice;
  };

  const fetchReportData = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (date) params.append("date", date);

      const response = await fetch(`/api/sale_report?${params.toString()}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.accessToken}`,
        },
      });

      if (!response.ok) throw new Error("ไม่สามารถดึงข้อมูลรายงานยอดขายได้");

      const data = await response.json();

      if (data.length === 0) {
        setError("ไม่มีข้อมูลคำสั่งซื้อที่ชำระแล้วสำหรับวันที่เลือก");
      }

      // Group by seat_id
      const summaryBySeat = {};
      data.forEach((item) => {
        const seatId = item.seat_id;
        if (!summaryBySeat[seatId]) {
          summaryBySeat[seatId] = {
            seat_id: seatId,
            seat_qrcode: item.seat_qrcode || `โต๊ะ ${seatId}`,
            orders: [],
            total_price: 0,
          };
        }

        const selectedOption = item.selected_option || null;
        const basePrice = Number(item.product_price) || 0;
        const quantity = Number(item.purchase_quantity) || 0;
        const optionPrice = calculateOptionsPrice(selectedOption);
        const totalPrice = (basePrice + optionPrice) * quantity;

        summaryBySeat[seatId].orders.push({
          purchase_id: item.purchase_id,
          product_name: item.product_name,
          selected_option: selectedOption,
          quantity: quantity,
          product_price: basePrice,
          option_price: optionPrice,
          total_price: totalPrice,
        });

        summaryBySeat[seatId].total_price += totalPrice;
      });

      // Filter by selected seat
      let filteredData = Object.values(summaryBySeat);
      if (selectedSeat !== "all") {
        filteredData = filteredData.filter(
          (seat) => seat.seat_id === Number(selectedSeat)
        );
      }

      setReportData(filteredData);
    } catch (error) {
      console.error("เกิดข้อผิดพลาดในการดึงข้อมูล:", error);
      setError("เกิดข้อผิดพลาดในการดึงข้อมูล: " + error.message);
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

  if (status === "loading") {
    return <div className="p-6 text-center">กำลังโหลด...</div>;
  }

  if (status === "unauthenticated" || session?.user?.role !== "เจ้าของร้าน") {
    return (
      <div className="p-6 text-center text-red-500">
        คุณไม่มีสิทธิ์เข้าถึงหน้านี้
      </div>
    );
  }

  return (
    <>
      <style>{`
        @page {
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
    color: #c2410c;
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
    color: #c2410c;
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

      <div className="p-6 max-h-screen overflow-auto bg-gradient-to-br from-orange-50 to-red-50 min-h-screen">
        <h1 className="text-4xl font-bold mb-6 text-orange-700">
          รายงานยอดขายอาหารตามวันและโต๊ะ
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
          <div className="text-2xl relative flex-grow bg-gray-100 p-4 rounded-lg shadow-md mb-4 sm:mb-0">
            <label className="text-2xl mr-2 font-medium cursor-pointer">
              เลือกโต๊ะ:
            </label>
            <select
              value={selectedSeat}
              onChange={(e) => setSelectedSeat(e.target.value)}
              className="border rounded px-2 py-1 cursor-pointer"
            >
              <option value="all">ทุกโต๊ะ</option>
              {seats.map((seat) => (
                <option key={seat.seat_id} value={seat.seat_id}>
                  {seat.seat_qrcode}
                </option>
              ))}
            </select>
          </div>
          {reportData.length > 0 && (
            <button
              onClick={onClickPrint}
              className="text-2xl font-bold bg-blue-500 text-white p-4 rounded hover:bg-blue-700 cursor-pointer disabled:bg-gray-400"
              disabled={loading || printMode}
            >
              {printMode ? "กำลังพิมพ์..." : "พิมพ์รายงาน PDF"}
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex flex-row gap-2 justify-center items-center mt-10">
            <div className="w-4 h-4 rounded-full bg-blue-700 animate-bounce"></div>
            <div className="w-4 h-4 rounded-full bg-blue-700 animate-bounce [animation-delay:-.3s]"></div>
            <div className="w-4 h-4 rounded-full bg-blue-700 animate-bounce [animation-delay:-.5s]"></div>
          </div>
        ) : error ? (
          <div className="text-center p-6 text-red-500 text-2xl">{error}</div>
        ) : (
          <div
            id="print-area"
            ref={printRef}
            className="bg-white p-0 rounded-lg shadow-md"
          >
            <div className="header">
              <h1>Steak NiWha</h1>
              <p>รายงานยอดขายอาหาร</p>
              <p>ประจำวันที่: {date || "—"}</p>
              <p>
                โต๊ะ:{" "}
                {selectedSeat === "all"
                  ? "ทุกโต๊ะ"
                  : seats.find((seat) => seat.seat_id === Number(selectedSeat))
                      ?.seat_qrcode || "—"}
              </p>
              <p>
                วันที่พิมพ์:{" "}
                {new Date().toLocaleDateString("th-TH", {
                  timeZone: "Asia/Bangkok",
                })}
              </p>
            </div>
            <div className="content-wrapper">
              {reportData.length > 0 ? (
                reportData.map((seat) => (
                  <div key={seat.seat_id} className="seat-section">
                    <h2 className="seat-title">โต๊ะ: {seat.seat_qrcode}</h2>
                    <table className="min-w-full table-auto border-collapse">
                      <thead className="bg-orange-100 text-orange-700 sticky top-0 z-10">
                        <tr>
                          <th className="px-4 py-3 border border-gray-300 text-3xl text-center">ชื่ออาหาร</th>
                          {/* <th>ตัวเลือก</th> */}
                          <th className="px-4 py-3 border border-gray-300 text-3xl text-center">จำนวน</th>
                          <th className="px-4 py-3 border border-gray-300 text-3xl text-center">ราคาสินค้า</th>
                          <th className="px-4 py-3 border border-gray-300 text-3xl text-center">ราคารวมตัวเลือก</th>
                          <th className="px-4 py-3 border border-gray-300 text-3xl text-center">ยอดรวม</th>
                        </tr>
                      </thead>
                      <tbody>
                        {seat.orders.map((item) => (
                          <tr key={item.purchase_id} className="border-b">
                            <td className="text-2xl px-4 py-3 border border-gray-300 text-left" >{item.product_name}</td>
                            {/* <td>
                              {item.selected_option
                                ? Object.entries(item.selected_option)
                                    .map(([type, values]) => {
                                      if (Array.isArray(values)) {
                                        return `${type}: ${values
                                          .map((opt) => opt.product_option_value)
                                          .join(", ")}`;
                                      } else if (values?.product_option_value) {
                                        return `${type}: ${values.product_option_value}`;
                                      }
                                      return null;
                                    })
                                    .filter(Boolean)
                                    .join("; ") || "ไม่มี"
                                : "ไม่มี"}
                            </td> */}
                            <td className="text-2xl px-4 py-3 border border-gray-300 text-center">{item.quantity}</td>
                            <td className="text-2xl px-4 py-3 border border-gray-300 text-center">฿{item.product_price.toFixed(2)}</td>
                            <td className="text-2xl px-4 py-3 border border-gray-300 text-center">฿{item.option_price.toFixed(2)}</td>
                            <td className="text-2xl px-4 py-3 border border-gray-300 text-center">฿{item.total_price.toFixed(2)}</td>
                          </tr>
                        ))}
                        <tr className="total-row">
                          <td colSpan="4" className="text-2xl px-4 py-3 border border-gray-300 text-center">
                            ยอดรวมทั้งหมด ({seat.seat_qrcode})
                          </td>
                          <td className="text-2xl px-4 py-3 border border-gray-300 text-center">฿{seat.total_price.toFixed(2)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                ))
              ) : (
                <div className="text-center p-6 text-gray-500 text-2xl">
                  ไม่มีข้อมูลคำสั่งซื้อสำหรับวันที่หรือโต๊ะที่เลือก
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
