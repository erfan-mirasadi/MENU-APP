"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import Scene from "./Scene";
import UIOverlay from "./UIOverlay";
import { useGLTF } from "@react-three/drei";

export default function ThreeDLayout({ restaurant, categories }) {
  const [activeCatId, setActiveCatId] = useState(categories[0]?.id);
  const [activeIndex, setActiveIndex] = useState(0);
  const [categoryMounted, setCategoryMounted] = useState(false);

  const touchStartRef = useRef({ x: 0, y: 0, time: 0 });

  const activeProducts = useMemo(() => {
    return categories.find((c) => c.id === activeCatId)?.products || [];
  }, [activeCatId, categories]);

  const focusedProduct = activeProducts[activeIndex] || activeProducts[0];

  useEffect(() => {
    setCategoryMounted(false);
    setActiveIndex(0);
    const timer = setTimeout(() => setCategoryMounted(true), 100);
    return () => clearTimeout(timer);
  }, [activeCatId]);

  // --- 🔥 SMART PRELOAD SYSTEM ---
  useEffect(() => {
    if (!activeProducts.length) return;

    // همیشه آیتم بعدی (Next) و قبلی (Prev) رو پیش‌دانلود کن
    // این باعث میشه وقتی کاربر سوایپ میکنه، مدل آماده باشه
    const nextIndex = activeIndex + 1;
    const prevIndex = activeIndex - 1;

    if (nextIndex < activeProducts.length) {
      const url = activeProducts[nextIndex].model_url;
      if (url) {
        console.log(`🔄 Preloading Next: [${nextIndex}]`);
        useGLTF.preload(url);
      }
    }

    if (prevIndex >= 0) {
      const url = activeProducts[prevIndex].model_url;
      if (url) {
        // useGLTF خودش کش رو مدیریت میکنه، اگه باشه دوباره دانلود نمیکنه
        useGLTF.preload(url);
      }
    }
  }, [activeIndex, activeProducts]);

  // Touch Logic (بدون تغییر، چون خوب بود)
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
        Math.abs(deltaX) > 50 && // حساسیت رو کمی بیشتر کردم
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
    const handleTouchMove = (e) => e.preventDefault();
    element.addEventListener("touchmove", handleTouchMove, { passive: false });
    return () => element.removeEventListener("touchmove", handleTouchMove);
  }, []);

  return (
    <div
      className="three-d-container relative w-full h-[100dvh] bg-black overflow-hidden select-none font-sans touch-none"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <Scene
        activeProducts={activeProducts}
        activeIndex={activeIndex}
        categoryMounted={categoryMounted}
      />

      <UIOverlay
        restaurant={restaurant}
        categories={categories}
        activeCatId={activeCatId}
        setActiveCatId={setActiveCatId}
        focusedProduct={focusedProduct}
        categoryMounted={categoryMounted}
      />
    </div>
  );
}
