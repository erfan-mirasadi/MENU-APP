"use client";
import { useEffect, useState } from "react";
import { FaWifi, FaRedo } from "react-icons/fa";

export default function OfflineAlert({ isConnected }) {
  const [showPopup, setShowPopup] = useState(false);
  const [isBrowserOffline, setIsBrowserOffline] = useState(false);

  // 1. Check Browser Offline Status (Native)
  useEffect(() => {
    // Initial check
    if (typeof window !== "undefined") {
        setIsBrowserOffline(!navigator.onLine);
    }

    const handleOnline = () => setIsBrowserOffline(false);
    const handleOffline = () => setIsBrowserOffline(true);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // 2. Logic to Show Popup
  useEffect(() => {
    // Show popup if:
    // A. Browser is strictly offline
    // B. Supabase Realtime is disconnected (isConnected is false) AND it stays false for > 5 seconds
    
    // Note: isConnected is usually true. When false, we wait a bit to avoid flickering on page load/reconnects.
    
    let timer;

    if (isBrowserOffline) {
        setShowPopup(true);
    } 
    else if (!isConnected) {
        // Debounce Supabase disconnect (it might be connecting initially)
        timer = setTimeout(() => {
            setShowPopup(true);
        }, 5000); 
    } else {
        setShowPopup(false);
    }

    return () => clearTimeout(timer);
  }, [isConnected, isBrowserOffline]);

  const handleRefresh = () => {
    window.location.reload();
  };

  if (!showPopup) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-[#1F1D2B] border border-white/10 p-8 rounded-2xl shadow-2xl max-w-sm w-full text-center space-y-6 animate-in zoom-in-95 duration-300">
        
        <div className="mx-auto w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center animate-pulse">
            <FaWifi className="text-4xl text-red-500" />
        </div>

        <div>
            <h2 className="text-2xl font-bold text-white mb-2">Connection Lost</h2>
            <p className="text-gray-400">
                You are currently offline. Real-time updates are paused.
                <br/>
                Please check your internet and refresh.
            </p>
        </div>

        <button
          onClick={handleRefresh}
          className="w-full py-3 bg-[#ea7c69] hover:bg-[#d96c5b] text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-transform active:scale-95"
        >
          <FaRedo className={showPopup ? "animate-spin-once" : ""} />
          Refresh Application
        </button>
      </div>
    </div>
  );
}
