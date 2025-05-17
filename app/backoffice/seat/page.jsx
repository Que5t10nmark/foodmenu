"use client";
import { useEffect, useState, useCallback } from "react";
import Modal from "../components/Modal";
import QRCode from "react-qr-code";

const SeatPage = () => {
  const [seats, setSeats] = useState([]);
  const [newSeat, setNewSeat] = useState({
    seat_qrcode: "",
    seat_status: "",
    seat_zone: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [notification, setNotification] = useState("");

  const fetchSeats = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/seat");
      if (!res.ok) throw new Error("Failed to fetch seats");
      const data = await res.json();
      setSeats(data);
    } catch (err) {
      setError("Error fetching seats: " + err.message);
    } finally {
      setLoading(false);
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
          seat_id: newSeat.id,
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

      const updatedSeat = await res.json();

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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isEditing) {
      updateSeat(newSeat.seat_id, newSeat);
    } else {
      addSeat(newSeat);
    }
    closeModal();
  };

  const clearForm = () => {
    setNewSeat({ seat_qrcode: "", seat_status: "", seat_zone: "" });
  };

  const downloadQRCode = () => {
    const svg = document.getElementById("qr-code-seat");
    if (!svg) return;
    const serializer = new XMLSerializer();
    const svgBlob = new Blob([serializer.serializeToString(svg)], {
      type: "image/svg+xml",
    });
    const url = URL.createObjectURL(svgBlob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `seat-${newSeat.seat_qrcode}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    fetchSeats();
  }, [fetchSeats]);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">ที่นั่ง</h1>

      {error && <p className="text-red-500 mb-4">{error}</p>}
      {notification && (
        <div className="mb-4 p-3 bg-green-200 text-green-800 rounded">
          {notification}
        </div>
      )}

      <button
        onClick={() => openModal()}
        className="bg-green-500 text-white p-2 rounded mb-6"
      >
        เพิ่มที่นั่ง
      </button>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">รายการที่นั่ง</h2>
        <table className="min-w-full table-auto border-collapse border border-gray-300">
          <thead>
            <tr>
              <th className="px-4 py-2 border">QR Code</th>
              <th className="px-4 py-2 border">สถานะที่นั่ง</th>
              <th className="px-4 py-2 border">โซนที่นั่ง</th>
              <th className="px-4 py-2 border">การจัดการ</th>
            </tr>
          </thead>
          <tbody>
            {seats.map((seat, index) => (
              <tr key={seat.seat_id || index}>
                <td className="px-4 py-2 border">
                  <div className="flex justify-center">
                    <QRCode
                      value={
                        typeof window !== "undefined"
                          ? `${window.location.origin}/order/product/${seat.seat_qrcode}`
                          : ""
                      }
                      size={64}
                    />
                  </div>
                </td>
                <td className="px-4 py-2 border">{seat.seat_status}</td>
                <td className="px-4 py-2 border">{seat.seat_zone}</td>
                <td className="px-4 py-2 border">
                  <button
                    onClick={() => openModal(seat)}
                    className="bg-yellow-500 text-white px-4 py-2 rounded mr-2"
                  >
                    แก้ไข
                  </button>
                  <button
                    onClick={() => deleteSeat(seat.seat_id)}
                    className="bg-red-500 text-white px-4 py-2 rounded"
                  >
                    ลบ
                  </button>
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
                value={
                  typeof window !== "undefined"
                    ? `${window.location.origin}/order/product/${newSeat.seat_qrcode}`
                    : ""
                }
                size={128}
              />

              <button
                type="button"
                onClick={downloadQRCode}
                className="mt-2 bg-blue-500 text-white p-2 rounded"
              >
                ดาวน์โหลด QR Code
              </button>
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
    </div>
  );
};

export default SeatPage;
