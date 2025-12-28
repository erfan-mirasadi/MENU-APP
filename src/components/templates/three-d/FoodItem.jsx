"use client";

import { useRef, useMemo } from "react";
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

// --- 1. Real Model Component ---
function RealModel({ url }) {
  // Added error handling for empty URL just in case
  if (!url) return null;

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

// --- 2. Placeholder Mesh ---
function PlaceholderMesh() {
  return (
    <mesh>
      <sphereGeometry args={[0.3, 16, 16]} />
      <meshStandardMaterial color="#333" wireframe opacity={0.2} transparent />
    </mesh>
  );
}

// --- 3. Main Component ---
export default function FoodItem({
  product,
  index,
  activeIndex,
  categoryMounted,
}) {
  const group = useRef();
  const modelRef = useRef();

  // --- FIX: Guard Clause ---
  // If product is undefined, stop rendering immediately to prevent crash
  if (!product) return null;

  const isActive = index === activeIndex;
  const offset = index - activeIndex;
  const absOffset = Math.abs(offset);

  const shouldLoadModel = absOffset <= VISIBLE_RANGE;
  const isVisible = absOffset <= RENDER_WINDOW;

  useFrame((state, delta) => {
    if (!group.current) return;

    // --- A. Position Movement ---
    const targetX = offset * X_SPACING;
    const targetZ = -Math.abs(offset) * 3;
    const targetY = categoryMounted ? -1 : -12;
    easing.damp3(
      group.current.position,
      [targetX, targetY, targetZ],
      0.3,
      delta
    );

    // --- B. Rotation & Scale Management ---
    if (isActive) {
      const targetScale = ITEM_SCALE_ACTIVE;
      const currentScale = group.current.scale.x;
      group.current.scale.setScalar(
        THREE.MathUtils.lerp(currentScale, targetScale, delta * 5)
      );

      easing.dampE(group.current.rotation, [0, 0, 0], 0.4, delta);

      // Auto-rotate logic (optional)
      // if (modelRef.current) { ... }
    } else {
      const targetScale = ITEM_SCALE_SIDE;
      const currentScale = group.current.scale.x;
      group.current.scale.setScalar(
        THREE.MathUtils.lerp(currentScale, targetScale, delta * 5)
      );

      easing.dampE(group.current.rotation, [0, offset * -0.2, 0], 0.4, delta);

      if (modelRef.current) {
        easing.dampE(modelRef.current.rotation, [0, 0, 0], 0.5, delta);
      }
    }
  });

  if (!isVisible) return null;

  // Render logic cleaned up with Optional Chaining (?.)
  const content = (
    <group ref={modelRef}>
      {product?.model_url && shouldLoadModel ? (
        <RealModel url={product.model_url} index={index} />
      ) : (
        <PlaceholderMesh />
      )}
    </group>
  );

  return (
    <group ref={group}>
      <PresentationControls
        enabled={isActive}
        global={false}
        cursor={isActive}
        config={{ mass: 2, tension: 200 }}
        snap={false}
        rotation={[0, 0, 0]}
        polar={[-Math.PI / 4, Math.PI / 4]}
        azimuth={[-Infinity, Infinity]}
      >
        <Float
          speed={isActive ? 1 : 0}
          rotationIntensity={isActive ? 0.2 : 0}
          floatIntensity={isActive ? 0.5 : 0}
        >
          {content}
        </Float>
      </PresentationControls>
    </group>
  );
}
