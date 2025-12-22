// src/services/categoryService.js

import { supabase } from "@/lib/supabase";

export async function getCategories(restaurantId) {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("restaurant_id", restaurantId)
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("Error fetching categories:", error);
    return [];
  }

  return data;
}
