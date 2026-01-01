"use client";
import { useState } from "react";
import Loader from "../ui/Loader";
import { RiDeleteBin6Line, RiQrCodeLine } from "react-icons/ri";

export default function TableCard({ table, onDelete }) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${table.table_number}?`)) return;
    
    setIsDeleting(true);
    try {
      await onDelete(table.id);
    } catch (error) {
      setIsDeleting(false);
    }
  };

  return (
    <div className="bg-dark-900 rounded-2xl p-6 flex flex-col items-center text-center shadow-lg relative border border-gray-800 hover:border-accent/50 transition-colors group h-full justify-between">
      
      {/* Table Icon / Avatar */}
      <div className="w-24 h-24 rounded-full bg-accent/10 flex items-center justify-center text-accent mb-4 shadow-inner shadow-accent/5 group-hover:scale-110 transition-transform duration-300">
         <span className="text-3xl font-bold font-mono tracking-wider">{table.table_number}</span>
      </div>

      <div className="w-full flex flex-col gap-2">
        {/* Placeholder for QR Code (Future feature) */}
        <div className="flex items-center justify-center gap-2 text-xs text-text-dim">
           <RiQrCodeLine size={16} />
           <span>{table.qr_token}</span>
        </div>
      </div>

      {/* Delete Button */}
      <button
        onClick={handleDelete}
        disabled={isDeleting}
        className="mt-6 w-full py-2.5 rounded-xl bg-gray-800 text-red-400 text-sm font-semibold flex items-center justify-center gap-2 hover:bg-red-500/10 hover:text-red-500 transition-all disabled:opacity-50"
      >
        {isDeleting ? (
          <Loader size="small" className="text-current" />
        ) : (
          <>
            <RiDeleteBin6Line size={18} />
            <span>Delete</span>
          </>
        )}
      </button>
    </div>
  );
}
