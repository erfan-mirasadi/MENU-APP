"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import Scene from "./Scene";
import UIOverlay from "./UIOverlay";

export default function ThreeDLayout({ restaurant, categories }) {
  console.log("🎨 3D Rendering...");
  const [activeCatId, setActiveCatId] = useState(categories[0]?.id);
  const [activeIndex, setActiveIndex] = useState(0);
  const [categoryMounted, setCategoryMounted] = useState(false);

  const touchStartRef = useRef({ x: 0, y: 0, time: 0 });

  // فیلتر کردن محصولات بر اساس دسته‌بندی
  const activeProducts = useMemo(() => {
    return categories.find((c) => c.id === activeCatId)?.products || [];
  }, [activeCatId, categories]);

  // محصولی که الان فوکوس روشه
  const focusedProduct = activeProducts[activeIndex] || activeProducts[0];

  useEffect(() => {
    setCategoryMounted(false);
    setActiveIndex(0);

    const timer = setTimeout(() => {
      setCategoryMounted(true);
    }, 100);
    return () => clearTimeout(timer);
  }, [activeCatId]);

  // Touch handlers
  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
    };
  };

  const handleTouchMove = (e) => {
    e.preventDefault();
    // PresentationControls handles rotation
  };

  const handleTouchEnd = (e) => {
    if (!touchStartRef.current) return;

    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = touch.clientY - touchStartRef.current.y;
    const deltaTime = Date.now() - touchStartRef.current.time;

    // ساده: swipe سریع و غالباً افقی
    const isSwipe =
      Math.abs(deltaX) > 60 &&
      Math.abs(deltaX) > Math.abs(deltaY) * 1.5 &&
      deltaTime < 500;

    if (isSwipe) {
      if (deltaX > 0 && activeIndex > 0) {
        setActiveIndex(activeIndex - 1);
      } else if (deltaX < 0 && activeIndex < activeProducts.length - 1) {
        setActiveIndex(activeIndex + 1);
      }
    }
  };

  return (
    <div
      className="relative w-full h-[100dvh] bg-black overflow-hidden select-none font-sans touch-none"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* لایه سه بعدی */}
      <Scene
        activeProducts={activeProducts}
        activeIndex={activeIndex}
        categoryMounted={categoryMounted}
      />

      {/* لایه رابط کاربری */}
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
