import { supabase } from "@/lib/supabase";
import { getCategories } from "@/services/categoryService";
import { getProducts } from "@/services/productService";
import ProductsView from "@/app/admin/_components/ui/ProductsView";

const TEST_USER_ID = "795d61c8-a279-4716-830c-b5919180a75f";

export default async function DashboardPage() {
  // 1. Get Restaurant & Languages
  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("id, name, supported_languages") // <--- supported_languages رو حتما بگیر
    .eq("owner_id", TEST_USER_ID)
    .single();

  if (!restaurant) return <div className="text-white p-10">Loading...</div>;

  // 2. Parallel Fetching
  const [categories, products] = await Promise.all([
    getCategories(restaurant.id),
    getProducts(restaurant.id),
  ]);

  return (
    <div className="flex flex-col h-full bg-dark-900 text-white overflow-hidden">
      {/* Header */}
      <div className="pt-8 px-4 sm:px-8 flex justify-between items-center bg-dark-900 z-10 pb-2">
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

      {/* Main View */}
      <ProductsView
        categories={categories}
        products={products}
        restaurantId={restaurant.id}
        supportedLanguages={restaurant.supported_languages} // <--- Pass it down
      />
    </div>
  );
}
