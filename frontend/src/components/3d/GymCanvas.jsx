import React, { useRef, useState, useEffect, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Sparkles, MeshWobbleMaterial, Float as DreiFloat } from '@react-three/drei';
import * as THREE from 'three';

// 1. Futuristic High-Detail Metallic Dumbbell
function CyberDumbbell({ position, scale = 1, speed = 1 }) {
  const groupRef = useRef();

  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.008 * speed;
      groupRef.current.rotation.x += 0.004 * speed;
      groupRef.current.rotation.z += 0.002 * speed;
    }
  });

  return (
    <group ref={groupRef} position={position} scale={[scale, scale, scale]}>
      {/* Chrome Knurled Handle */}
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.09, 0.09, 2.0, 32]} />
        <meshStandardMaterial color="#E2E8F0" metalness={0.95} roughness={0.1} />
      </mesh>

      {/* Left Plate Stack */}
      <group position={[-0.9, 0, 0]}>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.45, 0.45, 0.18, 32]} />
          <meshStandardMaterial color="#0F172A" metalness={0.8} roughness={0.2} />
        </mesh>
        <mesh rotation={[0, 0, Math.PI / 2]} position={[-0.12, 0, 0]}>
          <cylinderGeometry args={[0.38, 0.38, 0.12, 32]} />
          <meshStandardMaterial color="#00E5FF" metalness={0.9} emissive="#00E5FF" emissiveIntensity={0.6} />
        </mesh>
      </group>

      {/* Right Plate Stack */}
      <group position={[0.9, 0, 0]}>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.45, 0.45, 0.18, 32]} />
          <meshStandardMaterial color="#0F172A" metalness={0.8} roughness={0.2} />
        </mesh>
        <mesh rotation={[0, 0, Math.PI / 2]} position={[0.12, 0, 0]}>
          <cylinderGeometry args={[0.38, 0.38, 0.12, 32]} />
          <meshStandardMaterial color="#00E5FF" metalness={0.9} emissive="#00E5FF" emissiveIntensity={0.6} />
        </mesh>
      </group>
    </group>
  );
}

// 2. Olympic Barbell with Multi-Colored Heavy Bumper Plates
function OlympicBarbell({ position }) {
  const groupRef = useRef();

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.004;
      groupRef.current.rotation.z = Math.sin(Date.now() * 0.001) * 0.15;
    }
  });

  return (
    <group ref={groupRef} position={position} scale={[0.75, 0.75, 0.75]}>
      {/* Solid Steel Bar */}
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.07, 0.07, 4.2, 32]} />
        <meshStandardMaterial color="#CBD5E1" metalness={0.98} roughness={0.05} />
      </mesh>

      {/* Left Heavy Plates */}
      <group position={[-1.7, 0, 0]}>
        {/* 25kg Red Bumper */}
        <mesh rotation={[0, 0, Math.PI / 2]} position={[0, 0, 0]}>
          <cylinderGeometry args={[0.75, 0.75, 0.15, 32]} />
          <meshStandardMaterial color="#EF4444" metalness={0.4} roughness={0.3} emissive="#EF4444" emissiveIntensity={0.2} />
        </mesh>
        {/* 20kg Blue Bumper */}
        <mesh rotation={[0, 0, Math.PI / 2]} position={[-0.18, 0, 0]}>
          <cylinderGeometry args={[0.65, 0.65, 0.14, 32]} />
          <meshStandardMaterial color="#3B82F6" metalness={0.5} roughness={0.3} emissive="#3B82F6" emissiveIntensity={0.2} />
        </mesh>
        {/* Gold PR Plate */}
        <mesh rotation={[0, 0, Math.PI / 2]} position={[-0.32, 0, 0]}>
          <cylinderGeometry args={[0.5, 0.5, 0.1, 32]} />
          <meshStandardMaterial color="#FFD700" metalness={0.9} roughness={0.1} emissive="#FFD700" emissiveIntensity={0.4} />
        </mesh>
      </group>

      {/* Right Heavy Plates */}
      <group position={[1.7, 0, 0]}>
        {/* 25kg Red Bumper */}
        <mesh rotation={[0, 0, Math.PI / 2]} position={[0, 0, 0]}>
          <cylinderGeometry args={[0.75, 0.75, 0.15, 32]} />
          <meshStandardMaterial color="#EF4444" metalness={0.4} roughness={0.3} emissive="#EF4444" emissiveIntensity={0.2} />
        </mesh>
        {/* 20kg Blue Bumper */}
        <mesh rotation={[0, 0, Math.PI / 2]} position={[0.18, 0, 0]}>
          <cylinderGeometry args={[0.65, 0.65, 0.14, 32]} />
          <meshStandardMaterial color="#3B82F6" metalness={0.5} roughness={0.3} emissive="#3B82F6" emissiveIntensity={0.2} />
        </mesh>
        {/* Gold PR Plate */}
        <mesh rotation={[0, 0, Math.PI / 2]} position={[0.32, 0, 0]}>
          <cylinderGeometry args={[0.5, 0.5, 0.1, 32]} />
          <meshStandardMaterial color="#FFD700" metalness={0.9} roughness={0.1} emissive="#FFD700" emissiveIntensity={0.4} />
        </mesh>
      </group>
    </group>
  );
}

