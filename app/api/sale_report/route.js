import db from "../../../lib/db";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const date = req.nextUrl.searchParams.get("date");

    let query = `
      SELECT 
        p.purchase_id,
        p.seat_id,
        p.product_name,
        p.product_price,
        p.purchase_quantity,
        p.selected_option,
        p.purchase_status,
        p.purchase_date,
        s.seat_qrcode
      FROM purchase p
      JOIN payment_detail pd ON p.purchase_id = pd.purchase_id
      JOIN payment pm ON pd.payment_id = pm.payment_id
      JOIN seat s ON p.seat_id = s.seat_id
      WHERE pm.payment_id IS NOT NULL
    `;
    const params = [];

    if (date) {
      query += " AND DATE(p.purchase_date) = ?";
      params.push(date);
    }

    query += " ORDER BY p.seat_id, p.purchase_date DESC";

    const [orders] = await db.execute(query, params);

    function tryParseJSON(jsonString) {
      try {
        const obj = JSON.parse(jsonString);
        if (obj && typeof obj === "object") {
          return obj;
        }
      } catch {
        console.error("Failed to parse JSON:", jsonString);
        return null;
      }
      return null;
    }

    const parsedOrders = orders.map((order) => ({
      ...order,
      selected_option: order.selected_option ? tryParseJSON(order.selected_option) : null,
    }));

    console.log("Sales report data:", parsedOrders); // ดีบัก: ตรวจสอบข้อมูลที่ส่งกลับ

    return NextResponse.json(parsedOrders, { status: 200 });
  } catch (error) {
    console.error("❌ SALES REPORT GET ERROR:", error);
    return NextResponse.json(
      { message: "เกิดข้อผิดพลาดในการดึงข้อมูลรายงานยอดขาย", error: error.message },
      { status: 500 }
    );
  }
}