"use client";

import {
  useRef,
  useMemo,
  useState,
  useEffect,
  Suspense,
  useLayoutEffect,
  useCallback,
} from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF, PresentationControls, Float } from "@react-three/drei";
import * as THREE from "three";
import { easing } from "maath";
import PosterImage from "./PosterImage";

// --- SETTINGS ---
const X_SPACING = 4.0;
const RENDER_WINDOW = 2;
const ITEM_SCALE_ACTIVE = 11;
const ITEM_SCALE_SIDE = 6;
const INTERACTION_TRIGGER_MS = 400; 

// --- GLOBAL CACHE TRACKER ---
const loadedUrls = new Set();

// --- COMPONENT: REAL MODEL ---
function RealModel({ url, productTitle, onLoad }) {
  const { scene } = useGLTF(url);
  const hasLogged = useRef(false);

  useLayoutEffect(() => {
    if (onLoad) onLoad();

    if (!hasLogged.current) {
      hasLogged.current = true;
      const isCached = loadedUrls.has(url);
      if (isCached) {
        console.log(`%c ⚡ CACHED: ${productTitle}`, "color: #00ffff");
      } else {
        console.log(`%c 📥 DL: ${productTitle}`, "color: #ff00ff");
        loadedUrls.add(url);
      }
    }
  }, [url, onLoad, productTitle]);

  const clone = useMemo(() => {
    const c = scene.clone();
    c.traverse((obj) => {
      if (obj.isMesh) {
        obj.castShadow = false;
        obj.receiveShadow = false;
        if (obj.material) {
          obj.material.envMapIntensity = 1.0;
          obj.material.roughness = 0.5;
          obj.material.needsUpdate = true;
        }
      }
    });
    return c;
  }, [scene]);

  return <primitive object={clone} />;
}

// --- COMPONENT: PLACEHOLDER ---
function PlaceholderMesh() {
  return (
    <mesh>
      <sphereGeometry args={[0.05, 4, 4]} />
      <meshBasicMaterial color="#444" wireframe opacity={0.2} transparent />
    </mesh>
  );
}

// --- MAIN COMPONENT ---
export default function FoodItem({
  product,
  index,
  activeIndex,
  gyroData,
  onLoad,
}) {
  const group = useRef();
  const contentRef = useRef();
  const posterRef = useRef(); 

  // --- STATE ---
  const [isTriggered, setIsTriggered] = useState(false);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [isInteracting, setIsInteracting] = useState(false);
  
  const timerRef = useRef(null);

  // Initial Load Notify
  useEffect(() => {
    if (onLoad) onLoad();
  }, [onLoad]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const isActive = index === activeIndex;
  const offset = index - activeIndex;
  const absOffset = Math.abs(offset);
  const isVisible = absOffset <= RENDER_WINDOW;

  useFrame((state, delta) => {
    if (!group.current) return;

    // A. POSTION & ROTATION (Base)
    const targetX = offset * X_SPACING;
    const targetZ = -Math.abs(offset) * 3;
    const targetY = -1;
    easing.damp3(group.current.position, [targetX, targetY, targetZ], 0.6, delta);

    const gyroX = gyroData.x;
    const gyroY = gyroData.y;

    if (isActive) {
      const currentScale = group.current.scale.x;
      group.current.scale.setScalar(
        THREE.MathUtils.lerp(currentScale, ITEM_SCALE_ACTIVE, delta * 6)
      );
      easing.dampE(group.current.rotation, [gyroX, gyroY, 0], 0.4, delta);
    } else {
      const currentScale = group.current.scale.x;
      group.current.scale.setScalar(
        THREE.MathUtils.lerp(currentScale, ITEM_SCALE_SIDE, delta * 6)
      );
      easing.dampE(group.current.rotation, [gyroX, offset * -0.2 + gyroY, 0], 0.4, delta);
      if (contentRef.current) {
        easing.dampE(contentRef.current.rotation, [0, 0, 0], 0.5, delta);
      }
    }
  });

  // --- INTERACTION ---
  const handlePointerDown = useCallback((e) => {
    if (!isActive || isTriggered) return;
    setIsInteracting(true);
    
    timerRef.current = setTimeout(() => {
      setIsTriggered(true);
    }, INTERACTION_TRIGGER_MS);
  }, [isActive, isTriggered]);

  const handlePointerUp = useCallback(() => {
    setIsInteracting(false);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const handleRealModelLoad = useCallback(() => {
    setIsModelLoaded(true);
    if (onLoad) onLoad(); 
  }, [onLoad]);

  if (!product) return null;
  if (!isVisible) return null;
  
  const showPoster = !isModelLoaded || isInteracting;
  
  return (
    <group ref={group}>
      <PresentationControls
        enabled={isActive}
        global={false}
        cursor={isActive}
        config={{ mass: 2, tension: 250, friction: 20 }}
        snap={false}
        rotation={[0, 0, 0]}
        polar={[-Math.PI / 4, Math.PI / 4]}
        azimuth={[-Infinity, Infinity]}
      >
        <Float speed={isActive ? 1.5 : 0} rotationIntensity={isActive ? 0.2 : 0} floatIntensity={0}>
          <group 
            ref={contentRef}
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
            onPointerOut={handlePointerUp}
          >
            <Suspense fallback={null}>
              {product?.model_url && isTriggered && (
                <RealModel
                  url={product.model_url}
                  productTitle={product.title?.en}
                  onLoad={handleRealModelLoad}
                />
              )}
            </Suspense>

            {(product.image_url) && (
               <group 
                 ref={posterRef} 
                 visible={showPoster || !isModelLoaded} 
               >
                   <PosterImage 
                   url={product.image_url} 
                   opacity={isModelLoaded ? 0 : 1} 
                   isLoading={isTriggered && !isModelLoaded}
                 />
               </group>
            )}

            {!product.model_url && !product.image_url && <PlaceholderMesh />}
          </group>
        </Float>
      </PresentationControls>
    </group>
  );
}
