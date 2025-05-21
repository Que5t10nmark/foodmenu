import pool from "../../../lib/db";
import { NextResponse } from "next/server";
// ========================= GET ALL OPTIONS =========================
export async function GET(request) {
  try {
    const [options] = await pool.query("SELECT * FROM product_option");
    return NextResponse.json(options, { status: 200 });
  } catch (error) {
    console.error("Error fetching product options:", error);
    return NextResponse.json(
      { message: "Error fetching product options", error: error.message },
      { status: 500 }
    );
  }
}

// ========================= CREATE OPTION =========================
export async function POST(request) {
  try {
    const body = await request.json();
    const { product_type_id, option_type, option_value, option_price } = body;

    if (
      !product_type_id ||
      !option_type?.trim() ||
      !option_value?.trim() ||
      option_price === undefined
    ) {
      return NextResponse.json(
        { message: "ข้อมูลไม่ครบถ้วน" },
        { status: 400 }
      );
    }

    const [result] = await pool.query(
      `INSERT INTO product_option (product_type_id, option_type, option_value, option_price) VALUES (?, ?, ?, ?)`,
      [product_type_id, option_type.trim(), option_value.trim(), option_price]
    );

    return NextResponse.json(
      {
        message: "เพิ่มตัวเลือกสินค้าเรียบร้อยแล้ว",
        option_id: result.insertId,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error adding product option:", error);
    return NextResponse.json(
      { message: "เกิดข้อผิดพลาดในการเพิ่มตัวเลือกสินค้า", error: error.message },
      { status: 500 }
    );
  }
}
