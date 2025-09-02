import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import KitchenLayoutClient from "./KitchenLayoutClient";

// ฟังก์ชันตรวจ session ฝั่ง server
async function getSession() {
  const cookieStore = cookies();
  const token = cookieStore.get("next-auth.session-token");
  if (!token) return null;
  return { user: true };
}

export default async function KitchenLayout({ children }) {
  const session = await getSession();
  if (!session) redirect("/login"); // server-side redirect

  // ส่ง children ไปให้ client component
  return <KitchenLayoutClient>{children}</KitchenLayoutClient>;
}