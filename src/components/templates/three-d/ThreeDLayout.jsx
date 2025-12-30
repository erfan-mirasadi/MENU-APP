"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import Scene from "./Scene";
import UIOverlay from "./UIOverlay";
import { useGLTF, useProgress } from "@react-three/drei";

// --- GLOBAL VARIABLES ---
// Shared object for gyroscope data to avoid React re-renders.
const gyroData = { x: 0, y: 0 };
const GYRO_INTENSITY = 40;

export default function ThreeDLayout({ restaurant, categories }) {
  // --- STATE MANAGEMENT ---
  const [activeCatId, setActiveCatId] = useState(categories[0]?.id);
  const [activeIndex, setActiveIndex] = useState(0);

  // REAL LOADER LOGIC
  const { active } = useProgress();

  const touchStartRef = useRef({ x: 0, y: 0, time: 0 });

  // Track the last time permission was denied to handle the 30s cooldown
  const lastPermissionDenyTime = useRef(0);

  // Compute active products
  const activeProducts = useMemo(() => {
    return categories.find((c) => c.id === activeCatId)?.products || [];
  }, [activeCatId, categories]);

  const focusedProduct = activeProducts[activeIndex] || activeProducts[0];

  // --- LOGIC: CATEGORY TRANSITION ---
  useEffect(() => {
    setActiveIndex(0);
    useGLTF.clear();
  }, [activeCatId]);

  // --- LOGIC: SMART PRELOADING ---
  useEffect(() => {
    if (!activeProducts.length) return;
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

  // --- LOGIC: GYROSCOPE SENSOR (iOS Permission + 30s Retry Logic) ---
  useEffect(() => {
    const handleOrientation = (event) => {
      gyroData.x = (event.beta || 0) / GYRO_INTENSITY;
      gyroData.y = (event.gamma || 0) / GYRO_INTENSITY;
    };

    // Function to request permission (Only for iOS 13+)
    const requestAccess = async () => {
      // 1. Check if the API exists (iOS check)
      if (
        typeof DeviceOrientationEvent === "undefined" ||
        typeof DeviceOrientationEvent.requestPermission !== "function"
      ) {
        return;
      }

      // 2. Check Cooldown (30 Seconds)
      // If user denied recently, don't annoy them immediately.
      const now = Date.now();
      if (now - lastPermissionDenyTime.current < 30000) {
        return;
      }

      try {
        // 3. Request Permission
        const permission = await DeviceOrientationEvent.requestPermission();

        if (permission === "granted") {
          // Success: Attach sensor and remove the click listener forever
          window.addEventListener("deviceorientation", handleOrientation);
          window.removeEventListener("click", requestAccess);
        } else {
          // Denied/Canceled: Record time to start 30s cooldown
          lastPermissionDenyTime.current = Date.now();
        }
      } catch (error) {
        console.warn("Gyro permission error or denied", error);
        // Treat error as denial for cooldown purposes
        lastPermissionDenyTime.current = Date.now();
      }
    };

    // --- SETUP LISTENERS ---

    // A. Android / Standard Browsers (No permission needed)
    if (
      typeof window !== "undefined" &&
      window.DeviceOrientationEvent &&
      typeof window.DeviceOrientationEvent.requestPermission !== "function"
    ) {
      window.addEventListener("deviceorientation", handleOrientation);
    }

    // B. iOS (Requires User Interaction)
    if (
      typeof window !== "undefined" &&
      typeof DeviceOrientationEvent !== "undefined" &&
      typeof DeviceOrientationEvent.requestPermission === "function"
    ) {
      // We use 'click' because it triggers AFTER the user lifts their finger (Touch End).
      // This satisfies the requirement: "az vaqti k avalin touch ro anjam mide va dastesho barmidare"
      window.addEventListener("click", requestAccess);
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("deviceorientation", handleOrientation);
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
      {/* LOADER UI */}
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
        categoryMounted={!active}
      />
    </div>
  );
}
