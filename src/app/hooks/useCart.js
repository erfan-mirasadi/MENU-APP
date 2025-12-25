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
        //  Guest ID
        let storedGuestId = localStorage.getItem("menu_guest_id");
        if (!storedGuestId) {
          storedGuestId = crypto.randomUUID();
          localStorage.setItem("menu_guest_id", storedGuestId);
        }
        setGuestId(storedGuestId);

        // Lookup Table Info
        const tableData = await getTableByNumber(tableNumberFromUrl);

        if (!tableData) {
          console.error("Table not found!");
          return;
        }

        const realTableUuid = tableData.id;
        const realRestaurantId = tableData.restaurant_id;

        // Session Logic
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

  // Actions
  const addToCart = async (product) => {
    if (!sessionId || !guestId) return;
    const existingItem = cartItems.find(
      (item) => item.product_id === product.id && item.status === "draft"
    );
    if (existingItem) {
      await updateOrderItemQuantity(existingItem.id, existingItem.quantity + 1);
    } else {
      await addOrderItem({
        session_id: sessionId,
        product_id: product.id,
        quantity: 1,
        unit_price_at_order: product.price,
        added_by_guest_id: guestId,
        status: "draft",
      });
    }
  };

  const removeFromCart = async (itemId) => {
    await removeOrderItem(itemId);
  };

  const submitOrder = async () => {
    if (!sessionId) return;
    await submitDraftOrders(sessionId);
  };

  return { cartItems, addToCart, removeFromCart, submitOrder, isLoading };
};
