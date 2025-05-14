import db from "../../../lib/db"; // นำเข้า db ที่เราเชื่อมต่อไว้

// POST request สำหรับการเพิ่มคำสั่งซื้อ
export async function POST(req) {
  try {
    const { cart, seatId } = await req.json(); // รับข้อมูล cart และ seatId

    // ตรวจสอบว่าข้อมูลที่จำเป็นมีครบถ้วนหรือไม่
    if (!cart || !seatId) {
      return new Response(JSON.stringify({ message: "ข้อมูลไม่ครบถ้วน" }), {
        status: 400,
      });
    }

    // วนลูปเพื่อเพิ่มคำสั่งซื้อทุกตัวใน cart
    for (const item of cart) {
      const { product, size, spiceLevel, toppings, description } = item;

      // สร้างคำสั่ง SQL สำหรับการแทรกข้อมูล
      await db.execute(
        `INSERT INTO purchase 
          (product_id, product_name, product_price, purchase_quantity, seat_id, purchase_size, purchase_spiceLevel, purchase_toppings, purchase_description, purchase_status, purchase_date) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'รอดำเนินการ', CONVERT_TZ(NOW(), 'UTC', 'Asia/Bangkok'))`,
        [
          product.product_id,
          product.product_name, // เพิ่ม product_name
          product.product_price, // เพิ่ม product_price
          product.quantity,
          seatId,
          size,
          spiceLevel,
          JSON.stringify(toppings),
          description,
        ]
      );
    }

    return new Response(JSON.stringify({ message: "คำสั่งซื้อสำเร็จ" }), {
      status: 200,
    });
  } catch (error) {
    console.error("เกิดข้อผิดพลาด:", error);
    return new Response(
      JSON.stringify({ message: "เกิดข้อผิดพลาดในการทำคำสั่งซื้อ" }),
      { status: 500 }
    );
  }
}

export async function GET(req) {
  try {
    const status = req.nextUrl.searchParams.get("status");
    const date = req.nextUrl.searchParams.get("date");

    let query = "SELECT * FROM purchase";
    let conditions = [];
    let params = [];

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

    query += " ORDER BY purchase_date DESC"; // เรียงตามวันที่ล่าสุด

    const [orders] = await db.execute(query, params);
    return new Response(JSON.stringify(orders), { status: 200 });
  } catch (error) {
    console.error("เกิดข้อผิดพลาด:", error);
    return new Response(
      JSON.stringify({ message: "เกิดข้อผิดพลาดในการดึงข้อมูลคำสั่งซื้อ" }),
      { status: 500 }
    );
  }
}


