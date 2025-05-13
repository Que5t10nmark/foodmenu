// app/api/seat/route.js
import pool from "@/lib/db";
import { NextResponse } from "next/server";

// ========================= GET ALL =========================
export async function GET(request) {
  try {
    const [seats] = await pool.query("SELECT * FROM seat");

    return NextResponse.json(seats, { status: 200 });
  } catch (error) {
    console.error("Error fetching seats:", error);
    return NextResponse.json(
      { message: "Error fetching seats", error: error.message },
      { status: 500 }
    );
  }
}

// ========================= CREATE =========================
export async function POST(request) {
  try {
    const body = await request.json();
    const { seat_qrcode, seat_status, seat_zone } = body;

    if (!seat_qrcode || !seat_status || !seat_zone) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    const [result] = await pool.query(
      "INSERT INTO seat (seat_qrcode, seat_status, seat_zone) VALUES (?, ?, ?)",
      [seat_qrcode.trim(), seat_status.trim(), seat_zone.trim()]
    );

    return NextResponse.json(
      {
        message: "Seat added successfully",
        seat_id: result.insertId,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error adding seat:", error);
    return NextResponse.json(
      { message: "Error adding seat", error: error.message },
      { status: 500 }
    );
  }
}
