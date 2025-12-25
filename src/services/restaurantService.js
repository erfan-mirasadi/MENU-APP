import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";

export async function getRestaurantBySlug(slug) {
  const { data, error } = await supabase
    .from("restaurants")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error) {
    console.error("Error fetching restaurant:", error);
    return null;
  }

  return data;
}

export async function getRestaurantByOwnerId(ownerId) {
  const { data, error } = await supabase
    .from("restaurants")
    .select("*")
    .eq("owner_id", ownerId)
    .single();

  if (error) {
    console.error("Error fetching restaurant:", error);
    return null;
  }

  return data;
}

export async function createRestaurant(restaurantData) {
  const { data, error } = await supabase
    .from("restaurants")
    .insert([restaurantData])
    .select()
    .single();

  if (error) {
    console.error("Error creating restaurant:", error);
    toast.error("Failed to create restaurant");
    throw error;
  }

  return data;
}

export async function updateRestaurant(ownerId, restaurantData) {
  const { data, error } = await supabase
    .from("restaurants")
    .update(restaurantData)
    .eq("owner_id", ownerId)
    .select()
    .single();

  if (error) {
    console.error("Error updating restaurant:", error);
    toast.error("Failed to update restaurant");
    throw error;
  }

  return data;
}
