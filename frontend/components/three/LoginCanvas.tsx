'use client';
import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { MeshDistortMaterial, Float } from '@react-three/drei';
import * as THREE from 'three';

function AnimatedShield() {
  const meshRef = useRef<THREE.Mesh>(null!);
  useFrame((state) => {
    meshRef.current.rotation.y = state.clock.elapsedTime * 0.4;
    meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
  });

  return (
    <Float speed={1.5} rotationIntensity={0.3} floatIntensity={1.2}>
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[1.6, 1]} />
        <MeshDistortMaterial
          color="#1e40af"
          attach="material"
          distort={0.25}
          speed={2}
          roughness={0.05}
          metalness={0.9}
          transparent
          opacity={0.9}
        />
      </mesh>
    </Float>
  );
}

function Ring() {
  const ringRef = useRef<THREE.Mesh>(null!);
  useFrame((state) => {
    ringRef.current.rotation.x = state.clock.elapsedTime * 0.3;
    ringRef.current.rotation.y = state.clock.elapsedTime * 0.5;
  });
  return (
    <mesh ref={ringRef}>
      <torusGeometry args={[2.5, 0.03, 16, 80]} />
      <meshBasicMaterial color="#3b82f6" transparent opacity={0.4} />
    </mesh>
  );
}

function Ring2() {
  const ringRef = useRef<THREE.Mesh>(null!);
  useFrame((state) => {
    ringRef.current.rotation.x = -state.clock.elapsedTime * 0.2;
    ringRef.current.rotation.z = state.clock.elapsedTime * 0.4;
  });
  return (
    <mesh ref={ringRef}>
      <torusGeometry args={[3.2, 0.02, 16, 80]} />
      <meshBasicMaterial color="#8b5cf6" transparent opacity={0.25} />
    </mesh>
  );
}

export function LoginCanvas() {
  return (
    <Canvas
      className="absolute inset-0"
      camera={{ position: [0, 0, 7], fov: 55 }}
      gl={{ antialias: true, alpha: true }}
    >
      <ambientLight intensity={0.2} />
      <pointLight position={[4, 4, 4]} intensity={2} color="#3b82f6" />
      <pointLight position={[-4, -4, 4]} intensity={1} color="#8b5cf6" />
      <AnimatedShield />
      <Ring />
      <Ring2 />
    </Canvas>
  );
}
