import db from "../../../lib/db";
import bcrypt from "bcryptjs";  // ใช้สำหรับการเข้ารหัสรหัสผ่าน

export async function POST(req) {
  const { account_name, account_username, account_password, account_phone, account_address, account_role } = await req.json();

  // เข้ารหัสรหัสผ่าน
  const hashedPassword = await bcrypt.hash(account_password, 10);

  return new Promise((resolve, reject) => {
    const query = `
      INSERT INTO account (account_name, account_username, account_password, account_phone, account_address, account_role)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const values = [account_name, account_username, hashedPassword, account_phone, account_address, account_role];

    db.query(query, values, (err, result) => {
      if (err) {
        reject(new Error("ไม่สามารถลงทะเบียนได้"));
      } else {
        resolve(new Response("ลงทะเบียนสำเร็จ", { status: 200 }));
      }
    });
  });
}
