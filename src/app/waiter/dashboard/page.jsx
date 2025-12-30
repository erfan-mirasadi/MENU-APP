"use client";

import { useWaiterData } from "@/app/hooks/useWaiterData";
import { useState } from "react";
import { FaLayerGroup, FaRedoAlt } from "react-icons/fa";
import TableDetailDrawer from "../_components/TableDetailDrawer";
import TableCard from "../_components/TableCard";

export default function WaiterDashboard() {
  const { tables, sessions, loading } = useWaiterData();

  // State
  const [selectedTable, setSelectedTable] = useState(null);
  const [selectedSession, setSelectedSession] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Stats Counters
  const pendingCount = sessions.filter((s) =>
    s.order_items?.some((i) => i.status === "pending")
  ).length;
  const alertCount = sessions.filter((s) =>
    s.service_requests?.some((r) => r.status === "pending")
  ).length;
  const activeCount = sessions.length;

  const handleTableClick = (table, session) => {
    // باز کردن دراور حتی برای میز خالی (شاید بخوای دستی پرش کنی)
    setSelectedTable(table);
    setSelectedSession(session);
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setTimeout(() => {
      setSelectedTable(null);
      setSelectedSession(null);
    }, 300);
  };

  // Live Update logic
  const activeDrawerSession =
    isDrawerOpen && selectedTable
      ? sessions.find((s) => s.table_id === selectedTable.id)
      : selectedSession;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#1F1D2B]">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-[#ea7c69] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-400 font-mono text-sm">LOADING FLOOR...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      {/* --- MODERN HEADER --- */}
      <div className="sticky top-0 z-20 bg-[#1F1D2B]/95 backdrop-blur-xl border-b border-white/5 shadow-2xl">
        <div className="px-4 py-4">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight">
                Floor <span className="text-[#ea7c69]">Overview</span>
              </h1>
              <p className="text-xs text-gray-500 font-medium mt-0.5">
                {tables.length} Tables · Realtime Active
              </p>
            </div>
            {/* دکمه رفرش مخفی (صرفا بصری) */}
            <div
              className={`w-3 h-3 rounded-full ${
                pendingCount > 0 ? "bg-green-500 animate-ping" : "bg-gray-700"
              }`}
            />
          </div>

          {/* --- STATUS BAR (FILTER-LOOK) --- */}
          {/* این نوار بالا سریع نشون میده چه خبره */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {/* ALERT PILL */}
            {alertCount > 0 && (
              <div className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-xl shadow-lg shadow-red-900/50 animate-bounce">
                <span className="font-bold">{alertCount}</span>
                <span className="text-xs font-bold uppercase">Requests</span>
              </div>
            )}

            {/* PENDING PILL (مهمترین) */}
            <div
              className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all ${
                pendingCount > 0
                  ? "bg-orange-600 border-orange-500 text-white shadow-lg shadow-orange-900/50"
                  : "bg-[#252836] border-white/5 text-gray-400"
              }`}
            >
              <span className="font-bold">{pendingCount}</span>
              <span className="text-xs font-bold uppercase">To Confirm</span>
            </div>

            {/* ACTIVE PILL */}
            <div className="flex items-center gap-2 bg-[#252836] border border-white/5 text-blue-200 px-4 py-2 rounded-xl">
              <span className="font-bold">{activeCount}</span>
              <span className="text-xs font-bold uppercase">Occupied</span>
            </div>
          </div>
        </div>
      </div>

      {/* --- TABLE GRID --- */}
      <div className="p-4">
        {tables.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 opacity-50">
            <FaLayerGroup className="text-4xl mb-4 text-gray-600" />
            <p className="text-gray-500">No tables found.</p>
          </div>
        ) : (
          // گرید ریسپانسیو عالی برای موبایل (2 ستون) و تبلت (3-4 ستون)
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {tables.map((table) => {
              const activeSession = sessions.find(
                (s) => s.table_id === table.id
              );
              return (
                <TableCard
                  key={table.id}
                  table={table}
                  session={activeSession}
                  onClick={handleTableClick}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* --- DRAWER --- */}
      <TableDetailDrawer
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        table={selectedTable}
        session={activeDrawerSession}
      />
    </div>
  );
}
