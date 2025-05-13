import { NextResponse } from "next/server"; // ✅ ใช้สำหรับส่ง Response จาก API
import { writeFile } from "fs/promises"; // ✅ ใช้สำหรับบันทึกไฟล์ลงในเซิร์ฟเวอร์
import { join } from "path"; // ✅ ใช้รวม path ของไฟล์ (ทำให้รองรับทุก OS)
import pool from "../../../../lib/db"; // ✅ นำเข้า database connection pool

// ✅ ฟังก์ชันช่วยรันคำสั่ง SQL และจัดการข้อผิดพลาด
async function handleDBQuery(query, params) {
  try {
    const [result] = await pool.query(query, params); // ✅ รัน SQL query
    return result; // ✅ คืนค่าผลลัพธ์จากฐานข้อมูล
  } catch (error) {
    throw new Error(error.message); // ✅ ส่ง error กลับไปถ้ามีปัญหา
  }
}

// ✅ ดึงข้อมูลสินค้า (GET)
export async function GET(req, { params }) {
  const routeParams = await params;
  const product_id = Number(routeParams?.id); // ✅ แปลง id เป็นตัวเลข
  if (isNaN(product_id)) {
    // ✅ ถ้า id ไม่ใช่ตัวเลข ส่ง error 400
    return NextResponse.json(
      { message: "❌ Invalid product ID" },
      { status: 400 }
    );
  }

  // ✅ ดึงข้อมูลสินค้าและประเภทจากฐานข้อมูล
  const product = await handleDBQuery(
    `SELECT p.*, pt.product_type_name 
    FROM product p
    JOIN product_type pt ON p.product_type = pt.product_type_id
    WHERE p.product_id = ?`,
    [product_id]
  );

  return NextResponse.json(
    product.length ? product[0] : { message: "❌ Product not found" },
    { status: product.length ? 200 : 404 }
  );
}  

// ✅ เพิ่มสินค้าใหม่ (POST)
export async function POST(req) {
  try {
    const formData = await req.formData(); // ✅ รับค่าจากฟอร์ม

    // ✅ ดึงค่าจากฟอร์มและเก็บไว้ในตัวแปร
    const productData = {
      product_name: formData.get("product_name") || "", // ✅ ชื่อสินค้า
      product_type: formData.get("product_type") || "", // ✅ ประเภทสินค้า
      product_price: formData.get("product_price") || "0", // ✅ ราคา
      product_size: formData.get("product_size") || "", // ✅ ขนาด
      product_description: formData.get("product_description") || "", // ✅ คำอธิบาย
      product_status: formData.get("product_status") === "1" ? 1 : 0, // ✅ สถานะสินค้า (1 = มี, 0 = ไม่มี)
    };

    let product_image = ""; // ✅ กำหนดตัวแปรเก็บชื่อไฟล์รูปภาพ
    const file = formData.get("file"); // ✅ ดึงไฟล์ที่อัปโหลดจากฟอร์ม
    if (file && file.name) {
      // ✅ ตรวจสอบว่ามีไฟล์แนบมาหรือไม่
      const ext = file.name.split(".").pop(); // ✅ ดึงนามสกุลไฟล์
      product_image = `${Date.now()}.${ext}`; // ✅ สร้างชื่อไฟล์ใหม่เพื่อป้องกันชื่อซ้ำ
      const filePath = join(process.cwd(), "public/uploads", product_image); // ✅ กำหนด path ที่บันทึกไฟล์
      await writeFile(filePath, Buffer.from(await file.arrayBuffer())); // ✅ บันทึกไฟล์ลงในโฟลเดอร์
    }

    // ✅ บันทึกข้อมูลสินค้าเข้าในฐานข้อมูล
    const query = `
      INSERT INTO product 
      (product_name, product_type, product_price, product_size, product_image, product_description, product_status) 
      VALUES (?, ?, ?, ?, ?, ?, ?)`;

    const params = [
      productData.product_name,
      productData.product_type,
      productData.product_price,
      productData.product_size,
      product_image, // ✅ ใช้ชื่อไฟล์ที่อัปโหลด
      productData.product_description,
      productData.product_status,
    ];

    const result = await handleDBQuery(query, params); // ✅ รัน SQL query

    return NextResponse.json(
      { message: "✅ Product added", product_id: result.insertId }, // ✅ ส่งข้อมูลกลับไปพร้อม ID ของสินค้าที่เพิ่ม
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "❌ Error adding product", error: error.message },
      { status: 500 }
    );
  }
}

