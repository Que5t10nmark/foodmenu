// app/api/product_type/route.js
import pool from "../../../lib/db"; // ใช้ @ ถ้า alias ถูกตั้งไว้ใน tsconfig.json/jsconfig.json

import { NextResponse } from "next/server";

// ========================= GET ALL =========================
export async function GET(request) {
  try {
    const [productTypes] = await pool.query("SELECT * FROM product_type");

    return NextResponse.json(productTypes, { status: 200 });
  } catch (error) {
    console.error("Error fetching product types:", error);
    return NextResponse.json(
      { message: "Error fetching product types", error: error.message },
      { status: 500 }
    );
  }
}

// ========================= CREATE =========================
export async function POST(request) {
  try {
    const body = await request.json();
    const { product_type_name } = body;

    if (!product_type_name || !product_type_name.trim()) {
      return NextResponse.json(
        { message: "Missing required field: product_type_name" },
        { status: 400 }
      );
    }

    const [result] = await pool.query(
      "INSERT INTO product_type (product_type_name) VALUES (?)",
      [product_type_name.trim()]
    );

    return NextResponse.json(
      {
        message: "Product type added successfully",
        product_type_id: result.insertId,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error adding product type:", error);
    return NextResponse.json(
      { message: "Error adding product type", error: error.message },
      { status: 500 }
    );
  }
}
