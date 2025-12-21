"use client";
import Image from "next/image";
import ImmersiveSuggestions from "./ImmersiveSuggestions";

export default function ImmersiveLanding({
  restaurant,
  tableId,
  onEnter,
  featuredProducts,
}) {
  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-[#050505]">
      {/* Background Ambience for Landing */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-20%] w-[80vw] h-[80vw] bg-purple-600/20 rounded-full blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-[-20%] right-[-20%] w-[80vw] h-[80vw] bg-blue-600/20 rounded-full blur-[100px] animate-pulse delay-700"></div>
      </div>

      {/* 1. Header with Logo */}
      <div className="relative z-20 shrink-0 pt-8 px-6 pb-2 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative w-14 h-14 rounded-2xl overflow-hidden border border-white/20 shadow-lg shadow-purple-500/20 bg-black/50">
            {restaurant.logo ? (
              <Image
                src={restaurant.logo}
                alt=""
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-2xl">
                ☕
              </div>
            )}
          </div>
          <div>
            <h1 className="text-xl font-bold text-white leading-none mb-1">
              {restaurant.name}
            </h1>
            <div className="bg-white/10 px-2 py-0.5 rounded text-[10px] text-white/70 uppercase tracking-widest inline-block">
              Table {tableId}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Scrollable Suggestions (Fixed Black Screen Issue) */}
      <div className="relative z-10 flex-1 min-h-0">
        <ImmersiveSuggestions products={featuredProducts} />
      </div>

      {/* 3. Bottom Fixed Button Area */}
      <div className="relative z-20 shrink-0 p-6 pt-4 bg-gradient-to-t from-black via-black to-transparent">
        <button
          onClick={onEnter}
          className="w-full py-4 rounded-2xl bg-white text-black font-black text-lg shadow-[0_0_20px_rgba(255,255,255,0.3)] active:scale-95 transition-all flex items-center justify-center gap-2 group"
        >
          <span>VIEW FULL MENU</span>
          <span className="group-hover:translate-x-1 transition-transform">
            →
          </span>
        </button>
      </div>
    </div>
  );
}
