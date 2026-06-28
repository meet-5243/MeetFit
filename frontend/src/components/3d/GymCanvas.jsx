import React, { useRef, useState, useEffect, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';

// 1. Dumbbell Component
function DumbbellMesh({ position, rotationScale = 1 }) {
  const meshRef = useRef();

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.005 * rotationScale;
      meshRef.current.rotation.x += 0.002 * rotationScale;
    }
  });

  return (
    <group ref={meshRef} position={position} scale={[0.8, 0.8, 0.8]}>
      {/* Shaft */}
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.08, 0.08, 1.8, 16]} />
        <meshStandardMaterial color="#334155" metalness={0.9} roughness={0.2} />
      </mesh>
      {/* Weight heads */}
      <mesh position={[-0.8, 0, 0]}>
        <sphereGeometry args={[0.35, 16, 16]} />
        <meshStandardMaterial color="#00E5FF" metalness={0.8} roughness={0.3} emissive="#00E5FF" emissiveIntensity={0.2} />
      </mesh>
      <mesh position={[0.8, 0, 0]}>
        <sphereGeometry args={[0.35, 16, 16]} />
        <meshStandardMaterial color="#00E5FF" metalness={0.8} roughness={0.3} emissive="#00E5FF" emissiveIntensity={0.2} />
      </mesh>
    </group>
  );
}

// 2. Barbell with Weight Plates
function BarbellMesh({ position }) {
  const meshRef = useRef();

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.003;
      meshRef.current.rotation.z += 0.001;
    }
  });

  return (
    <group ref={meshRef} position={position} scale={[0.7, 0.7, 0.7]}>
      {/* Bar */}
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.06, 0.06, 3.5, 16]} />
        <meshStandardMaterial color="#94A3B8" metalness={0.95} roughness={0.1} />
      </mesh>
      {/* Left Plates */}
      <mesh position={[-1.4, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.6, 0.6, 0.12, 24]} />
        <meshStandardMaterial color="#FF6B35" metalness={0.6} roughness={0.4} emissive="#FF6B35" emissiveIntensity={0.15} />
      </mesh>
      <mesh position={[-1.25, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.5, 0.5, 0.1, 24]} />
        <meshStandardMaterial color="#1E293B" metalness={0.8} roughness={0.3} />
      </mesh>
      {/* Right Plates */}
      <mesh position={[1.4, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.6, 0.6, 0.12, 24]} />
        <meshStandardMaterial color="#FF6B35" metalness={0.6} roughness={0.4} emissive="#FF6B35" emissiveIntensity={0.15} />
      </mesh>
      <mesh position={[1.25, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.5, 0.5, 0.1, 24]} />
        <meshStandardMaterial color="#1E293B" metalness={0.8} roughness={0.3} />
      </mesh>
    </group>
  );
}

// 3. Stylized Figure doing Overhead Press
function LifterMesh({ position }) {
  const groupRef = useRef();
  const armsRef = useRef();

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(t * 0.5) * 0.2;
    }
    if (armsRef.current) {
      // Loop overhead press motion (Y axis movement up and down)
      armsRef.current.position.y = 1.2 + Math.sin(t * 2) * 0.4;
    }
  });

  return (
    <group ref={groupRef} position={position} scale={[0.6, 0.6, 0.6]}>
      {/* Head */}
      <mesh position={[0, 1.8, 0]}>
        <sphereGeometry args={[0.22, 16, 16]} />
        <meshStandardMaterial color="#00E5FF" metalness={0.5} roughness={0.3} emissive="#00E5FF" emissiveIntensity={0.3} />
      </mesh>
      {/* Torso */}
      <mesh position={[0, 1.0, 0]}>
        <cylinderGeometry args={[0.3, 0.2, 1.1, 16]} />
        <meshStandardMaterial color="#1E293B" metalness={0.7} roughness={0.4} />
      </mesh>
      {/* Animated Arms & Barbell Press */}
      <group ref={armsRef} position={[0, 1.2, 0]}>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.04, 0.04, 2.2, 16]} />
          <meshStandardMaterial color="#00E5FF" metalness={0.9} emissive="#00E5FF" emissiveIntensity={0.4} />
        </mesh>
      </group>
    </group>
  );
}

// 4. Kettlebell
function KettlebellMesh({ position }) {
  const meshRef = useRef();

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.004;
      meshRef.current.rotation.z += 0.002;
    }
  });

  return (
    <group ref={meshRef} position={position} scale={[0.6, 0.6, 0.6]}>
      {/* Base sphere */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.45, 20, 20]} />
        <meshStandardMaterial color="#00E5FF" metalness={0.8} roughness={0.2} emissive="#00E5FF" emissiveIntensity={0.25} />
      </mesh>
      {/* Handle arc */}
      <mesh position={[0, 0.45, 0]} rotation={[0, 0, 0]}>
        <torusGeometry args={[0.25, 0.06, 16, 32, Math.PI]} />
        <meshStandardMaterial color="#334155" metalness={0.9} roughness={0.3} />
      </mesh>
    </group>
  );
}

// 5. Weight Plate
function WeightPlateMesh({ position }) {
  const meshRef = useRef();

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.x += 0.003;
      meshRef.current.rotation.y += 0.005;
    }
  });

  return (
    <group ref={meshRef} position={position} scale={[0.7, 0.7, 0.7]}>
      <mesh rotation={[Math.PI / 3, 0, 0]}>
        <torusGeometry args={[0.6, 0.25, 16, 32]} />
        <meshStandardMaterial color="#111118" metalness={0.9} roughness={0.3} emissive="#00E5FF" emissiveIntensity={0.15} />
      </mesh>
    </group>
  );
}

// Chalk Dust Particles
function ChalkParticles() {
  const count = 70;
  const pointsRef = useRef();

  const [positions] = useState(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 16;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 12;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }
    return pos;
  });

  useFrame(() => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += 0.0005;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.05} color="#00E5FF" transparent opacity={0.4} />
    </points>
  );
}

export default function GymCanvas() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (isMobile) {
    return (
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-[#0A0A0F] via-[#111118] to-[#00E5FF]/10 pointer-events-none" />
    );
  }

  return (
    <div className="absolute inset-0 z-0 opacity-80 pointer-events-none">
      <Canvas camera={{ position: [0, 0, 7], fov: 60 }}>
        <ambientLight intensity={0.6} />
        <pointLight position={[10, 10, 10]} intensity={1.2} color="#00E5FF" />
        <pointLight position={[-10, -10, -5]} intensity={0.8} color="#FF6B35" />
        
        <Suspense fallback={null}>
          <Float speed={1.5} rotationIntensity={0.5} floatIntensity={1}>
            <DumbbellMesh position={[-3.5, 2, -1]} rotationScale={1} />
          </Float>

          <Float speed={1.2} rotationIntensity={0.4} floatIntensity={0.8}>
            <BarbellMesh position={[3.8, 1.5, -2]} />
          </Float>

          <Float speed={1.8} rotationIntensity={0.6} floatIntensity={1.2}>
            <LifterMesh position={[0, -1.8, -1]} />
          </Float>

          <Float speed={1.4} rotationIntensity={0.5} floatIntensity={0.9}>
            <KettlebellMesh position={[-3.8, -2, -1.5]} />
          </Float>

          <Float speed={1.6} rotationIntensity={0.7} floatIntensity={1.1}>
            <WeightPlateMesh position={[3.5, -2.2, -1]} />
          </Float>

          <ChalkParticles />
        </Suspense>
      </Canvas>
    </div>
  );
}
