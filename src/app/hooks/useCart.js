import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export const useCart = (tableNumberFromUrl) => {
  const [cartItems, setCartItems] = useState([]);
  const [sessionId, setSessionId] = useState(null);
  const [guestId, setGuestId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Setup Session & Guest
  useEffect(() => {
    if (!tableNumberFromUrl) return;

    const initializeSession = async () => {
      try {
        //  Guest ID
        let storedGuestId = localStorage.getItem("menu_guest_id");
        if (!storedGuestId) {
          storedGuestId = crypto.randomUUID();
          localStorage.setItem("menu_guest_id", storedGuestId);
        }
        setGuestId(storedGuestId);

        // Lookup Table Info
        const { data: tableData, error: tableError } = await supabase
          .from("tables")
          .select("id, restaurant_id")
          .eq("table_number", tableNumberFromUrl) // "T-01"
          .single();

        if (tableError || !tableData) {
          console.error("Table not found!", tableError);
          return;
        }

        const realTableUuid = tableData.id;
        const realRestaurantId = tableData.restaurant_id;

        // Session Logic
        let { data: session } = await supabase
          .from("sessions")
          .select("id")
          .eq("table_id", realTableUuid)
          .eq("status", "ordering") // <--- تغییر مهم: با دیتای تو مچ شد
          .single();

        if (!session) {
          // اگه نبود، یکی میسازیم با وضعیت 'ordering'
          const { data: newSession, error: sessionError } = await supabase
            .from("sessions")
            .insert([
              {
                table_id: realTableUuid,
                restaurant_id: realRestaurantId,
                status: "ordering", // <--- تغییر مهم: با دیتای تو مچ شد
              },
            ])
            .select()
            .single();

          if (sessionError) throw sessionError;
          session = newSession;
        }

        setSessionId(session?.id);
      } catch (err) {
        console.error("Error init session:", err);
      }
    };

    initializeSession();
  }, [tableNumberFromUrl]);

  // Fetch Cart Items (Realtime)
  useEffect(() => {
    if (!sessionId) return;
    fetchCartItems();
    const channel = supabase
      .channel(`session-${sessionId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "order_items",
          filter: `session_id=eq.${sessionId}`,
        },
        () => fetchCartItems()
      )
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [sessionId]);

  const fetchCartItems = async () => {
    const { data } = await supabase
      .from("order_items")
      .select(`*, product:products (title, price, image_url)`)
      .eq("session_id", sessionId)
      .neq("status", "closed") // آیتم‌های بسته شده رو نیار
      .order("created_at", { ascending: true });
    if (data) setCartItems(data);
    setIsLoading(false);
  };

  // Actions
  const addToCart = async (product) => {
    if (!sessionId || !guestId) return;
    const existingItem = cartItems.find(
      (item) => item.product_id === product.id && item.status === "draft"
    );
    if (existingItem) {
      await supabase
        .from("order_items")
        .update({ quantity: existingItem.quantity + 1 })
        .eq("id", existingItem.id);
    } else {
      await supabase.from("order_items").insert([
        {
          session_id: sessionId,
          product_id: product.id,
          quantity: 1,
          unit_price_at_order: product.price,
          added_by_guest_id: guestId,
          status: "draft",
        },
      ]);
    }
  };

  const removeFromCart = async (itemId) => {
    await supabase.from("order_items").delete().eq("id", itemId);
  };

  const submitOrder = async () => {
    if (!sessionId) return;
    await supabase
      .from("order_items")
      .update({ status: "pending" })
      .eq("session_id", sessionId)
      .eq("status", "draft");
  };

  return { cartItems, addToCart, removeFromCart, submitOrder, isLoading };
};
