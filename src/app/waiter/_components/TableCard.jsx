"use client";

import { useMemo } from "react";
import {
  FaUser,
  FaConciergeBell,
  FaUtensils,
  FaClock,
  FaCheckCircle,
} from "react-icons/fa";

export default function TableCard({ table, session, onClick }) {
  const cardStyle = useMemo(() => {
    // 1. EMPTY (خالی) - خیلی کمرنگ و خاموش
    if (!session) {
      return {
        type: "empty",
        baseClasses:
          "bg-[#1F1D2B] border-2 border-[#2D303E] opacity-50 hover:opacity-100",
        numberColor: "text-gray-600",
        labelColor: "text-gray-500",
        labelText: "Empty",
        icon: null, // میز خالی آیکون نمیخواد، خلوت باشه
        glow: "",
      };
    }

    // 2. ALERT (درخواست گارسون) - قرمز جیغ و اضطراری
    const hasRequest = session.service_requests?.some(
      (r) => r.status === "pending"
    );
    if (hasRequest) {
      return {
        type: "alert",
        // گرادینت قرمز قوی
        baseClasses:
          "bg-gradient-to-br from-red-600 to-red-800 border-2 border-red-400 animate-bounce shadow-xl",
        numberColor: "text-white",
        labelColor: "text-red-100 font-bold",
        labelText: "CALLING!",
        icon: (
          <FaConciergeBell className="text-white text-2xl animate-wiggle" />
        ),
        glow: "shadow-red-600/50",
      };
    }

    // 3. WAITING APPROVAL (منتظر تایید) - نارنجی پررنگ (مهمترین حالت)
    const hasPending = session.order_items?.some((i) => i.status === "pending");
    if (hasPending) {
      return {
        type: "waiting",
        // نارنجی سالید و مشخص
        baseClasses:
          "bg-orange-600 border-2 border-orange-300 animate-pulse shadow-xl",
        numberColor: "text-white",
        labelColor: "text-orange-50 font-bold uppercase tracking-wider",
        labelText: "Confirm Order",
        icon: <FaUtensils className="text-white text-2xl" />,
        glow: "shadow-orange-500/50",
      };
    }

    // 4. OCCUPIED (اشغال شده) - آبی تیره و آرام
    return {
      type: "occupied",
      // رنگ متمایز از خالی، ولی چشم رو اذیت نمیکنه
      baseClasses: "bg-[#252836] border-2 border-blue-500/40",
      numberColor: "text-blue-100",
      labelColor: "text-blue-400 font-medium",
      labelText: "Occupied",
      icon: <FaUser className="text-blue-500 text-xl" />,
      glow: "",
    };
  }, [session]);

  return (
    <div
      onClick={() => onClick(table, session)}
      className={`
        relative aspect-square rounded-2xl flex flex-col items-center justify-between p-4 cursor-pointer 
        transition-all duration-200 transform active:scale-95
        ${cardStyle.baseClasses} ${cardStyle.glow}
      `}
    >
      {/* هدر کارت: آیکون وضعیت */}
      <div className="w-full flex justify-between items-start h-8">
        {/* اگر آیکون داشت نشون بده */}
        {cardStyle.icon && (
          <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
            {cardStyle.icon}
          </div>
        )}
      </div>

      {/* بدنه اصلی: شماره میز (خیلی بزرگ) */}
      <div className="flex-1 flex items-center justify-center">
        <span
          className={`text-5xl font-black tracking-tighter ${cardStyle.numberColor}`}
        >
          {table.table_number}
        </span>
      </div>

      {/* فوتر: متن وضعیت */}
      <div className="w-full text-center pb-1">
        <span className={`text-xs ${cardStyle.labelColor}`}>
          {cardStyle.labelText}
        </span>
      </div>
    </div>
  );
}
