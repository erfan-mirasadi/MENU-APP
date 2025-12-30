"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import Scene from "./Scene";
import UIOverlay from "./UIOverlay";
import { useGLTF, useProgress } from "@react-three/drei"; // Added useProgress for real loading state

// --- GLOBAL VARIABLES ---
// Shared object for gyroscope data to avoid React re-renders.
// This logic remains UNTOUCHED as requested.
const gyroData = { x: 0, y: 0 };
const GYRO_INTENSITY = 40;

export default function ThreeDLayout({ restaurant, categories }) {
  // --- STATE MANAGEMENT ---
  const [activeCatId, setActiveCatId] = useState(categories[0]?.id);
  const [activeIndex, setActiveIndex] = useState(0);

  // REAL LOADER LOGIC:
  // 'active' is true whenever Three.js is downloading/processing assets.
  const { active } = useProgress();

  const touchStartRef = useRef({ x: 0, y: 0, time: 0 });

  // Ref to track permission denial time (for 30s cooldown)
  const lastPermissionDenyTime = useRef(0);
  // Ref to track if we already have permission (to stop asking)
  const isPermissionGranted = useRef(false);

  // Compute active products
  const activeProducts = useMemo(() => {
    return categories.find((c) => c.id === activeCatId)?.products || [];
  }, [activeCatId, categories]);

  const focusedProduct = activeProducts[activeIndex] || activeProducts[0];

  // --- LOGIC: CATEGORY TRANSITION ---
  useEffect(() => {
    setActiveIndex(0);

    // Clear GLTF Cache when category changes to free memory
    useGLTF.clear();

    // We don't need artificial timeouts anymore.
    // The 'active' state from useProgress will automatically handle the UI.
  }, [activeCatId]);

  // --- LOGIC: SMART PRELOADING ---
  useEffect(() => {
    if (!activeProducts.length) return;

    // Prioritize loading current, next, and previous items
    const priorityList = new Set([
      0,
      1,
      activeIndex,
      activeIndex + 1,
      activeIndex - 1,
    ]);

    priorityList.forEach((idx) => {
      if (idx >= 0 && idx < activeProducts.length) {
        const product = activeProducts[idx];
        if (product?.model_url) {
          useGLTF.preload(product.model_url);
        }
      }
    });
  }, [activeIndex, activeProducts]);

  // --- LOGIC: GYROSCOPE SENSOR (FIXED: iOS touchend + 30s Cooldown) ---
  useEffect(() => {
    const handleOrientation = (event) => {
      gyroData.x = (event.beta || 0) / GYRO_INTENSITY;
      gyroData.y = (event.gamma || 0) / GYRO_INTENSITY;
    };

    // Main function to request iOS permission
    const requestAccess = async () => {
      // 1. If already granted, do nothing.
      if (isPermissionGranted.current) return;

      // 2. Check if the API exists (iOS check)
      if (
        typeof DeviceOrientationEvent === "undefined" ||
        typeof DeviceOrientationEvent.requestPermission !== "function"
      ) {
        return;
      }

      // 3. Check Cooldown (30 Seconds)
      // If user denied less than 30 seconds ago, STOP here.
      // Do not remove listener, just don't ask yet.
      const now = Date.now();
      if (now - lastPermissionDenyTime.current < 30000) {
        return;
      }

      try {
        // 4. Request Permission
        const permission = await DeviceOrientationEvent.requestPermission();

        if (permission === "granted") {
          // Success!
          isPermissionGranted.current = true;
          window.addEventListener("deviceorientation", handleOrientation);

          // Remove triggers immediately so we never ask again
          window.removeEventListener("touchend", requestAccess);
          window.removeEventListener("click", requestAccess);
        } else {
          // Denied or Dismissed
          // Record the time. We won't ask again for 30 seconds.
          lastPermissionDenyTime.current = Date.now();
        }
      } catch (error) {
        console.warn("Gyro permission error", error);
        // Treat error as denial for cooldown purposes
        lastPermissionDenyTime.current = Date.now();
      }
    };

    // --- SETUP LISTENERS ---

    // A. Android / Standard Browsers (Auto-start, no permission needed)
    if (
      typeof window !== "undefined" &&
      window.DeviceOrientationEvent &&
      typeof window.DeviceOrientationEvent.requestPermission !== "function"
    ) {
      window.addEventListener("deviceorientation", handleOrientation);
      isPermissionGranted.current = true;
    }

    // B. iOS (Requires User Interaction)
    if (
      typeof window !== "undefined" &&
      typeof DeviceOrientationEvent !== "undefined" &&
      typeof DeviceOrientationEvent.requestPermission === "function"
    ) {
      // We use 'touchend' to capture the moment the user LIFTS their finger.
      // This covers swipes, scrolls, and taps.
      window.addEventListener("touchend", requestAccess);

      // Keep 'click' as a backup just in case
      window.addEventListener("click", requestAccess);
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("deviceorientation", handleOrientation);
        window.removeEventListener("touchend", requestAccess);
        window.removeEventListener("click", requestAccess);
      }
    };
  }, []);

  // --- LOGIC: TOUCH GESTURES ---
  const handleTouchStart = useCallback((e) => {
    const touch = e.touches[0];
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
    };
  }, []);

  const handleTouchEnd = useCallback(
    (e) => {
      if (!touchStartRef.current) return;
      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - touchStartRef.current.x;
      const deltaY = touch.clientY - touchStartRef.current.y;
      const deltaTime = Date.now() - touchStartRef.current.time;

      const isSwipe =
        Math.abs(deltaX) > 40 &&
        Math.abs(deltaX) > Math.abs(deltaY) * 1.5 &&
        deltaTime < 500;

      if (isSwipe) {
        if (deltaX > 0 && activeIndex > 0) {
          setActiveIndex((prev) => prev - 1);
        } else if (deltaX < 0 && activeIndex < activeProducts.length - 1) {
          setActiveIndex((prev) => prev + 1);
        }
      }
    },
    [activeIndex, activeProducts.length]
  );

  useEffect(() => {
    const element = document.querySelector(".three-d-container");
    if (!element) return;
    const handleTouchMove = (e) => {
      // Only prevent default if not scrolling horizontally in category bar
      if (!e.target.closest(".category-scroll")) {
        e.preventDefault();
      }
    };
    element.addEventListener("touchmove", handleTouchMove, { passive: false });
    return () => element.removeEventListener("touchmove", handleTouchMove);
  }, []);

  return (
    <div
      className="three-d-container relative w-full h-[100dvh] bg-black overflow-hidden select-none font-sans"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* --- REAL LOADER UI ---
         Controlled by 'active' from useProgress().
         Only visible when actual network requests are happening.
      */}
      <div
        className={`absolute inset-0 z-10 pointer-events-none transition-all duration-300 flex items-center justify-center
        ${
          active
            ? "backdrop-blur-md bg-black/40 opacity-100"
            : "backdrop-blur-0 bg-transparent opacity-0"
        }`}
      >
        {active && (
          <div className="w-10 h-10 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
        )}
      </div>

      <Scene
        activeProducts={activeProducts}
        activeIndex={activeIndex}
        gyroData={gyroData}
      />

      <UIOverlay
        restaurant={restaurant}
        categories={categories}
        activeCatId={activeCatId}
        setActiveCatId={setActiveCatId}
        focusedProduct={focusedProduct}
        // UI shows when loading finishes
        categoryMounted={!active}
      />
    </div>
  );
}
