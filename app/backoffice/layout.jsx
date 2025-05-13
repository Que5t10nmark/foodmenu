import Sidebar from "./components/Sidebar";

export default function BackofficeLayout({ children }) {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-grow p-6">{children}</main>
    </div>
  );
}
