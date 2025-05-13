import { NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import { join } from "path";

export async function POST(req) {
  try {
    // ✅ อ่านค่า FormData
    const formData = await req.formData();
    const file = formData.get("file");

    // ✅ ตรวจสอบว่ามีไฟล์อัปโหลด
    if (!file) {
      return NextResponse.json({ message: "❌ No file uploaded" }, { status: 400 });
    }

    // ✅ ตั้งชื่อไฟล์ใหม่เพื่อป้องกันซ้ำกัน
    const ext = file.name.split(".").pop(); // ดึงนามสกุลไฟล์
    const fileName = `${Date.now()}.${ext}`;
    const filePath = join(process.cwd(), "public/uploads", fileName);

    // ✅ เขียนไฟล์ลงใน `public/uploads`
    await writeFile(filePath, Buffer.from(await file.arrayBuffer()));

    console.log("✅ File uploaded:", fileName);

    return NextResponse.json({ message: "✅ File uploaded", fileName }, { status: 200 });
  } catch (error) {
    console.error("❌ Error uploading file:", error);
    return NextResponse.json({ message: "❌ Error uploading file", error: error.message }, { status: 500 });
  }
}
