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
  // غیرفعال کردن اسکرول عمودی صفحه
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
        dpr={[1, 1.5]} // قفل کردن کیفیت برای موبایل
        camera={{ position: [0, 0, 12], fov: 35 }}
        gl={{
          antialias: false,
          toneMapping: 4, // ACESFilmic
          powerPreference: "high-performance",
        }}
        performance={{ min: 0.5 }} // کاهش کیفیت اگر فریم پایین اومد
      >
        <color attach="background" args={["#000000"]} />
        <Environment preset="city" blur={0.8} />
        <ambientLight intensity={0.6} />
        <spotLight
          position={[10, 10, 10]}
          angle={0.3}
          penumbra={1}
          intensity={1}
          color="#fff"
        />

        <Sparkles count={50} scale={30} size={4} speed={0.3} opacity={0.2} />

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
            scale={30}
            blur={1.5}
            far={8}
            color="#000000"
            resolution={256} // کم کردن رزولوشن برای موبایل
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
