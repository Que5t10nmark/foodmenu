import Sidebar from "./components/Sidebar";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "../api/auth/[...nextauth]/route"; // path ของ next-auth config

export default async function BackofficeLayout({ children }) {
  const session = await getServerSession(authOptions);

  // ถ้าไม่มี session → redirect ไป login
  if (!session) {
    redirect("/login");
  }

  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-grow p-6">{children}</main>
    </div>
  );
}