import { supabase } from "@/lib/supabase";
import { getCategories } from "@/services/categoryService";
import CategoryTabs from "../_components/ui/CategoryTabs";

export default async function DashboardPage() {
  const TEST_USER_ID = "795d61c8-a279-4716-830c-b5919180a75f";

  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("id, name")
    .eq("owner_id", TEST_USER_ID)
    .single();

  if (!restaurant) {
    return (
      <div className="p-10 text-red-500">رستورانی برای این یوزر پیدا نشد!</div>
    );
  }

  const categories = await getCategories(restaurant.id);

  return (
   // این کانتینر اصلیه که کل ارتفاع صفحه رو میگیره اما خودش اسکرول نمیشه
    <div className="flex flex-col h-full bg-gray-50 overflow-hidden">
      
      {/* --- بخش هدر (ثابت) --- */}
      <div className="p-6 pb-2">
        <h1 className="text-2xl font-bold text-gray-800">مدیریت محصولات</h1>
        <p className="text-gray-500 text-sm mt-1">
          رستوران: <span className="font-semibold">{restaurant.name}</span>
        </p>
      </div>

      {/* --- بخش تب‌ها (ثابت) --- */}
      <CategoryTabs categories={categories} />

      {/* --- بخش لیست محصولات (اسکرول‌خور) --- */}
      {/* نکته: flex-1 و overflow-y-auto باعث میشه فقط این تیکه اسکرول بشه */}
      <div className="flex-1 overflow-y-auto p-6">
        
        {/* گرید محصولات */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-20">
          
          {/* کارت محصول تستی (فعلاً هاردکد برای تست گرید) */}
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <div key={item} className="bg-white p-4 rounded-xl shadow-sm border hover:shadow-md transition">
              <div className="aspect-square bg-gray-200 rounded-lg mb-4"></div>
              <h3 className="font-bold text-lg">همبرگر مخصوص {item}</h3>
              <p className="text-gray-500 text-sm mb-3">گوشت گوساله، قارچ، پنیر...</p>
              <div className="flex justify-between items-center">
                <span className="font-bold text-green-600">$12.00</span>
                <button className="text-blue-600 text-sm">ویرایش</button>
              </div>
            </div>
          ))}

        </div>
      </div>
    </div>
  );
}