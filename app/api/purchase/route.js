import db from "../../../lib/db"; // เชื่อมต่อฐานข้อมูล

// เพิ่มคำสั่งซื้อ (POST)
export async function POST(req) {
  try {
    const { cart, seatId } = await req.json();

    if (!cart || !seatId) {
      return new Response(JSON.stringify({ message: "ข้อมูลไม่ครบถ้วน" }), {
        status: 400,
      });
    }

    for (const item of cart) {
      const { product, selected_option, description } = item;

      await db.execute(
        `INSERT INTO purchase 
        (product_id, product_name, product_price, purchase_quantity, seat_id, selected_option, purchase_description, purchase_status, purchase_date) 
        VALUES (?, ?, ?, ?, ?, ?, ?, 'รอดำเนินการ', CONVERT_TZ(NOW(), 'UTC', 'Asia/Bangkok'))`,
        [
          product.product_id,
          product.product_name,
          product.product_price,
          product.quantity,
          seatId,
          selected_option ? JSON.stringify(selected_option) : null,
          description ?? null,
        ]
      );
    }

    return new Response(JSON.stringify({ message: "สั่งซื้อสำเร็จ" }), {
      status: 200,
    });
  } catch (error) {
    console.error("❌ POST ERROR:", error);
    return new Response(
      JSON.stringify({ message: "เกิดข้อผิดพลาดในการบันทึกคำสั่งซื้อ" }),
      { status: 500 }
    );
  }
}

// ดึงคำสั่งซื้อ (GET)
export async function GET(req) {
  try {
    const status = req.nextUrl.searchParams.get("status");
    const date = req.nextUrl.searchParams.get("date");

    let query = "SELECT * FROM purchase";
    const conditions = [];
    const params = [];

    if (status) {
      conditions.push("purchase_status = ?");
      params.push(status);
    }

    if (date) {
      conditions.push("DATE(purchase_date) = ?");
      params.push(date);
    }

    if (conditions.length > 0) {
      query += " WHERE " + conditions.join(" AND ");
    }

    query += " ORDER BY purchase_date DESC";

    const [orders] = await db.execute(query, params);

    function tryParseJSON(jsonString) {
      try {
        const obj = JSON.parse(jsonString);
        if (obj && typeof obj === "object") {
          return obj;
        }
      } catch {
        // parse ไม่ได้
      }
      return null;
    }

    const parsedOrders = orders.map((order) => ({
      ...order,
      selected_option: order.selected_option
        ? tryParseJSON(order.selected_option) ?? order.selected_option
        : null,
    }));

    return new Response(JSON.stringify(parsedOrders), { status: 200 });
  } catch (error) {
    console.error("❌ GET ERROR:", error);
    return new Response(
      JSON.stringify({ message: "เกิดข้อผิดพลาดในการดึงข้อมูลคำสั่งซื้อ" }),
      { status: 500 }
    );
  }
}
