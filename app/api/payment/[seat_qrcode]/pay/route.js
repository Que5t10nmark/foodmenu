import db from "../../../../../lib/db";

export async function PUT(req) {
  const { seat_ids, discount = 0, method, printReceipt = false, total } = await req.json();

  if (!seat_ids || !Array.isArray(seat_ids) || seat_ids.length === 0 || !method) {
    return new Response(JSON.stringify({ message: "กรุณาระบุ seat_ids (array) และ method" }), { status: 400 });
  }

  try {
    // ฟังก์ชันคำนวณราคาตัวเลือก
    const calculateOptionsPrice = (selectedOption) => {
      if (!selectedOption || typeof selectedOption !== "object") return 0;
      let totalOptionPrice = 0;
      for (const optionType in selectedOption) {
        const optionValues = selectedOption[optionType];
        if (Array.isArray(optionValues)) {
          totalOptionPrice += optionValues.reduce(
            (sum, opt) => sum + (Number(opt.product_option_price) || 0),
            0
          );
        } else if (typeof optionValues === "object" && optionValues !== null) {
          totalOptionPrice += Number(optionValues.product_option_price) || 0;
        }
      }
      return totalOptionPrice;
    };

    // ดึงออเดอร์และ normalize ข้อมูล
    const placeholders = seat_ids.map(() => "?").join(",");
    const [orders] = await db.execute(
      `
      SELECT purchase_id, seat_id, product_price, purchase_quantity, selected_option, purchase_status
      FROM purchase
      WHERE seat_id IN (${placeholders})
        AND purchase_status = 'เสร็จแล้ว'
        AND purchase_id NOT IN (SELECT purchase_id FROM payment_detail)
      `,
      seat_ids
    );

    if (orders.length === 0) {
      return new Response(JSON.stringify({ message: "ไม่พบคำสั่งซื้อที่ต้องชำระ" }), { status: 404 });
    }

    // Normalize orders และคำนวณ totalPrice ต่อออเดอร์
    const normalizedOrders = orders.map((order) => {
      const selectedOption =
        typeof order.selected_option === "string"
          ? JSON.parse(order.selected_option || "{}")
          : order.selected_option || {};
      const basePrice = Number(order.product_price) || 0;
      const quantity = Number(order.purchase_quantity) || 1;
      const optionPrice = calculateOptionsPrice(selectedOption);
      const totalPrice = (basePrice + optionPrice) * quantity;
      return {
        ...order,
        product_price: basePrice,
        selected_option: selectedOption,
        totalPrice,
      };
    });

    // กลุ่มออเดอร์ตาม seat_id และคำนวณ total ต่อ seat_id
    const ordersBySeat = normalizedOrders.reduce((acc, order) => {
      if (!acc[order.seat_id]) acc[order.seat_id] = [];
      acc[order.seat_id].push(order);
      return acc;
    }, {});

    // คำนวณ total ต่อ seat_id และแบ่งส่วนลด
    const seatTotals = Object.keys(ordersBySeat).map((seat_id) => {
      const seatOrders = ordersBySeat[seat_id];
      const seatTotal = seatOrders.reduce((sum, order) => sum + order.totalPrice, 0);
      return { seat_id: Number(seat_id), seatTotal };
    });

    const calculatedTotal = seatTotals.reduce((sum, seat) => sum + seat.seatTotal, 0);
    const finalTotal = calculatedTotal - Number(discount);

    // ตรวจสอบว่า total จาก frontend ตรงกับ calculatedTotal
    if (total !== undefined && Math.abs(total - finalTotal) > 0.01) {
      return new Response(
        JSON.stringify({ message: "ยอดรวมจาก frontend ไม่ตรงกับการคำนวณใน backend" }),
        { status: 400 }
      );
    }

    // แบ่งส่วนลดตามสัดส่วนของ seatTotal
    const totalDiscount = Number(discount);
    const paymentIds = [];
    for (const { seat_id, seatTotal } of seatTotals) {
      const seatDiscount = totalDiscount * (seatTotal / calculatedTotal) || 0;
      const seatFinalTotal = seatTotal - seatDiscount;

      // บันทึกข้อมูลการชำระเงินสำหรับแต่ละ seat_id
      const [insertPayment] = await db.execute(
        `
        INSERT INTO payment (seat_id, payment_total, payment_discount, payment_method, payment_receipt, payment_date)
        VALUES (?, ?, ?, ?, ?, CONVERT_TZ(NOW(), 'UTC', 'Asia/Bangkok'))
        `,
        [seat_id, seatFinalTotal, seatDiscount, method, printReceipt ? 1 : 0]
      );

      const payment_id = insertPayment.insertId;
      paymentIds.push({ seat_id, payment_id });

      // บันทึก payment_detail สำหรับออเดอร์ใน seat_id นี้
      const seatOrders = ordersBySeat[seat_id];
      for (const order of seatOrders) {
        await db.execute(
          `INSERT INTO payment_detail (payment_id, purchase_id) VALUES (?, ?)`,
          [payment_id, order.purchase_id]
        );
      }
    }

    // ส่ง response พร้อมข้อมูล orders และ total
    return new Response(
      JSON.stringify({
        message: "ชำระเงินสำเร็จ",
        orders: normalizedOrders.map((order) => ({
          purchase_id: order.purchase_id,
          seat_id: order.seat_id,
          product_price: order.product_price,
          purchase_quantity: order.purchase_quantity,
          selected_option: order.selected_option,
          totalPrice: order.totalPrice,
        })),
        total: finalTotal,
        discount: Number(discount),
        payment_ids: paymentIds,
      }),
      { status: 200 }
    );
  } catch (err) {
    console.error("PAYMENT ERROR:", err);
    return new Response(JSON.stringify({ message: "เกิดข้อผิดพลาดในการชำระเงิน" }), { status: 500 });
  }
}