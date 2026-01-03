"use client";

import { Image, Billboard, useTexture } from "@react-three/drei";
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { easing } from "maath";
import * as THREE from "three";

export default function PosterImage({ url, opacity = 1 }) {
  const ref = useRef();
  const texture = useTexture(url); // This will suspend if not loaded, ensuring we have dimensions
  
  const aspect = texture.image.width / texture.image.height;
  const BASE_HEIGHT = 0.14; 

  useFrame((state, delta) => {
    if (ref.current && ref.current.material) {
      // Smoothly damp opacity
      easing.damp(ref.current.material, "opacity", opacity, 0.25, delta);
    }
  });

  return (
    <Billboard follow={true} lockX={false} lockY={false} lockZ={false}>
      <Image 
        ref={ref}
        url={url}
        transparent
        opacity={opacity} 
        scale={[BASE_HEIGHT * aspect, BASE_HEIGHT, 1]} 
        side={THREE.DoubleSide}
        toneMapped={false}
      />
    </Billboard>
  );
}
