import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial, Float, Sphere } from '@react-three/drei';
import * as THREE from 'three';

function ParticleField({ count = 5000 }) {
  const points = useMemo(() => {
    const p = new Float32Array(count * 3);
    // eslint-disable-next-line react-hooks/purity
    const random = () => Math.random() - 0.5;
    for (let i = 0; i < count; i++) {
      p[i * 3] = random() * 10;
      p[i * 3 + 1] = random() * 10;
      p[i * 3 + 2] = random() * 10;
    }
    return p;
  }, [count]);

  const ref = useRef<THREE.Points>(null!);

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.x = state.clock.getElapsedTime() * 0.05;
      ref.current.rotation.y = state.clock.getElapsedTime() * 0.03;
    }
  });

  return (
    <group rotation={[0, 0, Math.PI / 4]}>
      <Points ref={ref} positions={points} stride={3} frustumCulled={false}>
        <PointMaterial
          transparent
          color="#4f46e5"
          size={0.02}
          sizeAttenuation={true}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </Points>
    </group>
  );
}

function GlowingSphere() {
  const mesh = useRef<THREE.Mesh>(null!);

  useFrame((state) => {
    if (mesh.current) {
      mesh.current.rotation.z = state.clock.getElapsedTime() * 0.2;
    }
  });

  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={2}>
      <Sphere ref={mesh} args={[1, 64, 64]}>
        <meshStandardMaterial
          color="#8b5cf6"
          emissive="#4f46e5"
          emissiveIntensity={2}
          wireframe
          transparent
          opacity={0.3}
        />
      </Sphere>
      <Sphere args={[0.8, 64, 64]}>
        <meshStandardMaterial
          color="#ec4899"
          emissive="#db2777"
          emissiveIntensity={1}
          transparent
          opacity={0.1}
        />
      </Sphere>
    </Float>
  );
}

export const WelcomeCanvas = () => {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none">
      <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#4f46e5" />
        <pointLight position={[-10, -10, -10]} intensity={1} color="#ec4899" />
        <ParticleField />
        <GlowingSphere />
      </Canvas>
    </div>
  );
};
