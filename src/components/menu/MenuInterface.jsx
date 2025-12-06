"use client";
import { useState } from "react";
import ProductCard from "./ProductCard";

export default function MenuInterface({ restaurant, categories, tableId }) {
  const [activeCategory, setActiveCategory] = useState(categories?.[0]?.id);

  const getTrans = (obj) => {
    if (!obj) return "";
    return typeof obj === "object" ? obj["tr"] || obj["en"] : obj;
  };

  return (
    <div className="min-h-screen bg-[#1F1D2B] font-sans pb-24 text-gray-100">
      {/* --- HEADER (Jaegar Style) --- */}
      <div className="p-6 sticky top-0 z-20 bg-[#1F1D2B]/95 backdrop-blur-md border-b border-white/5">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-wide">
              {restaurant.name}
            </h1>
            <p className="text-gray-400 text-xs mt-1">Tuesday, 2 Feb 2025</p>
          </div>

          {/* باکس شماره میز */}
          <div className="bg-[#252836] px-4 py-2 rounded-lg border border-white/5 shadow-sm">
            <span className="text-[#ea7c69] font-bold text-sm block text-center">
              Masa
            </span>
            <span className="text-white font-mono text-lg block text-center">
              {tableId}
            </span>
          </div>
        </div>

        {/* --- CATEGORY TABS (Scrollable) --- */}
        <div className="flex gap-4 mt-6 overflow-x-auto no-scrollbar pb-2">
          {categories?.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`whitespace-nowrap pb-2 text-sm font-medium transition-colors relative
                ${
                  activeCategory === cat.id
                    ? "text-[#ea7c69]"
                    : "text-gray-400 hover:text-gray-200"
                }
              `}
            >
              {getTrans(cat.title)}
              {/* خط زیرِ تب فعال */}
              {activeCategory === cat.id && (
                <div className="absolute bottom-0 left-0 w-1/2 h-0.5 bg-[#ea7c69] rounded-full"></div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* --- MAIN CONTENT (Grid) --- */}
      <div className="p-4">
        {categories?.map((cat) => (
          <div
            key={cat.id}
            className={activeCategory === cat.id ? "block" : "hidden"}
          >
            {/* هدر دسته‌بندی */}
            <div className="flex items-center justify-between mb-2 mt-2">
              <h2 className="text-white text-lg font-bold">Choose Dishes</h2>
              <span className="text-xs text-gray-500 border border-white/10 px-2 py-1 rounded bg-[#252836]">
                Dine In
              </span>
            </div>

            {/* گرید کارت‌ها */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-2">
              {cat.products?.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onClick={() => console.log("Open Modal", product)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* --- CART BAR (Mobile Sticky Bottom) --- */}
      {/* این همون چیزیه که گفتی میخوای منو پایین باشه */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#252836] border-t border-white/5 p-4 z-30">
        <button className="w-full bg-[#ea7c69] text-white font-bold py-3 rounded-xl shadow-lg shadow-orange-900/30 flex items-center justify-center gap-2 active:scale-95 transition-transform">
          <span>View Order</span>
          <span className="bg-white/20 px-2 py-0.5 rounded text-sm">
            0 Items
          </span>
        </button>
      </div>
    </div>
  );
}
