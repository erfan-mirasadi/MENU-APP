"use client";
import { useState, useMemo } from "react";
import CategoryTabs from "./CategoryTabs";
import ProductCard from "./ProductCard";
import SlidePanel from "./SlidePanel";
import ProductForm from "./ProductForm";
import { RiAddLine } from "react-icons/ri";

// دریافت پراپ‌های جدید از page.jsx
export default function ProductsView({
  categories,
  products,
  restaurantId,
  supportedLanguages,
}) {
  const [activeTab, setActiveTab] = useState("all");
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  // فیلتر کردن محصولات بر اساس تب
  const filteredProducts = useMemo(() => {
    if (activeTab === "all") return products;
    return products.filter((p) => p.category_id === activeTab);
  }, [activeTab, products]);

  // پیدا کردن زبان پیش‌فرض (اولین زبان لیست)
  const defaultLang =
    supportedLanguages && supportedLanguages.length > 0
      ? supportedLanguages[0]
      : "en";

  return (
    <div className="flex flex-col h-full">
      {/* Tabs */}
      <div className="px-4 sm:px-8 mt-6">
        <CategoryTabs
          categories={categories}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
      </div>

      {/* Content Grid */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-8 pb-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 gap-y-12 pt-8">
          {/* دکمه افزودن */}
          <button
            onClick={() => setIsPanelOpen(true)}
            className="group h-full min-h-[320px] w-full rounded-2xl border-2 border-dashed border-gray-700 bg-dark-800/30 flex flex-col items-center justify-center gap-4 hover:bg-dark-800 hover:border-primary transition-all cursor-pointer"
          >
            <div className="w-14 h-14 rounded-full bg-gray-800 group-hover:bg-primary flex items-center justify-center text-primary group-hover:text-white transition-colors duration-300 shadow-lg">
              <RiAddLine size={32} />
            </div>
            <span className="text-gray-400 group-hover:text-primary font-semibold transition-colors">
              Add new dish
            </span>
          </button>

          {/* لیست محصولات */}
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>

      {/* پنل کشویی فرم */}
      <SlidePanel
        isOpen={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
        title="Add New Product"
      >
        {/* پاس دادن اطلاعات حیاتی به فرم */}
        <ProductForm
          onClose={() => setIsPanelOpen(false)}
          categories={categories}
          restaurantId={restaurantId}
          supportedLanguages={supportedLanguages || ["en"]} // فال‌بک به انگلیسی
          defaultLang={defaultLang}
        />
      </SlidePanel>
    </div>
  );
}
