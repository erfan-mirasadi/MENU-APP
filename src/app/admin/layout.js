import AdminMobileNav from "./_components/layouts/AdminMobileNav";
import AdminSidebar from "./_components/layouts/AdminSidebar";

export default function AdminLayout({ children }) {
  return (
    <div className="flex w-full h-[100dvh] bg-dark-900 text-text-light font-sans overflow-hidden">
      <AdminSidebar />
      <main className="flex-1 flex flex-col h-full relative min-w-0">
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-8 pb-24 md:pb-8">
          {children}
        </div>
      </main>
      <AdminMobileNav />
    </div>
  );
}
