import db from "../../../lib/db";

function stringifySelectedOptions(selected_option) {
  if (!selected_option || typeof selected_option !== "object") return null;

  // แปลง selected_option เป็น JSON string 
  return JSON.stringify(
    Object.fromEntries(
      Object.entries(selected_option).map(([optionType, optionValues]) => {
        if (Array.isArray(optionValues)) {
          return [
            optionType,
            optionValues.map((opt) =>
              typeof opt === "object" && opt !== null
                ? {
                    product_option_value: opt.product_option_value || "",
                    product_option_price: Number(opt.product_option_price) || 0,
                  }
                : { product_option_value: opt || "", product_option_price: 0 }
            ),
          ];
        } else if (typeof optionValues === "object" && optionValues !== null) {
          return [
            optionType,
            {
              product_option_value: optionValues.product_option_value || "",
              product_option_price: Number(optionValues.product_option_price) || 0,
            },
          ];
        } else {
          return [optionType, { product_option_value: optionValues || "", product_option_price: 0 }];
        }
      })
    )
  );
}

export async function POST(req) {
  try {
    const { cart, seat_qrcode } = await req.json();

    if (!cart || !seat_qrcode) {
      return new Response(JSON.stringify({ message: "ข้อมูลไม่ครบถ้วน" }), {
        status: 400,
      });
    }

    for (const item of cart) {
      const { product, selected_option, description } = item;
      const selectedOptionText = stringifySelectedOptions(selected_option);

      await db.execute(
        `INSERT INTO purchase 
        (product_id, product_name, product_price, purchase_quantity, seat_id, selected_option, purchase_description, purchase_status, purchase_date) 
        VALUES (?, ?, ?, ?, ?, ?, ?, 'รอดำเนินการ', CONVERT_TZ(NOW(), 'UTC', 'Asia/Bangkok'))`,
        [
          product.product_id,
          product.product_name,
          product.product_price,
          product.quantity,
          seat_qrcode,
          selectedOptionText,
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

export async function GET(req) {
  try {
    const status = req.nextUrl.searchParams.get("status");
    const date = req.nextUrl.searchParams.get("date");

    let query = `
      SELECT * FROM purchase 
      WHERE purchase_id NOT IN (
        SELECT purchase_id FROM payment_detail
      )
    `;
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
      query += " AND " + conditions.join(" AND ");
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
        // parse ไม่ได้ คืนค่าเป็นสตริงเดิม
        return jsonString;
      }
      return null;
    }

    const parsedOrders = orders.map((order) => ({
      ...order,
      selected_option: order.selected_option ? tryParseJSON(order.selected_option) : null,
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