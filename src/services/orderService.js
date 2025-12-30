import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";

export async function getOrderItems(sessionId) {
  if (!sessionId) return [];

  const { data, error } = await supabase
    .from("order_items")
    .select(`*, product:products (title, price, image_url)`)
    .eq("session_id", sessionId)
    .neq("status", "closed")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching order items:", error);
    return [];
  }

  return data || [];
}

export async function addOrderItem(orderItem) {
  const { data, error } = await supabase
    .from("order_items")
    .insert([orderItem])
    .select()
    .single();

  if (error) {
    console.error("Error adding order item:", error);
    toast.error("Failed to add item to cart");
    throw error;
  }

  return data;
}

export async function updateOrderItemQuantity(itemId, quantity) {
  const { data, error } = await supabase
    .from("order_items")
    .update({ quantity })
    .eq("id", itemId)
    .select();

  if (error) {
    console.error("Error updating order item:", error);
    toast.error("Failed to update quantity");
    throw error;
  }

  // Item may have been removed by realtime update - this is expected
  if (!data || data.length === 0) {
    return null;
  }

  return data[0];
}

export async function removeOrderItem(itemId) {
  const { error } = await supabase
    .from("order_items")
    .delete()
    .eq("id", itemId);

  if (error) {
    console.error("Error removing order item:", error);
    toast.error("Failed to remove item");
    throw error;
  }

  return true;
}

export async function submitDraftOrders(sessionId) {
  const { error } = await supabase
    .from("order_items")
    .update({ status: "pending" })
    .eq("session_id", sessionId)
    .eq("status", "draft");

  if (error) {
    console.error("Error submitting orders:", error);
    toast.error("Failed to submit order");
    throw error;
  }

  return true;
}
