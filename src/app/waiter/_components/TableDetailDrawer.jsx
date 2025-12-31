"use client";

import { useState, useEffect } from "react";
import { FaCheck, FaClock, FaUtensils, FaReceipt } from "react-icons/fa";
import {
  confirmOrderItems,
  closeTableSession,
  startTableSession,
  updateOrderItem,
  deleteOrderItem,
  addOrderItem,
} from "@/services/waiterService";
import toast from "react-hot-toast";

// Sub-Components
import DrawerHeader from "./drawer/DrawerHeader";
import DrawerFooter from "./drawer/DrawerFooter";
import SwipeableOrderItem from "./drawer/SwipeableOrderItem";
import DrawerEmptyState from "./drawer/DrawerEmptyState";
import OrderSection from "./drawer/OrderSection";
import WaiterMenuModal from "./WaiterMenuModal";

export default function TableDetailDrawer({ table, session, isOpen, onClose }) {
  const [loading, setLoading] = useState(false);
  const [localItems, setLocalItems] = useState([]); // Optimistic State
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Scroll Lock
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Sync with Realtime Session Data
  useEffect(() => {
    if (session?.order_items) {
      // Sort by creation time to prevent jumping
      const sorted = [...session.order_items].sort(
        (a, b) => new Date(a.created_at) - new Date(b.created_at)
      );
      setLocalItems(sorted);
    } else {
      setLocalItems([]);
    }
  }, [session?.order_items]);

  if (!isOpen || !table) return null;

  // --- FILTERING LISTS (SEPARATION) ---
  const pendingItems = localItems.filter((i) => i.status === "pending");
  const confirmedItems = localItems.filter((i) =>
    ["confirmed", "served"].includes(i.status)
  );

  const totalAmount = localItems.reduce(
    (sum, item) => sum + (item.unit_price_at_order || 0) * item.quantity,
    0
  );

  // --- ACTIONS ---

  // 1. START SESSION (Open Table)
  const handleStartSession = async () => {
    setLoading(true);
    try {
      await startTableSession(table.id, table.restaurant_id);
      toast.success("Table Started! 🟢");
    } catch (error) {
      toast.error("Failed to start");
    } finally {
      setLoading(false);
    }
  };

  // 2. CLOSE SESSION (Empty Table)
  const handleCloseTable = async () => {
    if (!confirm(`Are you sure you want to CLOSE Table ${table.table_number}?`))
      return;
    setLoading(true);
    try {
      await closeTableSession(session.id);
      toast.success("Table Closed & Emptied 🔴");
      onClose();
    } catch (error) {
      toast.error("Failed to close");
    } finally {
      setLoading(false);
    }
  };

  // 3. CONFIRM (Send to Kitchen)
  const handleConfirm = async () => {
    setLoading(true);
    try {
      await confirmOrderItems(session.id);
      toast.success("Orders Sent to Kitchen! 👨‍🍳");
    } catch (error) {
      toast.error("Failed to confirm");
    } finally {
      setLoading(false);
    }
  };

  // --- MENU ADD (Logic Fixed: Goes to Pending) ---
  const handleMenuAdd = async (product) => {
    // 1. Check if we already have this product in PENDING list (to merge)
    const existingPending = localItems.find(
      (i) =>
        (i.product_id === product.id || i.product?.id === product.id) &&
        i.status === "pending"
    );

    if (existingPending) {
      // Increment Quantity
      const newQty = existingPending.quantity + 1;
      setLocalItems((prev) =>
        prev.map((i) =>
          i.id === existingPending.id ? { ...i, quantity: newQty } : i
        )
      );
      try {
        await updateOrderItem(existingPending.id, { quantity: newQty });
      } catch (e) {}
    } else {
      // Add New Item (Status: PENDING) -> So waiter can confirm it
      const tempId = `temp-${Date.now()}`;
      const newItem = {
        id: tempId,
        product,
        product_id: product.id,
        quantity: 1,
        unit_price_at_order: product.price,
        status: "pending", // <--- IMPORTANT: Goes to Orange List first
        created_at: new Date().toISOString(),
      };
      setLocalItems((prev) => [...prev, newItem]);

      try {
        await addOrderItem({
          session_id: session.id,
          product_id: product.id,
          quantity: 1,
          unit_price_at_order: product.price,
          status: "pending", // <--- IMPORTANT: DB Status
        });
        toast.success("Added to New Orders");
      } catch (e) {
        setLocalItems((prev) => prev.filter((i) => i.id !== tempId));
        toast.error("Failed to add");
      }
    }
  };

  // --- MENU REMOVE ---
  const handleMenuRemove = async (product) => {
    // Only remove from pending items ideally, but for now check all
    const existing = localItems.find(
      (i) =>
        (i.product_id === product.id || i.product?.id === product.id) &&
        i.status !== "cancelled"
    );
    if (!existing) return;

    if (existing.quantity > 1) {
      const newQty = existing.quantity - 1;
      setLocalItems((prev) =>
        prev.map((i) => (i.id === existing.id ? { ...i, quantity: newQty } : i))
      );
      try {
        await updateOrderItem(existing.id, { quantity: newQty });
      } catch (e) {}
    } else {
      setLocalItems((prev) => prev.filter((i) => i.id !== existing.id));
      try {
        await deleteOrderItem(existing.id);
        toast.success("Removed");
      } catch (e) {}
    }
  };

  // --- ROW ACTIONS ---
  const onUpdateQty = async (itemId, newQty) => {
    if (newQty < 1) return;
    setLocalItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, quantity: newQty } : item
      )
    );
    try {
      await updateOrderItem(itemId, { quantity: newQty });
    } catch (e) {}
  };

  const onDeleteItem = async (itemId) => {
    setLocalItems((prev) => prev.filter((item) => item.id !== itemId));
    try {
      await deleteOrderItem(itemId);
      toast.success("Deleted");
    } catch (e) {}
  };

  return (
    <>
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-md z-40 transition-opacity animate-in fade-in"
      />

      <div className="fixed inset-y-0 right-0 w-full max-w-md bg-[#1F1D2B] z-50 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        {/* HEADER: Contains "Close Table" button if session is active */}
        <DrawerHeader
          table={table}
          session={session}
          onClose={onClose}
          onOpenMenu={() => setIsMenuOpen(true)}
          onCloseTable={handleCloseTable} // Add closing from header too
        />

        <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-8 bg-[#1F1D2B]">
          {!session ? (
            // EMPTY STATE
            <DrawerEmptyState
              onStartSession={handleStartSession}
              loading={loading}
            />
          ) : (
            // ACTIVE STATE
            <>
              {/* --- SECTION 1: NEW ORDERS (Orange) --- */}
              {pendingItems.length > 0 && (
                <OrderSection
                  title="New Orders (To Confirm)"
                  count={pendingItems.length}
                  accentColor="orange"
                  icon={<FaClock />}
                >
                  <div className="space-y-3">
                    {pendingItems.map((item) => (
                      <SwipeableOrderItem
                        key={item.id}
                        item={item}
                        isPending={true}
                        onUpdateQty={onUpdateQty}
                        onDelete={onDeleteItem}
                      />
                    ))}
                    {/* CONFIRM BUTTON */}
                    <button
                      onClick={handleConfirm}
                      disabled={loading}
                      className="w-full mt-4 py-4 bg-[#ea7c69] hover:bg-[#d96b58] text-white font-bold rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-transform shadow-lg shadow-orange-900/30"
                    >
                      <FaCheck className="text-xl" /> CONFIRM & SEND TO KITCHEN
                    </button>
                  </div>
                </OrderSection>
              )}

              {/* --- SECTION 2: SENT TO KITCHEN (Blue/Gray) --- */}
              {confirmedItems.length > 0 && (
                <OrderSection
                  title="Sent to Kitchen"
                  count={confirmedItems.length}
                  accentColor="blue"
                  icon={<FaReceipt />}
                >
                  <div className="space-y-3 opacity-90">
                    {confirmedItems.map((item) => (
                      <SwipeableOrderItem
                        key={item.id}
                        item={item}
                        isPending={false}
                        onUpdateQty={onUpdateQty}
                        onDelete={onDeleteItem}
                      />
                    ))}
                  </div>
                </OrderSection>
              )}

              {/* --- EMPTY LIST HINT --- */}
              {localItems.length === 0 && (
                <div className="h-40 flex flex-col items-center justify-center opacity-30 border-2 border-dashed border-gray-700 rounded-xl">
                  <FaUtensils className="text-4xl mb-2" />
                  <p>No orders yet. Add items +</p>
                </div>
              )}
            </>
          )}
        </div>

        {/* FOOTER: Total & Close */}
        {session && (
          <DrawerFooter
            totalAmount={totalAmount}
            onCloseTable={handleCloseTable}
            loading={loading}
          />
        )}
      </div>

      <WaiterMenuModal
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        cartItems={localItems}
        onAdd={handleMenuAdd}
        onRemove={handleMenuRemove}
        restaurantId={session?.restaurant_id}
      />
    </>
  );
}
