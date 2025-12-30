"use client";
import AdminMobileNav from "@/app/admin/_components/layouts/AdminMobileNav"; // مسیر درست رو بده
import AdminSidebar from "@/app/admin/_components/layouts/AdminSidebar"; // مسیر درست رو بده
import { WAITER_LINKS } from "./_components/waiterNavLinks";

export default function WaiterLayout({ children }) {
  // اینجا دیگه نیاز به چک کردن یوزر نیست چون Middleware انجام میده (یا لاگین چک کرده)
  // ولی اگه بخوای میتونی user رو بگیری.

  return (
    <div className="flex w-full h-[100dvh] bg-dark-900 text-text-light font-sans overflow-hidden">
      {/* سایدبار با لینک‌های گارسون */}
      <AdminSidebar
        links={WAITER_LINKS}
        user={{ email: "Waiter" }}
        isWaiter={true}
      />

      <main className="flex-1 flex flex-col h-full relative min-w-0">
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-8 pb-24 md:pb-8">
          {children}
        </div>
      </main>

      {/* نوبار موبایل با لینک‌های گارسون */}
      <AdminMobileNav links={WAITER_LINKS} />
    </div>
  );
}
