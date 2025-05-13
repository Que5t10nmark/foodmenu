// app/api/seat/[id]/route.js
import pool from "@/lib/db";
import { NextResponse } from "next/server";

// ดึง id จาก params
export async function GET(request, { params }) {
  const { id } = params;

  try {
    const [seat] = await pool.query("SELECT * FROM seat WHERE seat_id = ?", [id]);

    if (seat.length === 0) {
      return NextResponse.json({ message: "Seat not found" }, { status: 404 });
    }

    return NextResponse.json(seat[0], { status: 200 });
  } catch (error) {
    console.error("Error fetching seat:", error);
    return NextResponse.json(
      { message: "Error fetching seat", error: error.message },
      { status: 500 }
    );
  }
}

// อัปเดตที่นั่ง
export async function PUT(request, { params }) {
  const { id } = params;
  const body = await request.json();
  const { seat_qrcode, seat_status, seat_zone } = body;

  try {
    if (!seat_qrcode || !seat_status || !seat_zone) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    const [result] = await pool.query(
      "UPDATE seat SET seat_qrcode = ?, seat_status = ?, seat_zone = ? WHERE seat_id = ?",
      [seat_qrcode.trim(), seat_status.trim(), seat_zone.trim(), id]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json({ message: "Seat not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Seat updated successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error updating seat:", error);
    return NextResponse.json(
      { message: "Error updating seat", error: error.message },
      { status: 500 }
    );
  }
}

// ลบที่นั่ง
export async function DELETE(request, { params }) {
  const { id } = params;

  try {
    const [result] = await pool.query("DELETE FROM seat WHERE seat_id = ?", [id]);

    if (result.affectedRows === 0) {
      return NextResponse.json({ message: "Seat not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Seat deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting seat:", error);
    return NextResponse.json(
      { message: "Error deleting seat", error: error.message },
      { status: 500 }
    );
  }
}
