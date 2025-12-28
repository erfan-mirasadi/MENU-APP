"use client";

import { Canvas } from "@react-three/fiber";
import { Environment, ContactShadows, Sparkles } from "@react-three/drei";
import { Suspense, useEffect } from "react";
import FoodItem from "./FoodItem";

function LinearCarousel({ products, activeIndex, categoryMounted }) {
  return (
    <group>
      {products.map((product, i) => (
        <FoodItem
          key={product.id}
          index={i}
          product={product}
          activeIndex={activeIndex}
          categoryMounted={categoryMounted}
        />
      ))}
    </group>
  );
}

export default function Scene({
  activeProducts,
  activeIndex,
  categoryMounted,
}) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <div className="absolute inset-0 z-0">
      <Canvas
        shadows={false}
        dpr={[1, 1.5]} // کیفیت رو محدود نگه دار برای پرفورمنس
        camera={{ position: [0, 0, 12], fov: 35 }}
        gl={{
          antialias: false, // آنتی‌الیاس خاموش (خیلی تاثیر داره تو سرعت موبایل)
          toneMapping: 4,
          powerPreference: "high-performance",
          failIfMajorPerformanceCaveat: true,
        }}
      >
        <color attach="background" args={["#000000"]} />
        {/* Environment سنگینه، رزولوشن رو کم کردم */}
        <Environment preset="city" blur={0.8} resolution={256} />
        <ambientLight intensity={0.6} />
        <spotLight
          position={[10, 10, 10]}
          angle={0.3}
          penumbra={1}
          intensity={1}
          color="#fff"
        />

        <Sparkles count={30} scale={20} size={4} speed={0.3} opacity={0.2} />

        {/* Suspense باعث میشه تا وقتی مدل لود نشده، یه چیز دیگه (یا هیچی) نشون بده */}
        <Suspense fallback={null}>
          {activeProducts.length > 0 && (
            <LinearCarousel
              products={activeProducts}
              activeIndex={activeIndex}
              categoryMounted={categoryMounted}
            />
          )}

          <ContactShadows
            position={[0, -4, 0]}
            opacity={0.4}
            scale={20}
            blur={2}
            far={4} // سایه رو محدودتر کردم
            resolution={128} // رزولوشن سایه رو نصف کردم (خیلی سبکتره)
            color="#000000"
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
