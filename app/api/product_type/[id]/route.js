import pool from "../../../lib/db"; // แก้ path ให้ตรงตามของคุณ

// ========================= GET BY ID =========================
export async function GET(_, context) {
  const { id } = context.params;
  const product_type_id = Number(id);

  if (isNaN(product_type_id)) {
    return new Response(
      JSON.stringify({ message: "Invalid product type ID" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const [rows] = await pool.query(
      "SELECT * FROM product_type WHERE product_type_id = ?",
      [product_type_id]
    );

    if (rows.length === 0) {
      return new Response(
        JSON.stringify({ message: "Product type not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify(rows[0]), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ message: "Error fetching product type", error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

// ========================= UPDATE =========================
export async function PUT(req, context) {
  const { id } = context.params;
  const product_type_id = Number(id);
  const { product_type_name } = await req.json();

  if (!product_type_name || !product_type_name.trim()) {
    return new Response(
      JSON.stringify({ message: "Product type name is required" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const [result] = await pool.query(
      "UPDATE product_type SET product_type_name = ? WHERE product_type_id = ?",
      [product_type_name.trim(), product_type_id]
    );

    if (result.affectedRows === 0) {
      return new Response(
        JSON.stringify({ message: "Product type not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ message: "Product type updated successfully" }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        message: "Error updating product type",
        error: error.message,
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

// ========================= DELETE =========================
export async function DELETE(_, context) {
  const { id } = context.params;
  const product_type_id = Number(id);

  try {
    const [result] = await pool.query(
      "DELETE FROM product_type WHERE product_type_id = ?",
      [product_type_id]
    );

    if (result.affectedRows === 0) {
      return new Response(
        JSON.stringify({ message: "Product type not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ message: "Product type deleted successfully" }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ message: "Error deleting product type", error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}