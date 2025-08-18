import db from "../../../lib/db";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const date = req.nextUrl.searchParams.get("date");
    const limit = parseInt(req.nextUrl.searchParams.get("limit")) || 5;

    let query = `
      SELECT 
        p.product_id,
        p.product_name,
        p.product_price,
        COALESCE(SUM(pur.purchase_quantity), 0) AS total_sold,
        GROUP_CONCAT(pur.selected_option) AS option_details
      FROM product p
      LEFT JOIN purchase pur ON p.product_id = pur.product_id
      LEFT JOIN payment_detail pd ON pur.purchase_id = pd.purchase_id
      WHERE pur.purchase_id IS NULL OR pur.purchase_id IN (
        SELECT purchase_id FROM payment_detail
      )
    `;
    const params = [];

    if (date) {
      query += " AND DATE(pur.purchase_date) = ?";
      params.push(date);
    }

    query += `
      GROUP BY p.product_id, p.product_name, p.product_price
      ORDER BY total_sold DESC
    `;

    const [products] = await db.execute(query, params);

    function tryParseJSON(jsonString) {
      try {
        if (!jsonString) return [];
        const obj = JSON.parse(jsonString);
        if (obj && typeof obj === "object") {
          return [obj];
        }
      } catch (error) {
        console.error("Failed to parse JSON:", jsonString, error);
        return [];
      }
      return [];
    }

    const parsedProducts = products.map((product) => {
      const optionDetails = product.option_details
        ? product.option_details
            .split(",")
            .map((opt) => tryParseJSON(opt))
            .flat()
            .filter((opt) => opt && Object.keys(opt).length > 0)
        : [];

      return {
        ...product,
        total_sold: Number(product.total_sold) || 0,
        option_details: optionDetails,
      };
    });

    // แบ่งสินค้าขายดีและไม่ดี
    const topSellers = parsedProducts.slice(0, limit);
    const lowSellers = parsedProducts
      .slice(-limit)
      .reverse()
      .filter(product => product.total_sold > 0 || parsedProducts.length <= limit);

    console.log("Product sales data:", {
      topSellers: JSON.stringify(topSellers, null, 2),
      lowSellers: JSON.stringify(lowSellers, null, 2),
    });

    return NextResponse.json(
      { topSellers, lowSellers, totalProducts: parsedProducts.length },
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