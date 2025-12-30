"use client";

import { useState } from "react";
import {
  FaCheck,
  FaTimes,
  FaMoneyBillWave,
  FaClock,
  FaUtensils,
} from "react-icons/fa";
import { confirmOrderItems, closeTableSession } from "@/services/waiterService";
import toast from "react-hot-toast";

export default function TableDetailDrawer({ table, session, isOpen, onClose }) {
  const [loading, setLoading] = useState(false);

  if (!isOpen || !table) return null;

  // --- HELPER: انتخاب زبان (ترجیحا ترکی) ---
  const getProductTitle = (product) => {
    if (!product || !product.title) return "Unknown Item";
    // اگر تایتل آبجکت بود (که هست)، اول ترکی رو برگردون، اگه نبود انگلیسی
    if (typeof product.title === "object") {
      return product.title.tr || product.title.en || "Unknown Item";
    }
    // اگر استرینگ بود (محض اطمینان)
    return product.title;
  };

  // تفکیک آیتم‌ها
  const pendingItems =
    session?.order_items?.filter((i) => i.status === "pending") || [];
  const confirmedItems =
    session?.order_items?.filter((i) =>
      ["confirmed", "served"].includes(i.status)
    ) || [];

  // محاسبه قیمت کل
  const totalAmount =
    session?.order_items?.reduce((sum, item) => {
      return sum + (item.unit_price_at_order || 0) * item.quantity;
    }, 0) || 0;

  // --- ACTIONS ---
  const handleConfirm = async () => {
    setLoading(true);
    try {
      await confirmOrderItems(session.id);
      toast.success("Orders Confirmed! ✅");
    } catch (error) {
      console.error(error);
      toast.error("Failed to confirm");
    } finally {
      setLoading(false);
    }
  };

  const handleCloseTable = async () => {
    if (
      !confirm(`Close Table ${table.table_number}? Ensure payment is received.`)
    )
      return;
    setLoading(true);
    try {
      await closeTableSession(session.id);
      toast.success("Table Closed & Cleared 🧹");
      onClose();
    } catch (error) {
      console.error(error);
      toast.error("Failed to close table");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 w-full max-w-md bg-[#1F1D2B] border-l border-white/10 z-50 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="p-6 bg-[#252836] border-b border-white/5 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-white">
              Table {table.table_number}
            </h2>
            <p className="text-sm text-gray-400">
              {session ? "Active Session" : "Empty"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-white/5 rounded-full text-gray-400 hover:text-white hover:bg-white/10"
          >
            <FaTimes />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* SECTION: WAITING APPROVAL (Orange) */}
          {pendingItems.length > 0 ? (
            <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl overflow-hidden">
              <div className="p-3 bg-orange-500/20 text-orange-400 font-bold text-sm flex items-center gap-2">
                <FaClock /> Waiting Approval ({pendingItems.length})
              </div>
              <div className="divide-y divide-orange-500/10">
                {pendingItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 flex justify-between items-center text-white"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-lg">
                        {item.quantity}x
                      </span>
                      <div>
                        {/* ✅ FIX: استفاده از تابع هلپر برای تایتل */}
                        <p className="font-medium">
                          {getProductTitle(item.product)}
                        </p>
                        <p className="text-xs text-orange-300/70">
                          {item.unit_price_at_order} ₺
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-3">
                <button
                  onClick={handleConfirm}
                  disabled={loading}
                  className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-lg shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                  <FaCheck /> Approve All
                </button>
              </div>
            </div>
          ) : (
            session && (
              <div className="text-center py-4 text-gray-500 text-sm border border-dashed border-gray-700 rounded-xl">
                No pending orders
              </div>
            )
          )}

          {/* SECTION: CONFIRMED ORDERS (Blue/Gray) */}
          {confirmedItems.length > 0 && (
            <div>
              <h3 className="text-gray-400 font-bold text-xs uppercase tracking-wider mb-2">
                Preparing / Served
              </h3>
              <div className="bg-[#252836] rounded-xl border border-white/5 divide-y divide-white/5">
                {confirmedItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 flex justify-between items-center opacity-80"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-gray-400 font-bold">
                        x{item.quantity}
                      </span>
                      {/* ✅ FIX: استفاده از تابع هلپر برای تایتل */}
                      <span className="text-gray-300">
                        {getProductTitle(item.product)}
                      </span>
                    </div>
                    <span className="text-xs px-2 py-1 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      Done
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {session && (
          <div className="p-6 bg-[#252836] border-t border-white/5 space-y-4">
            <div className="flex justify-between items-end">
              <span className="text-gray-400">Total Bill</span>
              <span className="text-3xl font-bold text-white">
                {totalAmount.toLocaleString()} ₺
              </span>
            </div>
            <button
              onClick={handleCloseTable}
              disabled={loading}
              className="w-full py-4 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all"
            >
              <FaMoneyBillWave /> Payment Received & Close
            </button>
          </div>
        )}
      </div>
    </>
  );
}