// ✅ อัปเดตข้อมูลสินค้า (PUT)
export async function PUT(req, { params }) {
  try {
    console.log("🔹 Request received:", req.method, req.url);
    const routeParams = await params;
    const product_id = Number(routeParams.id);
    if (!product_id || isNaN(product_id)) {
      // ✅ ตรวจสอบว่า ID ถูกต้อง
      return NextResponse.json(
        { message: "❌ Invalid product ID" },
        { status: 400 }
      );
    }

    const contentType = req.headers.get("content-type") || ""; // ✅ ตรวจสอบประเภทของข้อมูลที่ส่งมา
    let productData = {};
    let product_image = "";

    if (contentType.includes("multipart/form-data")) {
      // ✅ ถ้าเป็น multipart/form-data แสดงว่ามีไฟล์แนบ
      const formData = await req.formData();
      console.log("🔹 Received formData:", formData);

      productData = {
        product_name: formData.get("product_name") || "",
        product_type: formData.get("product_type") || "",
        product_price: formData.get("product_price") || "0",
        product_size: formData.get("product_size") || "",
        product_description: formData.get("product_description") || "",
        product_status: formData.get("product_status") === "1" ? 1 : 0,
      };

      const file = formData.get("file"); // ✅ รับไฟล์ที่อัปโหลด
      if (file && file.name) {
        // ✅ ถ้ามีไฟล์แนบ
        const ext = file.name.split(".").pop();
        product_image = `${Date.now()}.${ext}`;
        const filePath = join(process.cwd(), "public/uploads", product_image);
        await writeFile(filePath, Buffer.from(await file.arrayBuffer())); // ✅ บันทึกไฟล์
        console.log("✅ Image uploaded:", product_image);
      } else {
        product_image = formData.get("product_image") || ""; // ✅ ถ้าไม่มีอัปโหลดใหม่ ใช้ภาพเดิม
      }
    } else {
      productData = await req.json();
      product_image = productData.product_image || ""; // ✅ ใช้ค่าที่ส่งมา
    }

    console.log("🔹 Parsed productData:", productData);
    console.log("🔹 Using product_image:", product_image);

    // ✅ อัปเดตข้อมูลสินค้าในฐานข้อมูล
    const query = `
      UPDATE product 
      SET product_name = ?, product_type = ?, product_price = ?, 
          product_size = ?, product_image = ?, product_description = ?, 
          product_status = ? 
      WHERE product_id = ?
    `;

    const queryParams = [
      productData.product_name,
      productData.product_type,
      productData.product_price,
      productData.product_size,
      product_image,
      productData.product_description,
      productData.product_status,
      product_id,
    ];

    console.log("🔹 Executing SQL Query:", query);
    console.log("🔹 Query Parameters:", queryParams);

    const [result] = await pool.query(query, queryParams);
    console.log("✅ Query result:", result);

    return NextResponse.json(
      {
        message: result.affectedRows
          ? "✅ Product updated"
          : "❌ Product not found",
      },
      { status: result.affectedRows ? 200 : 404 }
    );
  } catch (error) {
    console.error("❌ Error updating product:", error);
    return NextResponse.json(
      { message: "❌ Error updating product", error: error.message },
      { status: 500 }
    );
  }
}

// ✅ ลบสินค้า (DELETE)
export async function DELETE(req) {
  const product_id = Number(req.nextUrl.pathname.split("/").pop());
  if (isNaN(product_id)) {
    return NextResponse.json(
      { message: "❌ Invalid product ID" },
      { status: 400 }
    );
  }

  const result = await handleDBQuery(
    "DELETE FROM product WHERE product_id = ?",
    [product_id]
  );

  return NextResponse.json(
    {
      message: result.affectedRows
        ? "✅ Product deleted"
        : "❌ Product not found",
    },
    { status: result.affectedRows ? 200 : 404 }
  );
}
