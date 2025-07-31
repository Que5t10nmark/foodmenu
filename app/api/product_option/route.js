import pool from "../../../lib/db";
import { NextResponse } from "next/server";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const product_type_id = searchParams.get("product_type_id");

  let query = "SELECT * FROM product_option";
  let params = [];

  if (product_type_id) {
    query += " WHERE product_type_id = ?";
    params.push(product_type_id);
  }

  const [options] = await pool.query(query, params);
  return NextResponse.json(options);
}

export async function POST(request) {
  const { product_type_id, product_option_type, product_option_value, product_option_price } = await request.json();

  if (!product_type_id || !product_option_type?.trim() || !product_option_value?.trim() || product_option_price === undefined) {
    return NextResponse.json({ message: "ข้อมูลไม่ครบถ้วน" }, { status: 400 });
  }

  const [result] = await pool.query(
    `INSERT INTO product_option (product_type_id, product_option_type, product_option_value, product_option_price)
     VALUES (?, ?, ?, ?)`,
    [product_type_id, product_option_type.trim(), product_option_value.trim(), product_option_price]
  );

  return NextResponse.json({ message: "เพิ่มตัวเลือกสินค้าเรียบร้อยแล้ว", product_option_id: result.insertId }, { status: 201 });
}
