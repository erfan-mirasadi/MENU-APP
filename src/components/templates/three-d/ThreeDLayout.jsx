"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import Scene from "./Scene";
import UIOverlay from "./UIOverlay";
import { useGLTF, useProgress } from "@react-three/drei";

// --- GLOBAL VARIABLES ---
const gyroData = { x: 0, y: 0 };
const GYRO_INTENSITY = 40;

export default function ThreeDLayout({ restaurant, categories }) {
  // --- STATE MANAGEMENT ---
  const [activeCatId, setActiveCatId] = useState(categories[0]?.id);
  const [activeIndex, setActiveIndex] = useState(0);

  // State مخصوص نمایش دکمه شروع برای آیفون
  const [showIOSPermissionCard, setShowIOSPermissionCard] = useState(false);

  // REAL LOADER LOGIC
  const { active } = useProgress();

  const touchStartRef = useRef({ x: 0, y: 0, time: 0 });

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

  // --- LOGIC: GYROSCOPE & PERMISSION CHECK ---
  useEffect(() => {
    const handleOrientation = (event) => {
      gyroData.x = (event.beta || 0) / GYRO_INTENSITY;
      gyroData.y = (event.gamma || 0) / GYRO_INTENSITY;
    };

    // 1. Android / PC (Auto Start)
    if (
      typeof window !== "undefined" &&
      window.DeviceOrientationEvent &&
      typeof window.DeviceOrientationEvent.requestPermission !== "function"
    ) {
      // اندروید نیازی به اجازه ندارد
      window.addEventListener("deviceorientation", handleOrientation);
      setShowIOSPermissionCard(false); // کارت مخفی
    }
    // 2. iOS Detection (Show Card)
    else if (
      typeof window !== "undefined" &&
      typeof DeviceOrientationEvent !== "undefined" &&
      typeof DeviceOrientationEvent.requestPermission === "function"
    ) {
      // اگر آیفون بود، کارت رو نشون بده تا کاربر کلیک کنه
      setShowIOSPermissionCard(true);
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("deviceorientation", handleOrientation);
      }
    };
  }, []);

  // --- FUNCTION: Handle iOS Button Click ---
  const handleIOSStart = async () => {
    try {
      // درخواست مستقیم روی کلیک دکمه (این همیشه کار میکنه)
      const permission = await DeviceOrientationEvent.requestPermission();

      if (permission === "granted") {
        // اگر اجازه داد، سنسور رو وصل کن و کارت رو بردار
        window.addEventListener("deviceorientation", (event) => {
          gyroData.x = (event.beta || 0) / GYRO_INTENSITY;
          gyroData.y = (event.gamma || 0) / GYRO_INTENSITY;
        });
        setShowIOSPermissionCard(false);
      } else {
        // اگر کنسل کرد، کارت میمونه ولی شاید متنی نشون بدی (اختیاری)
        alert("برای تجربه سه بعدی، لطفا اجازه دسترسی به سنسور را بدهید.");
      }
    } catch (error) {
      console.error(error);
      // در صورت ارور هم کارت رو برمیداریم که سایت بلاک نشه (بدون سنسور کار کنه)
      setShowIOSPermissionCard(false);
    }
  };

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
      {/* --- IOS PERMISSION OVERLAY (فقط برای آیفون میاد) --- */}
      {showIOSPermissionCard && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-md">
          {/* لوگو یا عکس رستوران میتونه اینجا باشه */}
          <h2 className="text-white text-xl font-bold mb-2">Welcome</h2>
          <p className="text-white/70 text-sm mb-6 px-8 text-center">
            Tap below to enter the immersive experience.
          </p>
          <button
            onClick={handleIOSStart}
            className="px-8 py-3 bg-white text-black font-bold rounded-full animate-pulse active:scale-95 transition-transform"
          >
            Enter Experience
          </button>
        </div>
      )}

      {/* --- LOADER UI --- */}
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
