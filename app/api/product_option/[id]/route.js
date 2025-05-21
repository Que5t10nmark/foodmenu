import pool from "../../../../lib/db";
import { NextResponse } from "next/server";

// ========================= UPDATE =========================
export async function PUT(req, { params }) {
  try {
    const option_id = Number(params.id);  // <-- แก้จาก params.option_id เป็น params.id
    if (isNaN(option_id)) {
      return NextResponse.json({ message: "option_id ไม่ถูกต้อง" }, { status: 400 });
    }

    const body = await req.json();
    const { product_type_id, option_type, option_value, option_price } = body;

    if (!product_type_id || !option_type?.trim() || !option_value?.trim() || option_price === undefined) {
      return NextResponse.json({ message: "ข้อมูลไม่ครบถ้วน" }, { status: 400 });
    }

    const [result] = await pool.query(
      `UPDATE product_option SET product_type_id = ?, option_type = ?, option_value = ?, option_price = ? WHERE option_id = ?`,
      [product_type_id, option_type.trim(), option_value.trim(), option_price, option_id]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json({ message: "ไม่พบตัวเลือกสินค้าที่จะอัปเดต" }, { status: 404 });
    }

    return NextResponse.json({ message: "แก้ไขตัวเลือกสินค้าเรียบร้อยแล้ว" }, { status: 200 });
  } catch (error) {
    console.error("Error updating product option:", error);
    return NextResponse.json(
      { message: "เกิดข้อผิดพลาดในการแก้ไขตัวเลือกสินค้า" },
      { status: 500 }
    );
  }
}

// ========================= DELETE =========================
export async function DELETE(req, { params }) {
  try {
    const option_id = Number(params.id);  // <-- แก้จาก params.option_id เป็น params.id
    if (isNaN(option_id)) {
      return NextResponse.json({ message: "option_id ไม่ถูกต้อง" }, { status: 400 });
    }

    const [result] = await pool.query("DELETE FROM product_option WHERE option_id = ?", [option_id]);

    if (result.affectedRows === 0) {
      return NextResponse.json({ message: "ไม่พบตัวเลือกสินค้าที่จะลบ" }, { status: 404 });
    }

    return new Response(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting product option:", error);
    return NextResponse.json(
      { message: "เกิดข้อผิดพลาดในการลบตัวเลือกสินค้า" },
      { status: 500 }
    );
  }
}