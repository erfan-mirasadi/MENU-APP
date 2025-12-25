import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { getRestaurantByOwnerId } from "@/services/restaurantService";
import AdminLayoutClient from "./AdminLayoutClient";

export default async function AdminLayout({ children }) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let restaurant = null;
  if (user) {
    restaurant = await getRestaurantByOwnerId(user.id);
  }

  return (
    <AdminLayoutClient user={user} restaurant={restaurant}>
      {children}
    </AdminLayoutClient>
  );
}
