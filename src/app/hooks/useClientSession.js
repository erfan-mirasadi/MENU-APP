import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export const useClientSession = (sessionId) => {
  const [sessionData, setSessionData] = useState(null);
  const [orders, setOrders] = useState([]);

  const fetchSession = async () => {
    if (!sessionId) return;
    const { data } = await supabase
      .from("sessions")
      .select(`*, order_items(*, product:products(*))`)
      .eq("id", sessionId)
      .single();
    
    if (data) {
        setSessionData(data);
        setOrders(data.order_items || []);
    }
  };

  useEffect(() => {
    fetchSession();

    if (!sessionId) return;

    const channel = supabase
      .channel(`session-${sessionId}`)
      // Subscription 1 (Cart): Listen to ALL changes on order_items for THIS session
      .on(
        "postgres_changes",
        {
          event: "*", // INSERT, UPDATE, DELETE are all needed for cart sync
          schema: "public",
          table: "order_items",
          filter: `session_id=eq.${sessionId}`,
        },
        () => {
           fetchSession();
        }
      )
      // Subscription 2 (Table Status): Listen ONLY to UPDATEs for THIS session (e.g. closed/payment)
      .on(
        "postgres_changes",
        {
            event: "UPDATE",
            schema: "public",
            table: "sessions",
            filter: `id=eq.${sessionId}`
        },
        (payload) => {
            setSessionData(prev => ({...prev, ...payload.new}));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId]);

  return { sessionData, orders };
};
