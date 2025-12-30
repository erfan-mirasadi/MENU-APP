import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { getTableByNumber } from "@/services/tableService";
import { getActiveSession, createSession } from "@/services/sessionService";
import {
  getOrderItems,
  addOrderItem,
  updateOrderItemQuantity,
  removeOrderItem,
  submitDraftOrders,
} from "@/services/orderService";

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
        let storedGuestId = localStorage.getItem("menu_guest_id");
        if (!storedGuestId) {
          storedGuestId = crypto.randomUUID();
          localStorage.setItem("menu_guest_id", storedGuestId);
        }
        setGuestId(storedGuestId);

        const tableData = await getTableByNumber(tableNumberFromUrl);
        if (!tableData) return;

        const realTableUuid = tableData.id;
        const realRestaurantId = tableData.restaurant_id;

        let session = await getActiveSession(realTableUuid);
        if (!session) {
          session = await createSession(realTableUuid, realRestaurantId);
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
    const data = await getOrderItems(sessionId);
    setCartItems(data);
    setIsLoading(false);
  };

  // --- ACTIONS ---

  const addToCart = async (product) => {
    if (!sessionId || !guestId) return;

    try {
      const existingItem = cartItems.find(
        (item) => item.product_id === product.id && item.status === "draft"
      );

      if (existingItem) {
        // 1. آپدیت UI (سریع)
        setCartItems((prev) =>
          prev.map((item) =>
            item.id === existingItem.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          )
        );

        // 2. جلوگیری از کرش: اگر آیدی موقته، به سرور درخواست نده
        if (existingItem.id.toString().startsWith("temp-")) {
          // درخواست قبلی هنوز تو راهه، پس صبر میکنیم (Realtime خودش سینک میکنه)
          return;
        }

        // 3. اگر آیدی واقعیه، آپدیت کن
        const result = await updateOrderItemQuantity(
          existingItem.id,
          existingItem.quantity + 1
        );

        // Race condition check
        if (!result) {
          // اگر آیتم حذف شده بود و ما خبر نداشتیم، دوباره بساز
          await addOrderItem({
            session_id: sessionId,
            product_id: product.id,
            quantity: 1,
            unit_price_at_order: product.price,
            added_by_guest_id: guestId,
            status: "draft",
          });
        }
      } else {
        // آیتم جدید
        const tempId = `temp-${Date.now()}`;

        // Optimistic UI Update
        setCartItems((prev) => [
          ...prev,
          {
            id: tempId,
            product_id: product.id,
            quantity: 1,
            unit_price_at_order: product.price,
            status: "draft",
            product: {
              title: product.title,
              price: product.price,
              image_url: product.image_url,
            },
          },
        ]);

        await addOrderItem({
          session_id: sessionId,
          product_id: product.id,
          quantity: 1,
          unit_price_at_order: product.price,
          added_by_guest_id: guestId,
          status: "draft",
        });
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      fetchCartItems(); // Revert on error
    }
  };

  const decreaseFromCart = async (itemId) => {
    try {
      const existingItem = cartItems.find((item) => item.id === itemId);
      if (!existingItem) return;

      // جلوگیری از کرش: اگر آیدی موقته، هیچ کاری نکن
      if (existingItem.id.toString().startsWith("temp-")) {
        return;
      }

      if (existingItem.quantity > 1) {
        // Optimistic UI
        setCartItems((prev) =>
          prev.map((item) =>
            item.id === itemId ? { ...item, quantity: item.quantity - 1 } : item
          )
        );
        await updateOrderItemQuantity(
          existingItem.id,
          existingItem.quantity - 1
        );
      } else {
        // Optimistic UI
        setCartItems((prev) => prev.filter((item) => item.id !== itemId));
        await removeOrderItem(itemId);
      }
    } catch (error) {
      console.error("Error decreasing from cart:", error);
      fetchCartItems();
    }
  };

  const removeFromCart = async (itemId) => {
    // جلوگیری از کرش
    if (itemId.toString().startsWith("temp-")) return;

    setCartItems((prev) => prev.filter((item) => item.id !== itemId));
    await removeOrderItem(itemId);
  };

  const submitOrder = async () => {
    if (!sessionId) return;
    await submitDraftOrders(sessionId);
  };

  return {
    cartItems,
    addToCart,
    decreaseFromCart,
    removeFromCart,
    submitOrder,
    isLoading,
  };
};
