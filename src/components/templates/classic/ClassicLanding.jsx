"use client";
import Image from "next/image";

export default function ClassicLanding({ restaurant, tableId, onEnter }) {
  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center p-8 bg-[#FDFBF7]">
      {/* Decorative Border */}
      <div className="absolute inset-4 border border-[#D4AF37]/30 rounded-none pointer-events-none"></div>
      <div className="absolute inset-5 border border-[#D4AF37]/10 rounded-none pointer-events-none"></div>

      {/* Logo */}
      <div className="relative w-32 h-32 mb-8 shadow-2xl rounded-full overflow-hidden border-4 border-[#D4AF37]">
        {restaurant.logo ? (
          <Image
            src={restaurant.logo}
            alt={restaurant.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full bg-[#2C1810] flex items-center justify-center text-4xl text-[#D4AF37]">
            {restaurant.name?.charAt(0)}
          </div>
        )}
      </div>

      {/* Text */}
      <h1 className="text-4xl md:text-5xl font-bold text-[#2C1810] text-center mb-4 tracking-wide">
        {restaurant.name}
      </h1>
      <p className="text-[#8A7E72] uppercase tracking-[0.3em] text-xs mb-12">
        Fine Dining Experience
      </p>

      {/* Button */}
      <button
        onClick={onEnter}
        className="group relative px-12 py-4 bg-transparent border border-[#2C1810] hover:bg-[#2C1810] hover:text-[#D4AF37] transition-all duration-500"
      >
        <span className="text-lg font-bold uppercase tracking-widest">
          View Menu
        </span>
        {/* Fancy corners */}
        <span className="absolute -top-1 -left-1 w-2 h-2 border-t border-l border-[#D4AF37] opacity-0 group-hover:opacity-100 transition-opacity"></span>
        <span className="absolute -bottom-1 -right-1 w-2 h-2 border-b border-r border-[#D4AF37] opacity-0 group-hover:opacity-100 transition-opacity"></span>
      </button>

      {/* Table Info */}
      <div className="absolute bottom-10 text-[#8A7E72] text-xs font-sans">
        Table No. {tableId}
      </div>
    </div>
  );
}
