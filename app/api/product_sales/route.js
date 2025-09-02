import db from "../../../lib/db";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const date = req.nextUrl.searchParams.get("date");
    const limit = parseInt(req.nextUrl.searchParams.get("limit")) || 5;

    // ดึงสินค้าทั้งหมด และยอดขายของวันที่เลือก (ถ้ามี)
    let query = `
      SELECT 
        p.product_id,
        p.product_name,
        p.product_price,
        COALESCE(SUM(CASE WHEN DATE(pur.purchase_date) = ? THEN pur.purchase_quantity ELSE 0 END), 0) AS total_sold
      FROM product p
      LEFT JOIN purchase pur ON p.product_id = pur.product_id
      LEFT JOIN payment_detail pd ON pur.purchase_id = pd.purchase_id
      GROUP BY p.product_id, p.product_name, p.product_price
      ORDER BY total_sold DESC
    `;

    const [products] = await db.execute(query, [date]);

    // แยกออกเป็น ขายดี (มีขาย) และ ขายไม่ดี (ไม่มีขาย)
    const soldProducts = products.filter((p) => p.total_sold > 0);
    const unsoldProducts = products.filter((p) => p.total_sold <= 0);

    // จำกัดจำนวนตาม limit
    const topSellers = soldProducts.slice(0, limit);
    const lowSellers = unsoldProducts.slice(0, limit);

    return NextResponse.json(
      { 
        topSellers, 
        lowSellers, 
        totalProducts: products.length 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ PRODUCT SALES GET ERROR:", error);
    return NextResponse.json(
      { message: "เกิดข้อผิดพลาดในการดึงข้อมูลยอดขายสินค้า", error: error.message },
      { status: 500 }
    );
  }
}
