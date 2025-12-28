"use client";

import { useRef, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF, PresentationControls, Float } from "@react-three/drei";
import * as THREE from "three";
import { easing } from "maath";

// --- SETTINGS ---
const X_SPACING = 4.0;
const VISIBLE_RANGE = 1;
const RENDER_WINDOW = 2;
const ITEM_SCALE_ACTIVE = 10;
const ITEM_SCALE_SIDE = 6;

// --- 1. کامپوننت مدل واقعی ---
function RealModel({ url, index }) {
  const { scene } = useGLTF(url);

  const clone = useMemo(() => {
    const c = scene.clone();
    c.traverse((obj) => {
      if (obj.isMesh) {
        obj.castShadow = false;
        obj.receiveShadow = false;
        if (obj.material) {
          obj.material.envMapIntensity = 1.2;
          obj.material.roughness = 0.4;
          obj.material.needsUpdate = true;
        }
      }
    });
    return c;
  }, [scene]);

  return <primitive object={clone} />;
}

// --- 2. مش جایگزین ---
function PlaceholderMesh() {
  return (
    <mesh>
      <sphereGeometry args={[0.3, 16, 16]} />
      <meshStandardMaterial color="#333" wireframe opacity={0.2} transparent />
    </mesh>
  );
}

// --- 3. کامپوننت اصلی ---
export default function FoodItem({
  product,
  index,
  activeIndex,
  categoryMounted,
}) {
  const group = useRef(); // گروه اصلی (مکان و چرخش کلی)
  const modelRef = useRef(); // گروه مدل داخلی (چرخشی که کاربر داده)

  const isActive = index === activeIndex;
  const offset = index - activeIndex;
  const absOffset = Math.abs(offset);

  // لاجیک اپتیمایزیشن
  const shouldLoadModel = absOffset <= VISIBLE_RANGE;
  const isVisible = absOffset <= RENDER_WINDOW;

  useFrame((state, delta) => {
    if (!group.current) return;

    // --- A. حرکت مکان (Position) ---
    const targetX = offset * X_SPACING;
    const targetZ = -Math.abs(offset) * 3;
    const targetY = categoryMounted ? -1 : -12;
    easing.damp3(
      group.current.position,
      [targetX, targetY, targetZ],
      0.3,
      delta
    );

    // --- B. مدیریت چرخش و اسکیل ---
    if (isActive) {
      // 1. وقتی فعاله: اسکیل بزرگ بشه
      const targetScale = ITEM_SCALE_ACTIVE;
      const currentScale = group.current.scale.x;
      // اینجا اسکیل رو نرم تغییر میدیم
      group.current.scale.setScalar(
        THREE.MathUtils.lerp(currentScale, targetScale, delta * 5)
      );

      // 2. چرخش "گروه اصلی" باید صفر بشه (رو به دوربین)
      easing.dampE(group.current.rotation, [0, 0, 0], 0.4, delta);

      // 3. چرخش خودکار ریز (وقتی کاربر دست نمیزنه)
      // نکته: چون PresentationControls فعاله، این چرخش با چرخش کاربر جمع میشه
      if (modelRef.current) {
        // modelRef.current.rotation.y += delta * 0.1; // (اختیاری: چرخش مداوم)
      }
    } else {
      // 1. وقتی غیرفعاله (رفت کنار): اسکیل کوچک بشه
      const targetScale = ITEM_SCALE_SIDE;
      const currentScale = group.current.scale.x;
      group.current.scale.setScalar(
        THREE.MathUtils.lerp(currentScale, targetScale, delta * 5)
      );

      // 2. چرخش "گروه اصلی" به سمت داخل (Look at center)
      // این باعث میشه آیتم‌های کناری به سمت وسط کج بشن
      easing.dampE(group.current.rotation, [0, offset * -0.2, 0], 0.4, delta);

      // 3. (مهم‌ترین بخش) ریست کردن چرخش کاربر
      // اگر کاربر آیتم رو چرخانده باشه و ولش کنه بره آیتم بعدی،
      // این کد باعث میشه چرخش کاربر "نرم" صفر بشه و پرش نداشته باشه.
      if (modelRef.current) {
        easing.dampE(modelRef.current.rotation, [0, 0, 0], 0.5, delta);
      }
    }
  });

  if (!isVisible) return null;

  // رندر محتوا (جدا کردم برای تمیزی)
  const content = (
    <group ref={modelRef}>
      {product.model_url && shouldLoadModel ? (
        <RealModel url={product.model_url} index={index} />
      ) : (
        (!product.model_url || !shouldLoadModel) && <PlaceholderMesh />
      )}
    </group>
  );

  return (
    <group ref={group}>
      {/* تغییر بزرگ: 
         همیشه PresentationControls رو رندر می‌کنیم تا DOM عوض نشه و پرش نگیریم.
         فقط با enabled={isActive} کنترلش می‌کنیم.
      */}
      <PresentationControls
        enabled={isActive} // فقط وقتی وسطه تاچ کار کنه
        global={false}
        cursor={isActive}
        config={{ mass: 2, tension: 200 }} // یکم سنگین‌تر برای حس بهتر
        snap={false} // اسنپ خاموش تا ول کرد برنگerde
        rotation={[0, 0, 0]}
        polar={[-Math.PI / 4, Math.PI / 4]} // محدودیت عمودی
        azimuth={[-Infinity, Infinity]} // چرخش افقی آزاد
      >
        <Float
          speed={isActive ? 1 : 0} // وقتی غیرفعاله شناور نباشه که گیج نشه
          rotationIntensity={isActive ? 0.2 : 0}
          floatIntensity={isActive ? 0.5 : 0}
        >
          {content}
        </Float>
      </PresentationControls>
    </group>
  );
}
