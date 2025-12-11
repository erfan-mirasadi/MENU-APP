"use client";

export default function ProductCard({ product, onClick }) {
  const getTitle = (obj) => {
    if (!obj) return "";
    return typeof obj === "object" ? obj["tr"] || obj["en"] : obj;
  };

  return (
    <div
      onClick={onClick}
      className="group relative mt-16 bg-[#252836] rounded-[24px] p-4 pt-16 cursor-pointer border border-white/5 transition-all duration-300 hover:border-[#ea7c69]/50 hover:bg-[#2d303e] hover:shadow-[0_10px_40px_-15px_rgba(234,124,105,0.2)]"
    >
      {/* --- 3D INDICATOR (Minimal & Sleek) --- */}
      {/* استایل جدید: شیشه‌ای، مینیمال، بدون پرش */}
      {product.model_url && (
        <div className="absolute top-3 right-3 z-20">
          <button
            className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-full shadow-lg transition-all group-hover:bg-[#ea7c69] group-hover:border-[#ea7c69] group-hover:text-white"
            onClick={(e) => {
              // این دکمه همون کار کلیک روی کارت رو میکنه (باز کردن مودال)
              onClick();
            }}
          >
            <div className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ea7c69] opacity-75 group-hover:bg-white"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#ea7c69] group-hover:bg-white"></span>
            </div>
            <span className="text-[10px] font-bold text-gray-300 tracking-wider group-hover:text-white uppercase">
              3D View
            </span>
          </button>
        </div>
      )}

      {/* --- IMAGE SECTION --- */}
      <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-28 h-28 rounded-full border-[4px] border-[#1F1D2B] bg-[#1a1c25] shadow-2xl overflow-hidden group-hover:scale-105 transition-transform duration-500 ease-out z-10">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={getTitle(product.title)}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-4xl grayscale opacity-50">☕</span>
          </div>
        )}
      </div>

      {/* --- CONTENT --- */}
      <div className="text-center flex flex-col h-full items-center pt-2">
        {/* Title */}
        <h3 className="text-white font-bold text-lg leading-tight line-clamp-1 w-full mb-1 group-hover:text-[#ea7c69] transition-colors">
          {getTitle(product.title)}
        </h3>

        {/* Description */}
        <p className="text-gray-400 text-xs line-clamp-2 mb-4 leading-relaxed font-light px-2 opacity-80">
          {getTitle(product.description)}
        </p>

        {/* Footer: Price & Add Button */}
        <div className="mt-auto w-full">
          {/* Status Badge */}
          <div className="flex items-center justify-center gap-2 mb-2 opacity-60">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                product.original_price ? "bg-red-500" : "bg-green-500"
              }`}
            ></span>
            <span className="text-[10px] uppercase tracking-widest text-gray-300">
              {product.original_price ? "Promo" : "Ready"}
            </span>
          </div>

          {/* Price Bar */}
          <div className="flex items-center justify-between bg-[#1F1D2B] rounded-xl p-1.5 border border-white/5 group-hover:border-white/10 transition-colors">
            <div className="pl-2 flex flex-col items-start leading-none">
              {product.original_price && (
                <span className="text-[10px] text-gray-500 line-through decoration-red-500/70">
                  {Number(product.original_price).toLocaleString()}
                </span>
              )}
              <div className="flex items-baseline gap-0.5">
                <span className="font-black text-white text-sm">
                  {Number(product.price).toLocaleString()}
                </span>
                <span className="text-[10px] text-[#ea7c69]">₺</span>
              </div>
            </div>

            {/* Add Button (Stops propagation to avoid opening modal) */}
            <button
              className="bg-[#ea7c69] hover:bg-[#ff8f7d] text-white w-9 h-9 rounded-lg flex items-center justify-center shadow-lg shadow-orange-900/30 active:scale-90 transition-all"
              onClick={(e) => {
                e.stopPropagation(); // این مهمه! نمیذاره کارت باز بشه، فقط ادد میکنه
                console.log("Add to cart clicked");
                // اینجا لاجیک سبد خرید رو بعدا اضافه کن
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-5 h-5"
              >
                <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
