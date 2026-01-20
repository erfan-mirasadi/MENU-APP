'use client'
import * as THREE from 'three'
import { PerspectiveCamera, RoundedBox, Text, useTexture } from '@react-three/drei'

// 1. Shared Camera Setup
export function MapCamera() {
    return (
        <PerspectiveCamera makeDefault fov={10} position={[-60, 80, 100]} />
    )
}

// 2. Shared Floor (Wood Parquet)
export function MapFloor() {
    const texture = useTexture('/textures/wood_parquet.png')
    
    // Repeat texture
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping
    texture.repeat.set(10, 10)
    texture.colorSpace = THREE.SRGBColorSpace

    return (
        <mesh 
            rotation={[-Math.PI / 2, 0, 0]} 
            position={[0, -0.4, 0]} 
            receiveShadow
        >
            <planeGeometry args={[70, 70]} />
            <meshStandardMaterial map={texture} roughness={0.8} />
        </mesh>
    )
}

// 3. Shared Table Visuals (Body + Legs + Text)
// Does NOT include: Interaction logic, Avatars, or Status Animations
export function TableVisual({ width, depth, tableNumber, color = '#FDFBF7', materialRef }) {
    return (
        <group>
             {/* Table Body - RoundedBox */}
            <RoundedBox args={[width, 0.5, depth]} radius={0.15} smoothness={4}>
                <meshStandardMaterial 
                    ref={materialRef} // Allow parent to animate color/emissive if needed
                    color={color}
                    roughness={0.2} 
                    metalness={0.1} 
                />
            </RoundedBox>
            
            {/* Table Number */}
            <Text
                position={[0, 0.26, 0]} 
                rotation={[-Math.PI / 2, 0, 0]} 
                fontSize={Math.min(width, depth) * 0.35} 
                maxWidth={width * 0.8} 
                font="https://fonts.gstatic.com/s/bitcountpropsingle/v3/-W-gXIv9SyXT0xz0E9pIHCxbW8ZMGEVdhz4VoumsGFhzYseFqK9f_KOwYjYsHSocfu1DlxztzQH877SgJ2SUzQ4SJdODLz0JoLU3vXFrqXQooCdbs921GXZlLGU.ttf"
                color="#1f2937" 
                anchorX="center"
                anchorY="middle"
                fillOpacity={0.9}
                letterSpacing={-0.05}
            >
                {tableNumber}
            </Text>

             {/* Simple Rectangular Legs (3 Corners) */}
             <group position={[0, -0.35, 0]}>
                {/* Corner 1 (Front Right) */}
                <mesh position={[width / 2 - 0.1, 0, depth / 2 - 0.1]}>
                    <boxGeometry args={[0.15, 0.35, 0.15]} />
                    <meshStandardMaterial color="#4b5563" /> 
                </mesh>
                {/* Corner 2 (Front Left) */}
                <mesh position={[-width / 2 + 0.1, 0, depth / 2 - 0.1]}>
                    <boxGeometry args={[0.15, 0.35, 0.15]} />
                    <meshStandardMaterial color="#4b5563" />
                </mesh>
                {/* Corner 3 (Back Left) */}
                <mesh position={[-width / 2 + 0.1, 0, -depth / 2 + 0.1]}>
                    <boxGeometry args={[0.15, 0.35, 0.15]} />
                    <meshStandardMaterial color="#4b5563" />
                </mesh>
            </group>
        </group>
    )
}
