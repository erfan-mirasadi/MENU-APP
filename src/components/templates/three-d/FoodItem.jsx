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
const VISIBLE_RANGE = 1;
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

    // A. TRANSITION EFFECT (Smooth Dissolve)
    // Logic: 
    // - If Model NOT loaded: Opacity 1, Scale 1 (relative to 0.15 base)
    // - If Model IS loaded: Opacity -> 0, Scale -> 1.5 (Dissolve out)
    
    if (posterRef.current) {
        // We want to fade OUT if model is loaded
        const targetOpacity = isModelLoaded ? 0 : 1;
        const targetScaleObj = isModelLoaded ? 1.5 : 1; 

        // Animate Opacity
        // We access the child Image material indirectly or pass props, 
        // BUT Drei Image updates on prop change. 
        // For smooth per-frame animation, we need to manipulate the material directly if possible, or ref.
        // However, PosterImage wraps Drei Image.
        // Let's pass a ref or control simple uniform if possible.
        // Or simpler: Standard damp on opacity prop? No, that causes re-renders.
        // We will try to rely on Drei Image's internal handling or just prop updates if framerate allows.
        // Actually, let's use the REF to the billboard/image group to scale it.
        
        const currentScale = posterRef.current.scale.x; 
        // posterRef is a GROUP around the PosterImage
        
        easing.damp(posterRef.current.scale, "x", targetScaleObj, 0.25, delta);
        easing.damp(posterRef.current.scale, "y", targetScaleObj, 0.25, delta);
        easing.damp(posterRef.current.scale, "z", targetScaleObj, 0.25, delta);
        
        // For Opacity, we might need a custom approach if we want NO re-renders.
        // But for now, let's assume `PosterImage` can take a dynamic opacity ref? 
        // Or we just accept react re-renders for opacity.
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

  // We only fully unmount the poster if:
  // 1. Model is Loaded AND
  // 2. User is NOT interacting (so we don't break the drag) AND
  // 3. (Optional) Transition is "done" (we can guess by time or state)
  // To keep it simple: Keep poster mounted as long as interaction is active OR model not loaded.
  
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
        <Float speed={isActive ? 1.5 : 0} rotationIntensity={isActive ? 0.2 : 0} floatIntensity={isActive ? 0.5 : 0}>
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

            {/* Poster Group with Ref for Animation */}
            {/* We Render it if showPoster is true, OR if we need to animate it out... */}
            {/* Actually, if we unmount it, we can't animate it out. */}
            {/* So we should keep it mounted until opacity is effectively 0 AND !interacting */}
            
            {(product.image_url) && (
               <group 
                 ref={posterRef} 
                 visible={showPoster || !isModelLoaded} // Visibility toggle
               >
                 {/* 
                    We pass a prop to PosterImage to handle opacity locally or 
                    we use the fact that it's unmounting?
                    Wait, if I use `visible={false}`, it breaks raycast?
                    YES. `visible=false` disables raycast.
                    
                    SO: We must keep `visible={true}` while `isInteracting` is true.
                    
                    Transition visual:
                    We need to pass the opacity down. 
                    Since we can't easily animate props in useFrame without re-renders, 
                    we will use a simple CSS-like logic: 
                    If isModelLoaded -> Opacity prop = 0.
                    Drei Image will handle transition? No.
                    
                    Let's create a wrapper that applies opacity to children materials? 
                    Too complex.
                    
                    Simpler: Just set opacity based on `isModelLoaded` and rely on React spring or CSS transition? 
                    React Three Fiber doesn't have CSS transitions.
                    
                    Let's use `AnimatedPoster`? 
                    
                    Okay, we will pass `opacity={isModelLoaded ? 0 : 1}` 
                    AND we need `PosterImage` to animate that change. 
                 */}
                 <PosterImage 
                   url={product.image_url} 
                   opacity={isModelLoaded ? 0 : 1} 
                   isTransitioning={isModelLoaded}
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
