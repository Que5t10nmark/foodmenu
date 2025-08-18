import bcrypt from "bcryptjs";
import pool from "../../../../lib/db"; // ปรับ path ถ้าจำเป็น
import { NextResponse } from "next/server";

export async function PUT(req, { params }) {
  try {
    const { id } = params;
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
      "SELECT * FROM account WHERE account_email = ? AND account_id != ?",
      [account_email, id]
    );
    if (existingAccount.length > 0) {
      return NextResponse.json(
        { message: "อีเมลนี้มีอยู่ในระบบแล้ว" },
        { status: 409 }
      );
    }

    let query = `
      UPDATE account 
      SET account_name = ?, account_email = ?, account_phone = ?, account_address = ?, account_role = ?
      WHERE account_id = ?
    `;
    let values = [
      account_name,
      account_email,
      account_phone,
      account_address,
      account_role,
      id,
    ];

    if (account_password) {
      const hashedPassword = await bcrypt.hash(account_password, 10);
      query = `
        UPDATE account 
        SET account_name = ?, account_email = ?, account_password = ?, account_phone = ?, account_address = ?, account_role = ?
        WHERE account_id = ?
      `;
      values = [
        account_name,
        account_email,
        hashedPassword,
        account_phone,
        account_address,
        account_role,
        id,
      ];
    }

    const [result] = await pool.query(query, values);

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { message: "ไม่พบข้อมูลบัญชีที่ต้องการแก้ไข" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "แก้ไขบัญชีสำเร็จ" },
      { status: 200 }
    );
  } catch (error) {
    console.error("เกิดข้อผิดพลาดในการแก้ไขบัญชี:", error);
    return NextResponse.json(
      { message: "เกิดข้อผิดพลาดในการแก้ไขบัญชี", error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(req, { params }) {
  try {
    const { id } = params;
    const query = "DELETE FROM account WHERE account_id = ?";
    const values = [id];

    const [result] = await pool.query(query, values);

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { message: "ไม่พบข้อมูลบัญชีที่ต้องการลบ" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "ลบบัญชีสำเร็จ" },
      { status: 200 }
    );
  } catch (error) {
    console.error("เกิดข้อผิดพลาดในการลบบัญชี:", error);
    return NextResponse.json(
      { message: "เกิดข้อผิดพลาดในการลบบัญชี", error: error.message },
      { status: 500 }
    );
  }
}