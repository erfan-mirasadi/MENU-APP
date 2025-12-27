import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white p-4 font-sans">
      {/* 1. اسم جدید اپلیکیشن */}
      <h1 className="text-4xl md:text-6xl font-black mb-2 text-transparent bg-clip-text bg-gradient-to-r from-[#ea7c69] to-orange-400">
        KOLAY MENU
      </h1>
      <p className="text-gray-400 mb-12 text-lg">Next Gen QR Menu System</p>

      {/* کانتینر دکمه‌ها (کنار هم در دسکتاپ، زیر هم در موبایل) */}
      <div className="flex flex-col sm:flex-row gap-6 w-full sm:w-auto items-center justify-center">
        {/* دکمه دمو (مشتری) */}
        <Link
          href="/liman-coast/T-01"
          className="w-full sm:w-auto justify-center group relative bg-[#ea7c69] hover:bg-[#ff8f7d] text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 shadow-[0_10px_40px_-10px_rgba(234,124,105,0.5)] hover:shadow-[0_20px_60px_-15px_rgba(234,124,105,0.6)] hover:-translate-y-1 active:scale-95 flex items-center gap-3"
        >
          <span>🚀</span>
          <span>ورود به دمو (Client)</span>
        </Link>

        {/* 2. دکمه پنل مدیریت (ادمین) */}
        <Link
          href="/admin/dashboard"
          className="w-full sm:w-auto justify-center group relative bg-[#252836] hover:bg-[#2f3345] border border-white/10 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 shadow-lg hover:shadow-primary/10 hover:-translate-y-1 active:scale-95 flex items-center gap-3"
        >
          <span>⚡</span>
          <span>پنل مدیریت (Admin)</span>
        </Link>
      </div>

      {/* راهنمای دولوپر */}
      <div className="mt-16 flex flex-col gap-2 items-center text-xs text-gray-600 font-mono">
        <div className="bg-[#252836] px-4 py-2 rounded-lg border border-white/5">
          Client Route: /liman-coast/T-01
        </div>
        <div className="bg-[#252836] px-4 py-2 rounded-lg border border-white/5">
          Admin Route: /admin/dashboard
        </div>
      </div>
    </div>
  );
}
