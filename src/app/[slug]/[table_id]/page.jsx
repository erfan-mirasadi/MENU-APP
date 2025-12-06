import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import MenuInterface from "@/components/menu/MenuInterface"; // حواست باشه این مسیر درست باشه

// --- Server Data Fetching ---
async function getMenuData(slug) {
  // 1. پیدا کردن رستوران
  const { data: restaurant, error: rError } = await supabase
    .from("restaurants")
    .select("*")
    .eq("slug", slug)
    .single();

  if (rError || !restaurant) {
    console.error("Restaurant Error:", rError);
    return null;
  }

  // 2. گرفتن دسته‌بندی‌ها و محصولاتشون
  const { data: categories, error: cError } = await supabase
    .from("categories")
    .select(
      `
      *,
      products (
        *
      )
    `
    )
    .eq("restaurant_id", restaurant.id)
    .order("sort_order", { ascending: true });

  if (cError) {
    console.error("Categories Error:", cError);
  }

  return { restaurant, categories };
}

// --- Main Page Component ---
export default async function MenuPage({ params }) {
  // گرفتن پارامترها (تو نسخه‌های جدید نکست باید await بشه)
  const { slug, table_id } = await params;

  // فچ کردن دیتا
  const data = await getMenuData(slug);

  // اگه رستوران نبود، 404 بده
  if (!data) return notFound();

  // پاس دادن دیتا به کلاینت (MenuInterface)
  return (
    <MenuInterface
      restaurant={data.restaurant}
      categories={data.categories}
      tableId={table_id}
    />
  );
}
