import { notFound } from "next/navigation";
import ClientWrapper from "./ClientWrapper.jsx"; // مطمئن شو مسیر درسته
import { supabase } from "@/lib/supabase.js";

// این فانکشن رو کش (Cache) نمیکنیم تا تغییرات دیتابیس رو سریع ببینی
export const dynamic = "force-dynamic";

async function getMenuData(slug, tableId) {
  // 1. Fetch Restaurant
  const { data: restaurant, error: rError } = await supabase
    .from("restaurants")
    .select("*") // این * باعث میشه template_style هم گرفته بشه
    .eq("slug", slug)
    .single();

  if (rError || !restaurant) {
    console.error("❌ Restaurant Error:", rError);
    return { error: "Restaurant not found" };
  }

  // 2. Fetch Categories & Products
  const { data: categories, error: cError } = await supabase
    .from("categories")
    .select(`*, products(*)`)
    .eq("restaurant_id", restaurant.id)
    .order("sort_order", { ascending: true });

  if (cError) console.error("❌ Categories Error:", cError);

  // 3. Fetch Featured Products (Suggestions)
  const { data: featuredProducts, error: fError } = await supabase
    .from("products")
    .select("*")
    .eq("restaurant_id", restaurant.id)
    .limit(5); // فعلا ۵ تا اول رو میگیریم

  return {
    restaurant,
    categories: categories || [],
    featuredProducts: featuredProducts || [],
  };
}

export default async function Page({ params }) {
  // Next.js 15: params باید await بشه
  const resolvedParams = await params;
  const { slug, table_id } = resolvedParams;

  const decodedSlug = decodeURIComponent(slug);
  const decodedTableId = decodeURIComponent(table_id);

  console.log(`🚀 Loading Menu: ${decodedSlug} (Table: ${decodedTableId})`);

  const data = await getMenuData(decodedSlug, decodedTableId);

  if (data.error) {
    return notFound();
  }

  return (
    <ClientWrapper
      restaurant={data.restaurant}
      categories={data.categories}
      tableId={decodedTableId}
      featuredProducts={data.featuredProducts}
    />
  );
}
