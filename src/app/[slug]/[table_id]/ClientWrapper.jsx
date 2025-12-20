"use client";

import ClassicLayout from "@/components/templates/classic/ClassicLayout";
import ModernLayout from "@/components/templates/modern/ModernLayout";

export default function ClientWrapper({
  restaurant,
  categories,
  tableId,
  featuredProducts,
}) {
  const style = restaurant.template_style || "modern";

  console.log("🎨 Current Template Style:", style);

  if (style === "modern") {
    return (
      <ModernLayout
        restaurant={restaurant}
        categories={categories}
        tableId={tableId}
        featuredProducts={featuredProducts}
      />
    );
  }
  if (style === "classic") {
    return (
      <ClassicLayout
        restaurant={restaurant}
        categories={categories}
        tableId={tableId}
        featuredProducts={featuredProducts}
      />
    );
  }

  return (
    <div className="flex h-screen items-center justify-center bg-black text-white">
      <p>⚠️ Template not found!</p>
    </div>
  );
}
