import bcrypt from "bcryptjs";
import pool from "../../../lib/db";
import { NextResponse } from "next/server";

export async function GET() {
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
  try {
    const {
      account_name,
      account_email,
      account_password,
      account_phone,
      account_address,
      account_role,
    } = await req.json();

    if (
      !account_name ||
      !account_email ||
      !account_password ||
      !account_phone ||
      !account_address ||
      !account_role
    ) {
      return NextResponse.json(
        { message: "กรุณากรอกข้อมูลให้ครบทุกช่อง" },
        { status: 400 }
      );
    }

    const [existingAccount] = await pool.query(
      "SELECT * FROM account WHERE account_email = ?",
      [account_email]
    );
    if (existingAccount.length > 0) {
      return NextResponse.json(
        { message: "อีเมลนี้มีอยู่ในระบบแล้ว" },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(account_password, 10);
    const [result] = await pool.query(
      "INSERT INTO account (account_name, account_email, account_password, account_phone, account_address, account_role) VALUES (?, ?, ?, ?, ?, ?)",
      [
        account_name,
        account_email,
        hashedPassword,
        account_phone,
        account_address,
        account_role,
      ]
    );

    return NextResponse.json(
      { message: "เพิ่มบัญชีผู้ใช้งานเรียบร้อยแล้ว" },
      { status: 201 }
    );
  } catch (error) {
    console.error("เกิดข้อผิดพลาดในการลงทะเบียน:", error);
    return NextResponse.json(
      { message: "เกิดข้อผิดพลาดในการลงทะเบียน", error: error.message },
      { status: 500 }
    );
  }
}