// 3. Holographic Lifter Figure with Animated Overhead Press
function CyberLifter({ position }) {
  const groupRef = useRef();
  const barPressRef = useRef();

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(t * 0.4) * 0.3;
    }
    if (barPressRef.current) {
      barPressRef.current.position.y = 1.3 + Math.abs(Math.sin(t * 2.2)) * 0.6;
    }
  });

  return (
    <group ref={groupRef} position={position} scale={[0.7, 0.7, 0.7]}>
      {/* Holographic Glowing Head */}
      <mesh position={[0, 2.0, 0]}>
        <icosahedronGeometry args={[0.28, 2]} />
        <meshStandardMaterial color="#00E5FF" metalness={0.9} roughness={0.1} emissive="#00E5FF" emissiveIntensity={0.8} wireframe />
      </mesh>

      {/* Cyber Torso */}
      <mesh position={[0, 1.1, 0]}>
        <cylinderGeometry args={[0.38, 0.22, 1.2, 6]} />
        <meshStandardMaterial color="#1E293B" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Dynamic Overhead Barbell Press */}
      <group ref={barPressRef} position={[0, 1.3, 0]}>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.05, 0.05, 2.6, 16]} />
          <meshStandardMaterial color="#00E5FF" emissive="#00E5FF" emissiveIntensity={1} />
        </mesh>
        {/* Glowing End Weights */}
        <mesh position={[-1.3, 0, 0]}>
          <sphereGeometry args={[0.22, 16, 16]} />
          <meshStandardMaterial color="#FF6B35" emissive="#FF6B35" emissiveIntensity={0.8} />
        </mesh>
        <mesh position={[1.3, 0, 0]}>
          <sphereGeometry args={[0.22, 16, 16]} />
          <meshStandardMaterial color="#FF6B35" emissive="#FF6B35" emissiveIntensity={0.8} />
        </mesh>
      </group>
    </group>
  );
}

// 4. Kinetic Neon Kettlebell
function KineticKettlebell({ position }) {
  const groupRef = useRef();

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.006;
      groupRef.current.rotation.x += 0.003;
    }
  });

  return (
    <group ref={groupRef} position={position} scale={[0.65, 0.65, 0.65]}>
      {/* Neon Base Sphere */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.55, 32, 32]} />
        <meshStandardMaterial color="#FF6B35" metalness={0.9} roughness={0.2} emissive="#FF6B35" emissiveIntensity={0.5} />
      </mesh>
      {/* Orbiting Neon Ring */}
      <mesh rotation={[Math.PI / 4, 0, 0]}>
        <torusGeometry args={[0.75, 0.03, 16, 64]} />
        <meshStandardMaterial color="#00E5FF" emissive="#00E5FF" emissiveIntensity={1} />
      </mesh>
      {/* Heavy Handle */}
      <mesh position={[0, 0.55, 0]}>
        <torusGeometry args={[0.32, 0.08, 16, 32, Math.PI]} />
        <meshStandardMaterial color="#0F172A" metalness={0.9} roughness={0.1} />
      </mesh>
    </group>
  );
}

