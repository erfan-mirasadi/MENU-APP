import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";

export async function getActiveSession(tableId) {
  const { data, error } = await supabase
    .from("sessions")
    .select("id")
    .eq("table_id", tableId)
    .eq("status", "ordering")
    .single();

  if (error && error.code !== "PGRST116") {
    console.error("Error fetching session:", error);
  }

  return data;
}


export async function createSession(tableId, restaurantId) {
  const { data, error } = await supabase
    .from("sessions")
    .insert([
      {
        table_id: tableId,
        restaurant_id: restaurantId,
        status: "ordering",
      },
    ])
    .select()
    .single();

  if (error) {
    console.error("Error creating session:", error);
    toast.error("Failed to create session");
    throw error;
  }

  return data;
}

export async function updateSessionStatus(sessionId, status) {
  const { data, error } = await supabase
    .from("sessions")
    .update({ status })
    .eq("id", sessionId)
    .select()
    .single();

  if (error) {
    console.error("Error updating session:", error);
    toast.error("Failed to update session");
    throw error;
  }

  return data;
}
