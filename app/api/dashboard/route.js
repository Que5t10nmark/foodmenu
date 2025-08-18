import db from "../../../lib/db";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ message: "Missing or invalid authorization token" }, { status: 401 });
    }

    const today = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Bangkok" });

    const [menuResult] = await db.execute("SELECT COUNT(*) AS menuCount FROM product");
    const menuCount = Number(menuResult[0].menuCount) || 0;

    const [tableResult] = await db.execute("SELECT COUNT(*) AS tableCount FROM seat");
    const tableCount = Number(tableResult[0].tableCount) || 0;

    const [activeTables] = await db.execute(`
      SELECT COUNT(DISTINCT seat_id) AS occupiedCount
      FROM purchase
      WHERE purchase_status != 'เสร็จแล้ว'
        AND purchase_id NOT IN (SELECT purchase_id FROM payment_detail)
    `);
    const tablesAvailable = tableCount - (Number(activeTables[0].occupiedCount) || 0);

    const [staffResult] = await db.execute("SELECT COUNT(*) AS staffCount FROM account WHERE account_role = ?", ["พนักงาน"]);
    const staffCount = Number(staffResult[0].staffCount) || 0;

    const [salesResult] = await db.execute(`
      SELECT COALESCE(SUM(payment_total), 0) AS dailySales
      FROM payment
      WHERE DATE(CONVERT_TZ(payment_date, 'UTC', 'Asia/Bangkok')) = ?
    `, [today]);
    const dailySales = Number(salesResult[0].dailySales) || 0;

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
    }, { status: 200 });

  } catch (error) {
    return NextResponse.json(
      { message: "เกิดข้อผิดพลาดในการดึงข้อมูลแดชบอร์ด", error: error.message },
      { status: 500 }
    );
  }
}