import db from "../../../lib/db";

export async function GET(request) {
  try {
    const options = await db.product_option.findMany();
    return new Response(JSON.stringify(options), { status: 200 });
  } catch (error) {
    return new Response(
      JSON.stringify({ message: "เกิดข้อผิดพลาดในการดึงข้อมูลตัวเลือกสินค้า" }),
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { product_type_id, option_type, option_value, option_price } = body;

    if (!product_type_id || !option_type || !option_value || option_price === undefined) {
      return new Response(JSON.stringify({ message: "ข้อมูลไม่ครบถ้วน" }), { status: 400 });
    }

    const newOption = await db.product_option.create({
      data: {
        product_type_id: Number(product_type_id),
        option_type,
        option_value,
        option_price: Number(option_price),
      },
    });

    return new Response(JSON.stringify(newOption), { status: 201 });
  } catch (error) {
    return new Response(JSON.stringify({ message: "เกิดข้อผิดพลาดในการเพิ่มตัวเลือกสินค้า" }), {
      status: 500,
    });
  }
}
