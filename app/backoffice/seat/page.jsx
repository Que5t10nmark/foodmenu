"use client";
import { useEffect, useState, useCallback } from "react";
import Modal from "../components/Modal";
import QRCode from "react-qr-code";
import { Trash2, Edit2, PlusCircle } from "lucide-react";

const SeatPage = () => {
  const [seats, setSeats] = useState([]);
  const [newSeat, setNewSeat] = useState({
    seat_qrcode: "",
    seat_status: "",
    seat_zone: "",
  });
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [notification, setNotification] = useState("");
  const [printSeat, setPrintSeat] = useState(null); // เพิ่ม state สำหรับเก็บข้อมูลที่นั่งที่ต้องการพิมพ์

  const fetchSeats = useCallback(async () => {
    setError("");
    try {
      const res = await fetch("/api/seat");
      if (!res.ok) throw new Error("Failed to fetch seats");
      const data = await res.json();
      setSeats(data);
    } catch (err) {
      setError("Error fetching seats: " + err.message);
    }
  }, []);

  const addSeat = async (seatData) => {
    try {
      const res = await fetch("/api/seat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(seatData),
      });
      if (!res.ok) throw new Error("Failed to add seat");
      const newSeat = await res.json();
      setSeats((prevSeats) => [
        ...prevSeats,
        {
          seat_id: newSeat.seat_id || newSeat.id,
          seat_qrcode: seatData.seat_qrcode,
          seat_status: seatData.seat_status,
          seat_zone: seatData.seat_zone,
        },
      ]);
      setNotification("เพิ่มที่นั่งสำเร็จ!");
      setTimeout(() => setNotification(""), 3000);
    } catch (err) {
      setError("Error adding seat: " + err.message);
    }
  };

  const updateSeat = async (seatId, seatData) => {
    try {
      const res = await fetch(`/api/seat/${seatId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(seatData),
      });
      if (!res.ok) throw new Error("Failed to update seat");
      setSeats((prevSeats) =>
        prevSeats.map((seat) =>
          seat.seat_id === seatId ? { ...seat, ...seatData } : seat
        )
      );
      setNotification("แก้ไขที่นั่งสำเร็จ!");
      setTimeout(() => setNotification(""), 3000);
    } catch (err) {
      setError("Error updating seat: " + err.message);
    }
  };

  const deleteSeat = async (seatId) => {
    try {
      const res = await fetch(`/api/seat/${seatId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete seat");
      setSeats((prevSeats) =>
        prevSeats.filter((seat) => seat.seat_id !== seatId)
      );
      setNotification("ลบที่นั่งสำเร็จ!");
      setTimeout(() => setNotification(""), 3000);
    } catch (err) {
      setError("Error deleting seat: " + err.message);
    }
  };

  const openModal = (seat = null) => {
    if (seat) {
      setNewSeat({
        seat_id: seat.seat_id,
        seat_qrcode: seat.seat_qrcode,
        seat_status: seat.seat_status,
        seat_zone: seat.seat_zone,
      });
      setIsEditing(true);
    } else {
      setNewSeat({ seat_qrcode: "", seat_status: "", seat_zone: "" });
      setIsEditing(false);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setNewSeat({ seat_qrcode: "", seat_status: "", seat_zone: "" });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewSeat((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await updateSeat(newSeat.seat_id, newSeat);
      } else {
        await addSeat(newSeat);
      }
      closeModal();
    } catch (err) {
      // error จัดการในฟังก์ชัน add/update อยู่แล้ว
    }
  };

  const clearForm = () => {
    setNewSeat({ seat_qrcode: "", seat_status: "", seat_zone: "" });
  };

  const handlePrint = (seat) => {
    setPrintSeat(seat); // เก็บข้อมูลที่นั่งที่ต้องการพิมพ์
    setTimeout(() => {
      window.print(); // เรียกพิมพ์
    }, 500);
  };

  useEffect(() => {
    fetchSeats();
  }, [fetchSeats]);

  return (
    // <div className="p-6 max-h-screen overflow-auto bg-gray-50 min-h-screen justify-center">
    <>
      {/* CSS สำหรับการพิมพ์ */}
      <style>{`
@page {
  size: 10cm 10cm;
  margin: 0;
}

@media print {
  body * {
    visibility: hidden;
  }

  #print-area, #print-area * {
    visibility: visible;
  }

  #print-area {
    position: absolute;
    left: 0;
    top: 0;
    width: 10cm;
    height: 10cm;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    page-break-after: auto; /* auto ดีกว่า avoid */
    box-sizing: border-box;
  }

  /* ลดขนาด QR Code ให้พอดีกับ 10cm */
  #print-area svg {
    width: 8cm !important;
    height: 8cm !important;
  }
}


      `}</style>

      {/* พื้นที่สำหรับพิมพ์ QR Code */}
      {printSeat && (
        <div
          id="print-area"
          className="fixed inset-0 flex flex-col items-center justify-center w-[7cm] h-[7cm] border border-gray-700 rounded-md p-4 box-border bg-white select-none"
          style={{ visibility: "hidden" }} // ซ่อนในหน้าเว็บปกติ
        >
          <h1 className="text-xl font-bold mb-2 text-center">สเต็กนี่หว่า</h1>
          <h1 className="text-lg font-bold mb-2 text-center">โต๊ะ {printSeat.seat_qrcode}</h1>
          <p className="text-center text-sm text-gray-600 mb-4">สั่งอาหารผ่าน QR Code นี้</p>
          <QRCode
            value={`${window.location.origin}/order/product/${printSeat.seat_qrcode}`}
            size={400}
          />
          {/* <p className="mt-2 text-xs text-center break-all text-gray-700">
            {`${window.location.origin}/order/product/${printSeat.seat_qrcode}`}
          </p> */}
        </div>
      )}

      <h1 className="text-4xl font-bold mb-6 text-orange-700">ที่นั่ง</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {notification && (
        <div className="mb-4 p-3 bg-green-100 text-green-800 rounded shadow-sm">
          {notification}
        </div>
      )}

      <button
        onClick={() => openModal()}
        className="text-3xl mt-3 sm:mt-0 inline-flex items-center gap-2 cursor-pointer bg-green-500 hover:bg-green-700 text-white px-5 py-2 rounded shadow transition"
      >
        <PlusCircle size={20} />
        เพิ่มที่นั่ง
      </button>

      <div className="overflow-x-auto max-h-[70vh] shadow rounded border border-gray-200 bg-white mb-2">
        <h2 className="text-2xl font-bold mb-4 px-4 pt-4 text-orange-700">
          รายการที่นั่ง
        </h2>
        <table className="min-w-full table-auto border-collapse">
          <thead className="bg-orange-100 text-orange-700 sticky top-0 z-10">
            <tr>
              <th className="px-4 py-3 border-b border border-gray-300 text-3xl text-center">
                QR Code
              </th>
              <th className="px-4 py-3 border-b border border-gray-300 text-3xl text-center">
                สถานะที่นั่ง
              </th>
              <th className="px-4 py-3 border-b border border-gray-300 text-3xl text-center">
                โซนที่นั่ง
              </th>
              <th className="px-4 py-3 border-b border border-gray-300 text-3xl text-center">
                การจัดการ
              </th>
            </tr>
          </thead>
          <tbody>
            {seats.map((seat) => (
              <tr key={seat.seat_id}>
                <td className="text-2xl px-4 py-3 border-b border border-gray-300">
                  <div className="flex flex-col items-center">
                    <QRCode
                      value={`${window.location.origin}/order/product/${seat.seat_qrcode}`}
                      size={64}
                    />
                    <a
                      href={`/order/product/${seat.seat_qrcode}`}
                      className="text-sm text-blue-600 underline mt-2 break-all"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {`${window.location.origin}/order/product/${seat.seat_qrcode}`}
                    </a>
                  </div>
                </td>
                <td className="text-3xl px-4 py-3 border-b border border-gray-300 text-center">
                  {seat.seat_status}
                </td>
                <td className="text-3xl px-4 py-3 border-b border border-gray-300 text-center">
                  {seat.seat_zone}
                </td>
                <td className="text-3xl px-4 py-3 border-b border border-gray-300 text-center">
                  <div className="flex justify-center gap-2">
                    <button
                      onClick={() => openModal(seat)}
                      aria-label="แก้ไข"
                      className="text-2xl p-2 cursor-pointer bg-yellow-400 hover:bg-yellow-500 text-white rounded shadow transition flex items-center gap-1"
                      title="แก้ไข"
                    >
                      <Edit2 size={18} /> แก้ไข
                    </button>
                    <button
                      onClick={() => {
                        if (confirm("คุณแน่ใจว่าต้องการลบรายการนี้?")) {
                          deleteSeat(seat.seat_id);
                        }
                      }}
                      aria-label="ลบ"
                      className="text-2xl p-2 cursor-pointer bg-red-500 hover:bg-red-600 text-white rounded shadow transition flex items-center gap-1"
                      title="ลบ"
                    >
                      <Trash2 size={18} /> ลบ
                    </button>
                    <button
                      onClick={() => handlePrint(seat)} // เรียกฟังก์ชันพิมพ์
                      className="text-2xl p-2 cursor-pointer bg-blue-500 hover:bg-blue-600 text-white rounded shadow transition flex items-center gap-1"
                      title="พิมพ์ QR"
                    >
                      🖨 พิมพ์
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL */}
      <Modal isOpen={isModalOpen} closeModal={closeModal}>
        <h2 className="text-xl font-semibold mb-4">
          {isEditing ? "แก้ไขที่นั่ง" : "เพิ่มที่นั่งใหม่"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="seat_qrcode" className="block">
              QR Code
            </label>
            <input
              type="text"
              id="seat_qrcode"
              name="seat_qrcode"
              value={newSeat.seat_qrcode || ""}
              onChange={handleChange}
              required
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>

          {newSeat.seat_qrcode && (
            <div className="flex flex-col items-center mt-4">
              <QRCode
                id="qr-code-seat"
                value={`${window.location.origin}/order/product/${newSeat.seat_qrcode}`}
                size={128}
              />
            </div>
          )}

          <div>
            <label htmlFor="seat_status" className="block">
              สถานะที่นั่ง
            </label>
            <select
              id="seat_status"
              name="seat_status"
              value={newSeat.seat_status}
              onChange={handleChange}
              required
              className="w-full p-2 border border-gray-300 rounded"
            >
              <option value="">-- เลือกสถานะ --</option>
              <option value="ว่าง">ว่าง</option>
              <option value="ไม่ว่าง">ไม่ว่าง</option>
            </select>
          </div>

          <div>
            <label htmlFor="seat_zone" className="block">
              โซนที่นั่ง
            </label>
            <input
              type="text"
              id="seat_zone"
              name="seat_zone"
              value={newSeat.seat_zone || ""}
              onChange={handleChange}
              required
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>

          <div className="mt-4 flex gap-4">
            <button
              type="submit"
              className="bg-green-500 text-white px-6 py-2 rounded"
            >
              {isEditing ? "บันทึกการแก้ไข" : "บันทึก"}
            </button>
            <button
              type="button"
              onClick={clearForm}
              className="bg-gray-500 text-white px-6 py-2 rounded"
            >
              เคลียร์
            </button>
            <button
              type="button"
              onClick={closeModal}
              className="bg-red-500 text-white px-6 py-2 rounded"
            >
              ยกเลิก
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
};

export default SeatPage;