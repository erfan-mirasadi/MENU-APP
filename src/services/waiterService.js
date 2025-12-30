import { supabase } from "@/lib/supabase";

// 1. تایید سفارش‌ها (تبدیل Pending به Confirmed)
export async function confirmOrderItems(sessionId) {
  const { data, error } = await supabase
    .from("order_items")
    .update({ status: "confirmed" })
    .eq("session_id", sessionId)
    .eq("status", "pending")
    .select();

  if (error) throw error;
  return data;
}

// 2. بستن میز و تسویه (تبدیل Active به Closed)
export async function closeTableSession(sessionId) {
  // بستن سشن
  const { error: sessionError } = await supabase
    .from("sessions")
    .update({ status: "closed" })
    .eq("id", sessionId);

  if (sessionError) throw sessionError;

  // بستن آیتم‌ها (اختیاری، جهت تمیزی دیتا)
  await supabase
    .from("order_items")
    .update({ status: "closed" })
    .eq("session_id", sessionId);

  // بستن درخواست‌های سرویس
  await supabase
    .from("service_requests")
    .update({ status: "resolved" })
    .eq("session_id", sessionId);

  return true;
}
