"use client";
import Image from "next/image";

export default function MinimalLanding({ restaurant, tableId, onEnter }) {
  return (
    <div className="w-full h-full bg-white flex flex-col justify-between p-6 md:p-12 relative overflow-hidden">
      {/* Background Image (Grayscale & High Contrast) */}
      {restaurant.bg_image && (
        <div className="absolute inset-0 z-0 opacity-20 grayscale contrast-125 pointer-events-none">
          <Image
            src={restaurant.bg_image}
            alt="bg"
            fill
            className="object-cover"
          />
        </div>
      )}

      {/* Top: Info */}
      <div className="relative z-10 flex justify-between items-start border-b-2 border-black pb-6">
        <div>
          <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-[0.8]">
            {restaurant.name}
          </h1>
          <p className="mt-2 text-sm font-mono uppercase tracking-widest text-gray-500">
            Est. 2024
          </p>
        </div>
        <div className="hidden md:block w-24 h-24 bg-black text-white flex items-center justify-center font-bold text-4xl">
          {restaurant.name?.charAt(0)}
        </div>
      </div>

      {/* Center: Table Number */}
      <div className="relative z-10 my-auto">
        <div className="flex items-baseline gap-2">
          <span className="text-xl font-bold uppercase">Table</span>
          <span className="text-9xl font-black">{tableId}</span>
        </div>
      </div>

      {/* Bottom: Action */}
      <div className="relative z-10">
        <button
          onClick={onEnter}
          className="w-full bg-black text-white h-20 text-2xl font-bold uppercase hover:bg-white hover:text-black border-2 border-black transition-colors duration-300 flex items-center justify-between px-8 group"
        >
          <span>Explore Menu</span>
          <span className="group-hover:translate-x-4 transition-transform duration-300">
            →
          </span>
        </button>
      </div>
    </div>
  );
}
