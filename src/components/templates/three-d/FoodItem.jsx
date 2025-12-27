"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF, PresentationControls, Float } from "@react-three/drei";
import * as THREE from "three";
import { easing } from "maath";

// --- SETTINGS (قابل تغییر همینجا) ---
const X_SPACING = 4.0; // فاصله افقی بین آیتم‌ها
const RENDER_WINDOW = 3; // تعداد آیتم‌های قابل رویت (برای پرفورمنس)
const ITEM_SCALE_ACTIVE = 7.0; // سایز آیتم وسطی
const ITEM_SCALE_SIDE = 4.5; // سایز آیتم‌های کناری

// --- کامپوننت داخلی: وقتی مدل لود نمیشه یا url نیست ---
function PlaceholderMesh() {
  return (
    <mesh>
      <sphereGeometry args={[1, 16, 16]} /> {/* کاهش segments برای موبایل */}
      <meshStandardMaterial color="#333" wireframe />
    </mesh>
  );
}

// --- کامپوننت داخلی: لودر ایمن مدل ---
function ModelLoader({ url }) {
  const { scene } = useGLTF(url, true);
  const clone = useMemo(() => {
    const c = scene.clone();
    c.traverse((obj) => {
      if (obj.isMesh) {
        obj.castShadow = false;
        obj.receiveShadow = false;
        if (obj.material) {
          obj.material.envMapIntensity = 1.5;
          obj.material.roughness = 0.4;
        }
      }
    });
    return c;
  }, [scene]);

  return <primitive object={clone} />;
}

export default function FoodItem({
  product,
  index,
  activeIndex,
  categoryMounted,
}) {
  const group = useRef();
  const modelRef = useRef();
  const isActive = index === activeIndex;

  const offset = index - activeIndex;
  const absOffset = Math.abs(offset);
  // لاجیک اپتیمایزیشن:
  const isVisible = absOffset <= RENDER_WINDOW;

  if (product.model_url) useGLTF.preload(product.model_url);

  useFrame((state, delta) => {
    if (!group.current) return;

    // محاسبات مکان (Layout Logic)
    const targetX = offset * X_SPACING;
    const targetZ = -Math.abs(offset) * 3;
    const targetY = categoryMounted ? -1 : -12;

    easing.damp3(
      group.current.position,
      [targetX, targetY, targetZ],
      0.3,
      delta
    );

    if (!isActive) {
      // انیمیشن آیتم‌های کناری
      easing.dampE(group.current.rotation, [0, offset * -0.2, 0], 0.4, delta);
      group.current.scale.setScalar(
        THREE.MathUtils.lerp(group.current.scale.x, ITEM_SCALE_SIDE, delta * 5)
      );
    } else {
      // انیمیشن آیتم وسط (فعال)
      group.current.scale.setScalar(
        THREE.MathUtils.lerp(
          group.current.scale.x,
          ITEM_SCALE_ACTIVE,
          delta * 5
        )
      );

      // چرخش خودکار نرم وقتی کاربر دست نمیزنه
      if (modelRef.current) {
        modelRef.current.rotation.y += delta * 0.2;
        modelRef.current.rotation.x += delta * 0.15;
      }
    }
  });

  if (!isVisible) return null;

  return (
    <group ref={group}>
      {isActive ? (
        <PresentationControls
          global={false}
          cursor={true}
          config={{ mass: 1, tension: 170 }}
          snap={false}
          rotation={[0, 0, 0]}
          polar={[-Math.PI / 3, Math.PI / 3]}
          azimuth={[-Math.PI, Math.PI]}
        >
          <Float
            speed={2}
            rotationIntensity={0.2}
            floatIntensity={0.5}
            floatingRange={[-0.2, 0.2]}
          >
            <group ref={modelRef}>
              {product.model_url ? (
                <ModelLoader url={product.model_url} />
              ) : (
                <PlaceholderMesh />
              )}
            </group>
          </Float>
        </PresentationControls>
      ) : (
        <group opacity={0.3} rotation={[0.4, 0, 0]}>
          {product.model_url ? (
            <ModelLoader url={product.model_url} />
          ) : (
            <PlaceholderMesh />
          )}
        </group>
      )}
    </group>
  );
}
