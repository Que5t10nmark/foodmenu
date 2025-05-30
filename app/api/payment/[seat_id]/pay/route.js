import db from "@/lib/db";
export async function PUT(req) {
  const { seat_ids, discount = 0, method, printReceipt = false } = await req.json();

  if (!seat_ids || !Array.isArray(seat_ids) || seat_ids.length === 0 || !method) {
    return new Response(JSON.stringify({ message: "กรุณาระบุ seat_ids (array) และ method" }), { status: 400 });
  }

  try {
    const placeholders = seat_ids.map(() => "?").join(",");
    const [orders] = await db.execute(
      `
      SELECT * FROM purchase
      WHERE seat_id IN (${placeholders})
        AND purchase_status = 'เสร็จแล้ว'
        AND purchase_id NOT IN (SELECT purchase_id FROM payment_detail)
      `,
      seat_ids
    );

    if (orders.length === 0) {
      return new Response(JSON.stringify({ message: "ไม่พบคำสั่งซื้อที่ต้องชำระ" }), { status: 404 });
    }

    const total = orders.reduce((sum, o) => sum + o.product_price * o.purchase_quantity, 0);
    const finalTotal = total - discount;

    const [insertPayment] = await db.execute(
      `
      INSERT INTO payment (seat_id, payment_total, payment_discount, payment_method, payment_receipt, payment_date)
      VALUES (?, ?, ?, ?, ?, CONVERT_TZ(NOW(), 'UTC', 'Asia/Bangkok'))
      `,
      [seat_ids.join(","), finalTotal, discount, method, printReceipt ? 1 : 0]
    );

    const payment_id = insertPayment.insertId;

    for (const order of orders) {
      await db.execute(
        `INSERT INTO payment_detail (payment_id, purchase_id) VALUES (?, ?)`,
        [payment_id, order.purchase_id]
      );
    }

    return new Response(JSON.stringify({ message: "ชำระเงินสำเร็จ" }), { status: 200 });
  } catch (err) {
    console.error("PAYMENT ERROR:", err);
    return new Response(JSON.stringify({ message: "เกิดข้อผิดพลาดในการชำระเงิน" }), { status: 500 });
  }
}
