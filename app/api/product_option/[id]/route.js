import pool from "../../../../lib/db";
import { NextResponse } from "next/server";

export async function PUT(req, { params }) {
  const option_id = Number(params.id);
  const { product_type_id, option_type, option_value, option_price } = await req.json();

  if (!product_type_id || !option_type || !option_value || option_price === undefined) {
    return NextResponse.json({ message: "ข้อมูลไม่ครบถ้วน" }, { status: 400 });
  }

  const [result] = await pool.query(
    `UPDATE product_option SET product_type_id=?, option_type=?, option_value=?, option_price=? WHERE option_id=?`,
    [product_type_id, option_type.trim(), option_value.trim(), option_price, option_id]
  );

  return NextResponse.json({ message: "แก้ไขสำเร็จ" });
}

export async function DELETE(req, { params }) {
  const option_id = Number(params.id);
  const [result] = await pool.query("DELETE FROM product_option WHERE option_id = ?", [option_id]);

  return new Response(null, { status: 204 });
}
