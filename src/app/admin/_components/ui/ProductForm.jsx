"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  RiTranslate2,
  RiMoneyDollarCircleLine,
  RiImageLine,
  RiVideoLine,
  RiSmartphoneLine,
  RiBox3Line,
  RiSave3Line,
  RiPriceTag3Line,
  RiPercentLine,
  RiErrorWarningLine,
} from "react-icons/ri";
import toast from "react-hot-toast";

export default function ProductForm({
  onClose,
  categories,
  restaurantId,
  supportedLanguages,
  defaultLang,
}) {
  const [activeLang, setActiveLang] = useState(defaultLang);
  const [loading, setLoading] = useState(false);

  // لاجیک نمایش فیلد تخفیف
  const [hasDiscount, setHasDiscount] = useState(false);

  // State اولیه فرم
  const [formData, setFormData] = useState({
    category_id: "",
    title: {},
    description: {},
    price: "",
    original_price: "",
    is_available: true,
    image_url: "",
    model_url: "",
    animation_url_android: "",
    animation_url_ios: "",
  });

  const handleLangChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: { ...prev[field], [activeLang]: value },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. Validation: Category Selection
    if (!formData.category_id) return toast.error("Please select a category");

    // 2. Validation: Price Existence
    if (!formData.price) return toast.error("Please enter the final price");

    // 3. Validation: Discount Logic (Price vs Original Price)
    const finalPrice = parseFloat(formData.price);
    if (hasDiscount) {
      const originalPrice = parseFloat(formData.original_price);

      if (!formData.original_price) {
        return toast.error("Please enter the original price for the discount");
      }

      if (originalPrice <= finalPrice) {
        return toast.error(
          "Original price must be HIGHER than the final price!",
          {
            icon: "📉",
            style: {
              background: "#333",
              color: "#fff",
            },
          }
        );
      }
    }

    // 4. Validation: Check ALL Supported Languages for Title
    // loop through all supported languages to find missing titles
    for (const lang of supportedLanguages) {
      if (!formData.title[lang] || formData.title[lang].trim() === "") {
        setActiveLang(lang); // Switch tab to the missing language automatically
        return toast.error(`Please enter the title for ${lang.toUpperCase()}`, {
          icon: <RiTranslate2 className="text-yellow-500" />,
        });
      }
    }

    setLoading(true);

    const savePromise = new Promise(async (resolve, reject) => {
      const payload = {
        restaurant_id: restaurantId,
        category_id: formData.category_id,
        title: formData.title,
        description: formData.description,
        price: finalPrice,
        // اگر تخفیف نداشته باشه نال میشه
        original_price: hasDiscount
          ? parseFloat(formData.original_price)
          : null,
        is_available: formData.is_available,
        image_url: formData.image_url || null,
        model_url: formData.model_url || null,
        animation_url_android: formData.animation_url_android || null,
        animation_url_ios: formData.animation_url_ios || null,
      };

      const { error } = await supabase.from("products").insert([payload]);

      if (error) reject(error);
      else resolve();
    });

    toast
      .promise(savePromise, {
        loading: "Adding product to menu...",
        success: "Product created successfully!",
        error: "Failed to create product.",
      })
      .then(() => {
        setLoading(false);
        onClose();
        window.location.reload();
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Category Selector */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-400">
          Category <span className="text-red-500">*</span>
        </label>
        <select
          required
          value={formData.category_id}
          onChange={(e) =>
            setFormData({ ...formData, category_id: e.target.value })
          }
          className="w-full bg-dark-800 border border-gray-700 rounded-xl p-3 text-white focus:border-primary focus:outline-none appearance-none cursor-pointer hover:border-gray-500 transition-colors"
        >
          <option value="" disabled>
            Select a category...
          </option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.title?.en || cat.title?.tr || "Unnamed Category"}
            </option>
          ))}
        </select>
      </div>

      <hr className="border-gray-800" />

      {/* Language Switcher (Improved Visibility) */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-400 flex items-center gap-2">
          <RiTranslate2 /> Language Support (Fill all)
        </label>
        <div className="bg-dark-800 p-1.5 rounded-xl flex gap-2 border border-gray-700 overflow-x-auto no-scrollbar">
          {supportedLanguages.map((lang) => {
            const isFilled =
              formData.title[lang] && formData.title[lang].length > 0;
            return (
              <button
                key={lang}
                type="button"
                onClick={() => setActiveLang(lang)}
                className={`flex-1 min-w-[70px] py-2.5 text-sm font-bold rounded-lg transition-all relative ${
                  activeLang === lang
                    ? "bg-primary text-white shadow-lg border-2 border-white scale-[1.02]" // Active State
                    : "text-gray-400 hover:text-white hover:bg-gray-700 border-2 border-transparent" // Inactive
                }`}
              >
                {lang.toUpperCase()}
                {/* Green dot if filled */}
                {isFilled && (
                  <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-green-400 rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Title & Desc */}
      <div
        className="space-y-4 animate-in fade-in duration-300"
        key={activeLang}
      >
        <div className="flex justify-between items-center">
          <h3 className="text-white font-semibold flex items-center gap-2">
            Details for{" "}
            <span className="text-primary">{activeLang.toUpperCase()}</span>
          </h3>
        </div>

        <div>
          <label className="block text-xs text-gray-500 mb-1 ml-1">
            Product Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            // We don't put 'required' here on the input itself, because we validate manually in handleSubmit
            value={formData.title[activeLang] || ""}
            onChange={(e) => handleLangChange("title", e.target.value)}
            placeholder={`e.g. Delicious Burger`}
            className="w-full bg-dark-800 border border-gray-700 rounded-xl p-3 text-white focus:border-primary focus:outline-none transition-colors"
          />
        </div>

        <div>
          <label className="block text-xs text-gray-500 mb-1 ml-1">
            Description
          </label>
          <textarea
            rows={3}
            value={formData.description[activeLang] || ""}
            onChange={(e) => handleLangChange("description", e.target.value)}
            placeholder={`Ingredients, allergies...`}
            className="w-full bg-dark-800 border border-gray-700 rounded-xl p-3 text-white focus:border-primary focus:outline-none transition-colors"
          />
        </div>
      </div>

      <hr className="border-gray-800" />

      {/* Pricing Logic */}
      <div className="space-y-4">
        <h3 className="text-white font-semibold flex items-center gap-2">
          <RiMoneyDollarCircleLine className="text-primary" /> Pricing
        </h3>

        <div className="grid grid-cols-1 gap-4">
          {/* Main Price */}
          <div>
            <label className="block text-xs text-gray-500 mb-1 ml-1">
              Final Price (Customer pays this){" "}
              <span className="text-red-500">*</span>
            </label>
            <div className="relative group">
              <span className="absolute left-3 top-3 text-gray-500 group-focus-within:text-primary transition-colors">
                ₺
              </span>
              <input
                type="number"
                step="0.01"
                required
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
                className="w-full bg-dark-800 border border-gray-700 rounded-xl p-3 pl-8 text-white focus:border-primary focus:outline-none font-bold text-lg transition-colors"
              />
            </div>
          </div>

          {/* Discount Toggle */}
          <div className="flex items-center justify-between bg-dark-800/50 p-3 rounded-xl border border-gray-700 hover:border-gray-600 transition-colors">
            <div className="flex items-center gap-2 text-sm text-gray-300">
              <RiPercentLine
                className={`text-xl ${
                  hasDiscount ? "text-primary" : "text-gray-500"
                }`}
              />
              <span>Apply Discount?</span>
            </div>
            <button
              type="button"
              onClick={() => setHasDiscount(!hasDiscount)}
              className={`relative w-12 h-6 rounded-full transition-all duration-300 ${
                hasDiscount ? "bg-primary" : "bg-gray-600"
              }`}
            >
              <span
                className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform duration-300 ${
                  hasDiscount ? "translate-x-6" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Original Price (Conditional with Validation Logic) */}
          {hasDiscount && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-300 p-4 bg-primary/5 rounded-xl border border-primary/20">
              <label className="block text-xs text-primary mb-1 ml-1 font-bold">
                Original Price (Before Discount)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-primary/50 line-through">
                  ₺
                </span>
                <input
                  type="number"
                  step="0.01"
                  value={formData.original_price}
                  onChange={(e) =>
                    setFormData({ ...formData, original_price: e.target.value })
                  }
                  className="w-full bg-dark-900 border border-primary/30 rounded-xl p-3 pl-8 text-white focus:border-primary focus:outline-none"
                  placeholder="e.g. 150"
                />
              </div>
              <div className="flex gap-2 mt-2 items-start">
                <RiErrorWarningLine className="text-primary mt-0.5 text-xs shrink-0" />
                <p className="text-[10px] text-gray-400">
                  Must be higher than the final price.{" "}
                  {formData.price &&
                  formData.original_price &&
                  parseFloat(formData.original_price) >
                    parseFloat(formData.price) ? (
                    <span className="text-green-400 font-bold">
                      Valid Discount!
                    </span>
                  ) : (
                    ""
                  )}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Available Toggle */}
      <div
        className="flex items-center gap-3 bg-dark-800 p-3 rounded-xl border border-gray-700 cursor-pointer hover:bg-gray-700/50 transition select-none"
        onClick={() =>
          setFormData((p) => ({ ...p, is_available: !p.is_available }))
        }
      >
        <div
          className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
            formData.is_available
              ? "bg-green-500 border-green-500"
              : "border-gray-500"
          }`}
        >
          {formData.is_available && (
            <div className="w-2 h-2 bg-white rounded-full" />
          )}
        </div>
        <span className="text-sm text-gray-300">Available in Menu</span>
      </div>

      <hr className="border-gray-800" />

      {/* Media Inputs */}
      <div className="space-y-4">
        <h3 className="text-white font-semibold flex items-center gap-2">
          <RiImageLine className="text-primary" /> Media Links
        </h3>

        <div className="relative group">
          <RiImageLine className="absolute left-3 top-3.5 text-gray-500 group-focus-within:text-primary transition-colors" />
          <input
            type="text"
            placeholder="Image URL..."
            value={formData.image_url}
            onChange={(e) =>
              setFormData({ ...formData, image_url: e.target.value })
            }
            className="w-full bg-dark-800 border border-gray-700 rounded-xl p-3 pl-10 text-white focus:border-primary focus:outline-none text-sm transition-colors"
          />
        </div>
        {/* You can add video/model inputs here similarly if needed */}
      </div>

      {/* Action Buttons */}
      <div className="pt-4 flex gap-4 pb-10">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 py-3 rounded-xl border border-gray-700 text-gray-300 hover:bg-gray-800 transition font-medium active:scale-95"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 py-3 rounded-xl bg-primary text-white hover:bg-orange-600 transition font-bold shadow-lg shadow-primary/25 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
        >
          {loading ? (
            "Saving..."
          ) : (
            <>
              <RiSave3Line size={20} /> Create Product
            </>
          )}
        </button>
      </div>
    </form>
  );
}
