import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial, Float, Sphere, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

function ParticleField({ count = 4000 }) {
  const points = useMemo(() => {
    const p = new Float32Array(count * 3);
    const random = () => Math.random() - 0.5;
    for (let i = 0; i < count; i++) {
      p[i * 3] = random() * 20;
      p[i * 3 + 1] = random() * 20;
      p[i * 3 + 2] = random() * 20;
    }
    return p;
  }, [count]);

  const ref = useRef<THREE.Points>(null!);
  const mouse = useRef({ x: 0, y: 0 });

  useFrame((state) => {
    if (ref.current) {
      // Rotation
      ref.current.rotation.x = state.clock.getElapsedTime() * 0.015;
      ref.current.rotation.y = state.clock.getElapsedTime() * 0.01;

      // Follow mouse effect
      const targetX = (state.mouse.x * state.viewport.width) / 10;
      const targetY = (state.mouse.y * state.viewport.height) / 10;
      
      mouse.current.x += (targetX - mouse.current.x) * 0.05;
      mouse.current.y += (targetY - mouse.current.y) * 0.05;

      ref.current.position.x = mouse.current.x;
      ref.current.position.y = mouse.current.y;
    }
  });

  return (
    <group rotation={[0, 0, Math.PI / 4]}>
      <Points ref={ref} positions={points} stride={3} frustumCulled={false}>
        <PointMaterial
          transparent
          color="#6366f1"
          size={0.02}
          sizeAttenuation={true}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          opacity={0.6}
        />
      </Points>
    </group>
  );
}

function DynamicSpheres() {
  const sphereRef1 = useRef<THREE.Mesh>(null!);
  const sphereRef2 = useRef<THREE.Mesh>(null!);

  useFrame((state) => {
    if (sphereRef1.current) {
      sphereRef1.current.position.x = Math.sin(state.clock.getElapsedTime() * 0.5) * 3 + state.mouse.x * 0.5;
      sphereRef1.current.position.y = Math.cos(state.clock.getElapsedTime() * 0.3) * 2 + state.mouse.y * 0.5;
    }
    if (sphereRef2.current) {
      sphereRef2.current.position.x = Math.cos(state.clock.getElapsedTime() * 0.4) * 4 - state.mouse.x * 0.3;
      sphereRef2.current.position.y = Math.sin(state.clock.getElapsedTime() * 0.6) * 3 - state.mouse.y * 0.3;
    }
  });

  return (
    <group>
      <Float speed={2} rotationIntensity={1} floatIntensity={1}>
        <Sphere ref={sphereRef1} args={[1.5, 64, 64]} position={[4, 2, -4]}>
          <MeshDistortMaterial
            color="#4f46e5"
            emissive="#4f46e5"
            emissiveIntensity={0.8}
            distort={0.4}
            speed={2}
            transparent
            opacity={0.15}
            wireframe
          />
        </Sphere>
      </Float>
      
      <Float speed={3} rotationIntensity={1.5} floatIntensity={2}>
        <Sphere ref={sphereRef2} args={[1, 64, 64]} position={[-5, -3, -2]}>
          <MeshDistortMaterial
            color="#ec4899"
            emissive="#ec4899"
            emissiveIntensity={0.5}
            distort={0.6}
            speed={4}
            transparent
            opacity={0.1}
          />
        </Sphere>
      </Float>
    </group>
  );
}

export const AppBackground = ({ className = "fixed inset-0" }: { className?: string }) => {
  return (
    <div className={`${className} z-0 pointer-events-none bg-[#020202]`}>
      <Canvas camera={{ position: [0, 0, 10], fov: 60 }}>
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#6366f1" />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#ec4899" />
        <ParticleField />
        <DynamicSpheres />
      </Canvas>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_rgba(0,0,0,0.6)_100%)]" />
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.15] brightness-50 contrast-150 mix-blend-overlay" />
    </div>
  );
};
