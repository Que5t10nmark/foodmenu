import db from "../../../lib/db";
import bcrypt from "bcryptjs"; // ใช้สำหรับการเข้ารหัสรหัสผ่าน
import pool from "../../../lib/db";

import { NextResponse } from "next/server";
export async function GET(request) {
  try {
    const [account] = await pool.query("SELECT * FROM account");

    return NextResponse.json(account, { status: 200 });
  } catch (error) {
    console.error("Error fetching accounts:", error);
    return NextResponse.json(
      { message: "Error fetching accounts", error: error.message },
      { status: 500 }
    );
  }
}
export async function POST(req) {
  const {
    account_name,
    account_email,
    account_password,
    account_phone,
    account_address,
    account_role,
  } = await req.json();

  // เข้ารหัสรหัสผ่าน
  const hashedPassword = await bcrypt.hash(account_password, 10);

  return new Promise((resolve, reject) => {
    const query = `
      INSERT INTO account (account_name, account_email, account_password, account_phone, account_address, account_role)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const values = [
      account_name,
      account_email,
      hashedPassword,
      account_phone,
      account_address,
      account_role,
    ];

    db.query(query, values, (err, result) => {
      if (err) {
        reject(new Error("ไม่สามารถลงทะเบียนได้"));
      } else {
        resolve(new Response("ลงทะเบียนสำเร็จ", { status: 200 }));
      }
    });
  });
}
