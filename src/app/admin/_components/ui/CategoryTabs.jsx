"use client";

export default function CategoryTabs({ categories }) {
  return (
    <div className="w-full border-b bg-white">
      <div className="flex overflow-x-auto py-4 px-6 gap-4 no-scrollbar">
        {/* دکمه "همه" */}
        <button className="whitespace-nowrap px-4 py-2 rounded-full bg-black text-white text-sm font-medium">
          همه محصولات
        </button>

        {/* لیست دسته‌بندی‌ها */}
        {categories.map((cat) => (
          <button
            key={cat.id}
            className="whitespace-nowrap px-4 py-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 text-sm font-medium transition-colors"
          >
            {/* هندل کردن تایتل چند زبانه */}
            {cat.title?.en || cat.title?.tr || "بدون نام"}
          </button>
        ))}
      </div>
    </div>
  );
}
