"use client";
import { Canvas } from '@react-three/fiber';
import { Float, ContactShadows, Environment, useTexture, PresentationControls } from '@react-three/drei';
import * as THREE from 'three';
import { Suspense } from 'react';

function FloatingMagnets() {
  // Using some placeholder aesthetic images for the floating 3D magnets
  const [tex1, tex2, tex3, tex4] = useTexture([
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&q=80',
    'https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=400&q=80',
    'https://images.unsplash.com/photo-1557682224-5b8590cd9ec5?w=400&q=80',
    'https://images.unsplash.com/photo-1574169208507-84376144848b?w=400&q=80'
  ]);

  tex1.colorSpace = THREE.SRGBColorSpace;
  tex2.colorSpace = THREE.SRGBColorSpace;
  tex3.colorSpace = THREE.SRGBColorSpace;
  tex4.colorSpace = THREE.SRGBColorSpace;

  return (
    <>
      <Float speed={1.5} rotationIntensity={1.5} floatIntensity={2}>
        <mesh position={[-3, 1, -2]}>
          <boxGeometry args={[1.5, 1.5, 0.2]} />
          <meshStandardMaterial attach="material-0" color="#fff" />
          <meshStandardMaterial attach="material-1" color="#fff" />
          <meshStandardMaterial attach="material-2" color="#fff" />
          <meshStandardMaterial attach="material-3" color="#fff" />
          <meshStandardMaterial attach="material-4" map={tex1} roughness={0.1} metalness={0.1} />
          <meshStandardMaterial attach="material-5" color="#111" />
        </mesh>
      </Float>
      
      <Float speed={2} rotationIntensity={2} floatIntensity={1.5}>
        <mesh position={[3, -1, -1]} rotation={[Math.PI/2, 0, 0]}>
          <cylinderGeometry args={[1, 1, 0.2, 64]} />
          <meshStandardMaterial attach="material-0" color="#111" />
          <meshStandardMaterial attach="material-1" map={tex2} roughness={0.1} metalness={0.1} />
          <meshStandardMaterial attach="material-2" color="#fff" />
        </mesh>
      </Float>

      <Float speed={1} rotationIntensity={1} floatIntensity={3}>
        <mesh position={[0, -2.5, -3]}>
          <boxGeometry args={[2, 2, 0.2]} />
          <meshStandardMaterial attach="material-0" color="#fff" />
          <meshStandardMaterial attach="material-1" color="#fff" />
          <meshStandardMaterial attach="material-2" color="#fff" />
          <meshStandardMaterial attach="material-3" color="#fff" />
          <meshStandardMaterial attach="material-4" map={tex3} roughness={0.1} metalness={0.1} />
          <meshStandardMaterial attach="material-5" color="#111" />
        </mesh>
      </Float>
      
      <Float speed={1.8} rotationIntensity={1.2} floatIntensity={2.5}>
        <mesh position={[-2, -2, -1.5]} rotation={[Math.PI/2, 0, 0]}>
          <cylinderGeometry args={[0.8, 0.8, 0.2, 64]} />
          <meshStandardMaterial attach="material-0" color="#111" />
          <meshStandardMaterial attach="material-1" map={tex4} roughness={0.1} metalness={0.1} />
          <meshStandardMaterial attach="material-2" color="#fff" />
        </mesh>
      </Float>
    </>
  );
}

export default function Scene() {
  return (
    <div className="canvas-interactive">
      <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
        <ambientLight intensity={0.8} />
        <directionalLight position={[10, 10, 10]} intensity={1.5} />
        <Environment preset="city" />
        <PresentationControls
          global
          rotation={[0.13, 0.1, 0]}
          polar={[-0.4, 0.2]}
          azimuth={[-1, 0.75]}
        >
          <Suspense fallback={null}>
            <FloatingMagnets />
          </Suspense>
        </PresentationControls>
        <ContactShadows position={[0, -3.5, 0]} opacity={0.4} scale={20} blur={2} far={4} />
      </Canvas>
    </div>
  );
}
