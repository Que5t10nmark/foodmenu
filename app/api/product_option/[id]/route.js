import pool from "../../../../lib/db";
import { NextResponse } from "next/server";

export async function PUT(req, { params }) {
  const product_option_id = Number(params.id);
  const { product_type_id, product_option_type, product_option_value, product_option_price } = await req.json();

  if (!product_type_id || !product_option_type || !product_option_value || product_option_price === undefined) {
    return NextResponse.json({ message: "ข้อมูลไม่ครบถ้วน" }, { status: 400 });
  }

  const [result] = await pool.query(
    `UPDATE product_option SET product_type_id=?, product_option_type=?, product_option_value=?, product_option_price=? WHERE product_option_id=?`,
    [product_type_id, product_option_type.trim(), product_option_value.trim(), product_option_price, product_option_id]
  );

  return NextResponse.json({ message: "แก้ไขสำเร็จ" });
}

export async function DELETE(req, { params }) {
  const product_option_id = Number(params.id);
  const [result] = await pool.query("DELETE FROM product_option WHERE product_option_id = ?", [product_option_id]);

  return new Response(null, { status: 204 });
}