// 5. Floating Energy Gems / Crystals
function EnergyCrystal({ position, color = "#00E5FF" }) {
  const meshRef = useRef();

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.x += 0.01;
      meshRef.current.rotation.y += 0.015;
    }
  });

  return (
    <mesh ref={meshRef} position={position} scale={[0.3, 0.45, 0.3]}>
      <octahedronGeometry args={[1, 0]} />
      <meshStandardMaterial color={color} metalness={0.9} roughness={0.1} emissive={color} emissiveIntensity={0.7} transparent opacity={0.85} />
    </mesh>
  );
}

// Scene Lighting & Pulsing Ambient Effect
function DynamicLights() {
  const lightRef = useRef();

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (lightRef.current) {
      lightRef.current.intensity = 1.5 + Math.sin(t * 1.5) * 0.5;
    }
  });

  return (
    <>
      <ambientLight intensity={0.4} />
      <pointLight ref={lightRef} position={[8, 8, 8]} color="#00E5FF" intensity={2} distance={20} />
      <pointLight position={[-8, -8, -4]} color="#FF6B35" intensity={1.8} distance={20} />
      <pointLight position={[0, 10, -5]} color="#9333EA" intensity={1.2} distance={25} />
    </>
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

  return (
    <div className="absolute inset-0 z-0 opacity-90 pointer-events-none overflow-hidden">
      <Canvas camera={{ position: [0, 0, isMobile ? 10 : 8], fov: isMobile ? 65 : 55 }}>
        <DynamicLights />

        <Suspense fallback={null}>
          {/* Floating Drei Particle Systems */}
          <Sparkles count={isMobile ? 50 : 120} scale={[15, 12, 10]} size={isMobile ? 2 : 3} speed={0.4} color="#00E5FF" opacity={0.6} />
          <Sparkles count={isMobile ? 25 : 60} scale={[12, 10, 8]} size={isMobile ? 3 : 4} speed={0.6} color="#FF6B35" opacity={0.5} />

          {/* 3D Floating Gym Objects with Drei Float wrapper */}
          <Float speed={2.2} rotationIntensity={0.8} floatIntensity={1.4}>
            <CyberDumbbell position={isMobile ? [0, 2.5, -2] : [-4.2, 2.2, -1]} scale={isMobile ? 0.6 : 0.85} speed={1.2} />
          </Float>

          {!isMobile && (
            <>
              <Float speed={1.8} rotationIntensity={0.6} floatIntensity={1.1}>
                <OlympicBarbell position={[4.5, 1.8, -2]} />
              </Float>

              <Float speed={2.5} rotationIntensity={0.9} floatIntensity={1.6}>
                <CyberLifter position={[0, -2.0, -1]} />
              </Float>
            </>
          )}

          <Float speed={2.0} rotationIntensity={0.7} floatIntensity={1.3}>
            <KineticKettlebell position={isMobile ? [0, -2.8, -2] : [-4.5, -2.2, -1.5]} scale={isMobile ? 0.45 : 0.65} />
          </Float>

          {/* Additional Floating Energy Gems */}
          <Float speed={3.0} rotationIntensity={1.2} floatIntensity={1.8}>
            <EnergyCrystal position={isMobile ? [2.0, -1.5, -2] : [3.8, -2.4, -1]} color="#FFD700" />
          </Float>
          <Float speed={2.8} rotationIntensity={1.0} floatIntensity={1.5}>
            <EnergyCrystal position={isMobile ? [-2.0, 1.5, -2] : [-2.2, 3.2, -2]} color="#00E5FF" />
          </Float>
        </Suspense>
      </Canvas>
    </div>
  );
}
