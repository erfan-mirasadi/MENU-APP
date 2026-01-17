import React from "react";
import { RiArrowDownSLine } from "react-icons/ri";

const DashboardFilter = ({ filter, setFilter }) => {
  return (
    <div className="relative">
      <button className="flex items-center gap-2 text-white bg-[#1F1D2B] border border-[#393C49] px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#252836] transition-colors">
        <span className="text-white">Filter Order</span>
        <RiArrowDownSLine size={16} className="text-white" />
      </button>
      {/* Mock functionality - just visual for now as requested */}
    </div>
  );
};

export default DashboardFilter;
