import db from "../../../lib/db";

export async function PUT(req) {
  try {
    const url = new URL(req.url);
    const option_id = Number(url.pathname.split("/").pop());

    const body = await req.json();
    const { product_type_id, option_type, option_value, option_price } = body;
    if (!product_type_id || !option_type || !option_value || option_price === undefined) {
      return new Response(JSON.stringify({ message: "ข้อมูลไม่ครบถ้วน" }), { status: 400 });
    }
    const updatedOption = await db.product_option.update({
      where: { option_id },
      data: {
        product_type_id: Number(product_type_id),
        option_type,
        option_value,
        option_price: Number(option_price),
      },
    });
    return new Response(JSON.stringify(updatedOption), { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({ message: "เกิดข้อผิดพลาดในการแก้ไขตัวเลือกสินค้า" }),
      { status: 500 }
    );
  }
}

export async function DELETE(req) {
  try {
    const url = new URL(req.url);
    const option_id = Number(url.pathname.split("/").pop());

    await db.product_option.delete({ where: { option_id } });
    return new Response(null, { status: 204 });
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({ message: "เกิดข้อผิดพลาดในการลบตัวเลือกสินค้า" }),
      { status: 500 }
    );
  }
}
