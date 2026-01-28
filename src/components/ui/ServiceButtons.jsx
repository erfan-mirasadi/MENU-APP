"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { FaConciergeBell, FaFileInvoiceDollar } from "react-icons/fa";
import { serviceRequestService } from "@/services/serviceRequestService";
import toast from "react-hot-toast";

import { useRestaurantFeatures } from "@/app/hooks/useRestaurantFeatures";

export default function ServiceButtons({ restaurantId, tableId, sessionId }) {
  const [loading, setLoading] = useState(null); // 'call_waiter' | 'bill' | null
  const { isEnabled, loading: featuresLoading } = useRestaurantFeatures(); 

  const handleRequest = async (type) => {
    if (loading) return;
    setLoading(type);

    try {
      const { error } = await serviceRequestService.createRequest(
        restaurantId,
        tableId,
        sessionId,
        type
      );

      if (error) {
        toast.error("Failed to send request. Please try again.");
      } else {
        const msg = type === 'bill' ? "Bill requested!" : "Waiter called!";
        toast.success(msg);
      }
    } catch (err) {
      console.error("Request failed", err);
      toast.error("Something went wrong.");
    } finally {
      setLoading(null);
    }
  };

  // Ensure we only run on client (hydration safe)
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent flash of content: Don't show until mounted AND features are loaded
  if (!mounted || featuresLoading) return null;

  // Render nothing if neither feature is enabled
  const showWaiter = isEnabled("waiter");
  const showBill = isEnabled("cashier");
  
  if (!showWaiter && !showBill) return null;

  return createPortal(
    <div className="fixed top-40 left-4 z-[2147483647] flex flex-col gap-3">
      {/* Call Waiter Button */}
      {showWaiter && (
        <button
            onClick={() => handleRequest("call_waiter")}
            disabled={loading === "call_waiter"}
            className="group relative flex items-center justify-center w-12 h-12 bg-white/10 backdrop-blur-md border border-white/20 rounded-full shadow-lg transition-all active:scale-95 disabled:opacity-50 hover:bg-white/20"
            aria-label="Call Waiter"
        >
            <FaConciergeBell className={`text-white text-xl ${loading === 'call_waiter' ? 'animate-pulse' : 'group-hover:animate-wiggle'}`} />
            <span className="absolute left-full ml-3 px-2 py-1 bg-black/80 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            Call Waiter
            </span>
        </button>
      )}

      {/* Request Bill Button */}
      {showBill && (
        <button
            onClick={() => handleRequest("bill")}
            disabled={loading === "bill"}
            className="group relative flex items-center justify-center w-12 h-12 bg-white/10 backdrop-blur-md border border-white/20 rounded-full shadow-lg transition-all active:scale-95 disabled:opacity-50 hover:bg-white/20"
            aria-label="Request Bill"
        >
            <FaFileInvoiceDollar className={`text-white text-xl ${loading === 'bill' ? 'animate-pulse' : ''}`} />
            <span className="absolute left-full ml-3 px-2 py-1 bg-black/80 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            Request Bill
            </span>
        </button>
      )}
    </div>,
    document.body
  );
}
