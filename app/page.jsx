import Link from 'next/link';

export default function Home() {
  return (
    <div className="max-w-4xl mx-auto text-center py-12">
      <h1 className="text-4xl font-bold text-orange-500 mb-4">ยินดีต้อนรับสู่ Steak NiWha</h1>
      <p className="text-xl text-gray-700 mb-8">ระบบบริหารจัดการร้านอาหารสำหรับเจ้าของและพนักงาน</p>

      <div className="space-x-4">
        <Link href="/login">
          <button className="bg-blue-500 text-white py-2 px-6 rounded-lg hover:bg-blue-600 transition duration-300">
            เข้าสู่ระบบ
          </button>
        </Link>
        <Link href="/backoffice/product">
          <button className="bg-green-500 text-white py-2 px-6 rounded-lg hover:bg-green-600 transition duration-300">
            ไปยังหน้าเมนูอาหาร
          </button>
        </Link>
      </div>
    </div>
  );
}
