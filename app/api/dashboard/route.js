import db from "../../../lib/db";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ message: "Missing or invalid authorization token" }, { status: 401 });
    }

    const today = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Bangkok" });

    // นับจำนวนเมนูอาหาร
    const [menuResult] = await db.execute("SELECT COUNT(*) AS menuCount FROM product");
    const menuCount = Number(menuResult[0].menuCount) || 0;

    // นับจำนวนโต๊ะและโต๊ะว่าง
    const [tableResult] = await db.execute("SELECT seat_id, seat_qrcode FROM seat");
    const tableCount = tableResult.length || 0;
    const seatMap = tableResult.reduce((acc, seat) => {
      acc[seat.seat_id] = seat.seat_qrcode;
      return acc;
    }, {});

    const [activeTables] = await db.execute(`
      SELECT DISTINCT seat_id
      FROM purchase
      WHERE purchase_id NOT IN (SELECT purchase_id FROM payment_detail)
    `);
    const occupiedSeats = new Set(activeTables.map(row => row.seat_id));
    const tablesAvailable = tableCount - occupiedSeats.size;

    // นับจำนวนพนักงาน
    const [staffResult] = await db.execute("SELECT COUNT(*) AS staffCount FROM account WHERE account_role = ?", ["พนักงาน"]);
    const staffCount = Number(staffResult[0].staffCount) || 0;

    // คำนวณยอดขายวันนี้จาก payment_total
    const [salesResult] = await db.execute(`
      SELECT COALESCE(SUM(payment_total), 0) AS dailySales
      FROM payment
      WHERE DATE(CONVERT_TZ(payment_date, 'UTC', 'Asia/Bangkok')) = ?
    `, [today]);
    const dailySales = Number(salesResult[0].dailySales) || 0;

    // ดึงเมนูยอดนิยม
    const [topMenus] = await db.execute(`
      SELECT 
        p.product_id,
        p.product_name,
        COALESCE(SUM(pur.purchase_quantity), 0) AS total_sold
      FROM product p
      LEFT JOIN purchase pur ON p.product_id = pur.product_id
      LEFT JOIN payment_detail pd ON pur.purchase_id = pd.purchase_id
      LEFT JOIN payment pm ON pd.payment_id = pm.payment_id
      WHERE pm.payment_id IS NULL OR DATE(CONVERT_TZ(pm.payment_date, 'UTC', 'Asia/Bangkok')) = ?
      GROUP BY p.product_id, p.product_name
      ORDER BY total_sold DESC
      LIMIT 5
    `, [today]);

    const parsedTopMenus = topMenus.map((menu) => ({
      product_id: menu.product_id,
      product_name: menu.product_name,
      total_sold: Number(menu.total_sold) || 0,
    }));

    return NextResponse.json({
      menuCount,
      tableCount,
      tablesAvailable,
      staffCount,
      dailySales,
      topMenus: parsedTopMenus,
      seats: tableResult.map(seat => ({
        seat_id: seat.seat_id,
        seat_qrcode: seat.seat_qrcode,
        isOccupied: occupiedSeats.has(seat.seat_id)
      }))
    }, { status: 200 });

  } catch (error) {
    console.error("Dashboard Error:", error);
    return NextResponse.json(
      { message: "เกิดข้อผิดพลาดในการดึงข้อมูลแดชบอร์ด", error: error.message },
      { status: 500 }
    );
  }
}