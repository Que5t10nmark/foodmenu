import db from "../../../../lib/db"; // ปรับ path ตามโปรเจกต์ของคุณ

export async function PUT(req, { params }) {
  try {
    const { id } = params;
    const { status } = await req.json();

    if (!id || !status) {
      return new Response(JSON.stringify({ message: "ข้อมูลไม่ครบถ้วน" }), {
        status: 400,
      });
    }

    const [result] = await db.execute(
      "UPDATE purchase SET purchase_status = ? WHERE purchase_id = ?",
      [status, id]
    );

    if (result.affectedRows === 0) {
      return new Response(JSON.stringify({ message: "ไม่พบคำสั่งซื้อ" }), {
        status: 404,
      });
    }

    return new Response(JSON.stringify({ message: "อัปเดตสถานะสำเร็จ" }), {
      status: 200,
    });
  } catch (error) {
    console.error("เกิดข้อผิดพลาด:", error);
    return new Response(
      JSON.stringify({ message: "เกิดข้อผิดพลาดในการอัปเดตสถานะ" }),
      { status: 500 }
    );
  }
}
