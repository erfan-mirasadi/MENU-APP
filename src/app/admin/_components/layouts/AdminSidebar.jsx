"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_LINKS } from "./navLinks";
import { RiLogoutBoxRLine, RiStore2Line } from "react-icons/ri";

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex w-28 h-full bg-dark-900 flex-col items-center py-6 z-50 border-r border-dark-800">
      <div className="mb-10">
        <div className="w-12 h-12 bg-accent/20 rounded-xl flex items-center justify-center text-accent shadow-lg shadow-accent/10">
          <RiStore2Line size={24} />
        </div>
      </div>

      {/* 2. Navigation Items */}
      <nav className="flex-1 flex flex-col gap-6 w-full px-4 items-center">
        {NAV_LINKS.map((link) => {
          const isActive = pathname === link.path;
          const Icon = link.icon;

          return (
            <Link
              key={link.path}
              href={link.path}
              className={`
                group relative flex items-center justify-center w-14 h-14 rounded-xl transition-all duration-300
                ${
                  isActive
                    ? "bg-accent text-white shadow-lg shadow-accent/40 translate-x-2" // استایل اکتیو (طبق عکس)
                    : "text-accent hover:bg-dark-800 hover:text-white" // استایل عادی
                }
              `}
            >
              <Icon
                size={22}
                className={`transition-transform duration-300 ${
                  isActive ? "scale-110" : "group-hover:scale-110"
                }`}
              />

              {/* Tooltip (Optional: وقتی موس میره روش اسمش بیاد بغل) */}
              <span className="absolute left-16 bg-dark-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                {link.name}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* 3. Logout Button (Bottom) */}
      <button className="mt-auto mb-4 text-accent hover:text-white hover:bg-red-500/20 w-12 h-12 rounded-xl flex items-center justify-center transition-colors">
        <RiLogoutBoxRLine size={24} />
      </button>
    </aside>
  );
}
