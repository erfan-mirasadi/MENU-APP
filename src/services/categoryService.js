// src/services/categoryService.js

import { supabase } from "@/lib/supabase";

export async function getCategories() {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching categories:", error);
    return [];
  }

  return data;
}
