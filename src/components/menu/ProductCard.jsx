"use client";

export default function ProductCard({ product, onClick }) {
  const getTitle = (obj) => {
    if (!obj) return "";
    return typeof obj === "object" ? obj["tr"] || obj["en"] : obj;
  };

  return (
    <div
      onClick={onClick}
      className="group relative mt-16 bg-[#252836] rounded-[24px] p-4 pt-16 cursor-pointer hover:bg-[#2d303e] transition-all duration-300 border border-white/5 hover:border-[#ea7c69]/30 hover:shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)]"
    >
      {/* --- NEW 3D / AR BUTTON (Attention Grabber) --- */}
      {/* این دکمه فقط وقتی میاد که محصول مدل سه بعدی داشته باشه */}
      {product.model_url && (
        <div className="absolute -top-6 right-2 z-20 flex flex-col items-center gap-1 animate-bounce duration-[2000ms]">
          <button
            className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white p-2.5 rounded-2xl shadow-[0_0_20px_rgba(168,85,247,0.6)] border border-white/20 flex items-center gap-2 transition-transform hover:scale-110 active:scale-95 group-hover:shadow-[0_0_30px_rgba(168,85,247,0.8)]"
            onClick={(e) => {
              e.stopPropagation(); // جلوگیری از باز شدن مودال معمولی (اگه میخوای مستقیم بره تو مود AR)
              onClick(); // فعلا همون مودال رو باز میکنه که توش مدل ویوور هست
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-5 h-5"
            >
              <path d="M12.338 21.994c.21.084.444.084.654 0l7.556-3.136c.64-.266.903-1.026.565-1.63L13.88 5.617a.915.915 0 0 0-1.42 0L5.238 17.228c-.338.604-.075 1.364.565 1.63l7.556 3.136Z" />
              <path d="M5.523 17.065 12.66 14.2l7.137 2.864" />
              <path d="M12.66 14.2V2.868" />
            </svg>
            <span className="text-[10px] font-black uppercase tracking-wider hidden sm:block">
              View 3D
            </span>
          </button>
          {/* یه فلش کوچولو که اشاره میکنه */}
          <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-purple-500 opacity-80"></div>
        </div>
      )}

      {/* --- IMAGE SECTION (Floating Circle) --- */}
      <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-28 h-28 rounded-full border-[4px] border-[#1F1D2B] bg-[#1a1c25] shadow-2xl overflow-hidden group-hover:scale-110 transition-transform duration-500 ease-out z-10">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={getTitle(product.title)}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-4xl">🍔</span>
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
          {/* Availability Status */}
          <div className="flex items-center justify-center gap-2 mb-2 opacity-60">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                product.original_price ? "bg-red-500" : "bg-green-500"
              }`}
            ></span>
            <span className="text-[10px] uppercase tracking-widest text-gray-300">
              {product.original_price ? "On Sale" : "Ready"}
            </span>
          </div>

          <div className="flex items-center justify-between bg-[#1F1D2B] rounded-xl p-1.5 border border-white/5 group-hover:border-white/10 transition-colors">
            <div className="pl-2 flex flex-col items-start leading-none">
              {product.original_price && (
                <span className="text-[10px] text-gray-500 line-through decoration-red-500">
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

            {/* Add Button */}
            <button className="bg-[#ea7c69] hover:bg-[#ff8f7d] text-white w-9 h-9 rounded-lg flex items-center justify-center shadow-lg shadow-orange-900/30 active:scale-90 transition-all">
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
