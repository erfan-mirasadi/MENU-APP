"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_LINKS } from "./navLinks";

export default function AdminMobileNav() {
  const pathname = usePathname();

  // در موبایل معمولاً همه آیتم‌ها رو نشون نمیدیم اگر زیاد باشن (یا اسکرول افقی میذاریم)
  // اینجا همشون رو جا میدیم چون آیکونن.

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 h-20 bg-dark-800 rounded-t-3xl border-t border-dark-700 z-50 flex justify-around items-center px-2 pb-2 shadow-2xl">
      {NAV_LINKS.slice(0, 5).map((link) => {
        // فقط 5 تا رو نشون میدیم که شلوغ نشه
        const isActive = pathname === link.path;
        const Icon = link.icon;

        return (
          <Link
            key={link.path}
            href={link.path}
            className={`
              flex flex-col items-center justify-center w-12 h-12 rounded-full transition-all
              ${
                isActive
                  ? "bg-accent text-white -translate-y-4 border-4 border-dark-900 shadow-lg shadow-accent/30" // افکت دکمه شناور برای اکتیو
                  : "text-text-dim hover:text-white"
              }
            `}
          >
            <Icon size={20} />
          </Link>
        );
      })}
    </div>
  );
}
