import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { getCategories } from "@/services/categoryService";
import { getProducts } from "@/services/productService";
import ProductsView from "@/app/admin/_components/ui/ProductsView";
import { redirect } from "next/navigation";

// Ensure page is always fresh (no cache)
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  // If no user found (Middleware should catch this, but just in case)
  if (authError || !user) {
    redirect("/admin/login");
  }
  const { data: restaurant, error: restaurantError } = await supabase
    .from("restaurants")
    .select("id, name, supported_languages")
    .eq("owner_id", user.id)
    .single();

  // Handle case where user logged in but has no restaurant created yet
  if (restaurantError || !restaurant) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-white">
        <h2 className="text-xl font-bold">No Restaurant Found</h2>
        <p className="text-gray-400">
          Please contact support or create a restaurant.
        </p>
        <div className="mt-4 text-xs text-gray-600">User ID: {user.id}</div>
      </div>
    );
  }

  const [categories, products] = await Promise.all([
    getCategories(restaurant.id),
    getProducts(restaurant.id),
  ]);

  return (
    <div className="flex flex-col h-full bg-dark-900 text-white overflow-hidden">
      {/* Header */}
      <div className="pt-4 px-4 sm:px-4 flex justify-between items-center bg-dark-900 z-10 pb-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">
            Menu Management
          </h1>
          <p className="text-text-dim text-sm mt-1">{restaurant.name}</p>
        </div>

        <button className="hidden sm:flex items-center gap-2 border border-gray-600 rounded-lg px-4 py-2 text-sm text-text-light hover:bg-dark-800 transition">
          Manage Categories
        </button>
      </div>

      <ProductsView
        categories={categories}
        products={products}
        restaurantId={restaurant.id}
        supportedLanguages={restaurant.supported_languages}
      />
    </div>
  );
}
