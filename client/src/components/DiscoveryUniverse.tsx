import { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Sphere, Html, PerspectiveCamera, OrbitControls, Stars, Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { 
  Music,
  Video,
  Play,
  Maximize2
} from 'lucide-react';

interface GalaxyProps {
  position: [number, number, number];
  color: string;
  label: string;
  icon: any;
  onClick: () => void;
  scale?: number;
}

const Galaxy = ({ position, color, label, icon: Icon, onClick, scale = 1 }: GalaxyProps) => {
  const [hovered, setHovered] = useState(false);
  const pointsRef = useRef<THREE.Points>(null!);
  
  const particlesCount = 1000;
  const positions = useMemo(() => {
    const pos = new Float32Array(particlesCount * 3);
    for (let i = 0; i < particlesCount; i++) {
      const theta = THREE.MathUtils.randFloatSpread(Math.PI * 2);
      const phi = THREE.MathUtils.randFloatSpread(Math.PI);
      const r = THREE.MathUtils.randFloat(0.8, 1.2);
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);
    }
    return pos;
  }, []);

  useFrame(() => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += 0.002;
      pointsRef.current.rotation.z += 0.001;
      const targetScale = hovered ? scale * 1.3 : scale;
      pointsRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
    }
  });

  return (
    <group position={position}>
      <Points ref={pointsRef} positions={positions} stride={3}>
        <PointMaterial 
          transparent 
          color={color} 
          size={0.05} 
          sizeAttenuation={true} 
          depthWrite={false} 
          blending={THREE.AdditiveBlending}
        />
      </Points>
      
      {/* Invisible interaction sphere */}
      <Sphere 
        args={[1.5, 32, 32]} 
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <meshBasicMaterial transparent opacity={0} />
      </Sphere>

      <Html distanceFactor={12} position={[0, -2, 0]} center>
        <div className={`flex flex-col items-center gap-3 transition-all duration-500 ${hovered ? 'scale-110' : 'scale-100'}`}>
          <div className={`p-3 rounded-2xl bg-black/60 backdrop-blur-xl border border-white/20 text-white shadow-[0_0_20px_${color}]`}>
            <Icon className="w-6 h-6" />
          </div>
          <span className="text-xs font-black text-white uppercase tracking-[0.3em] whitespace-nowrap bg-black/60 backdrop-blur-xl px-4 py-1.5 rounded-full border border-white/10 shadow-2xl">
            {label} Galaxy
          </span>
        </div>
      </Html>
    </group>
  );
};

interface SolarSystemProps {
  position: [number, number, number];
  color: string;
  label: string;
  onClick: () => void;
  scale?: number;
}

const SolarSystem = ({ position, color, label, onClick, scale = 1 }: SolarSystemProps) => {
  const [hovered, setHovered] = useState(false);
  const groupRef = useRef<THREE.Group>(null!);

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.01;
      const targetScale = hovered ? scale * 1.2 : scale;
      groupRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
    }
  });

  return (
    <group position={position} ref={groupRef}>
      {/* Central Star */}
      <Sphere args={[0.8, 32, 32]} onClick={onClick} onPointerOver={() => setHovered(true)} onPointerOut={() => setHovered(false)}>
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2} />
      </Sphere>
      
      {/* Orbiting Planets */}
      {[1.5, 2.2, 3].map((r, i) => (
        <mesh key={i} rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[r, r + 0.02, 64]} />
          <meshBasicMaterial color="white" transparent opacity={0.1} side={THREE.DoubleSide} />
        </mesh>
      ))}

      <Html distanceFactor={10} position={[0, -1.5, 0]} center>
        <span className="text-[10px] font-black text-white uppercase tracking-[0.2em] whitespace-nowrap bg-black/50 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
          {label} System
        </span>
      </Html>
    </group>
  );
};

interface DiscoveryUniverseProps {
  onGalaxySelect: (platform: string) => void;
  onSystemSelect: (genre: string) => void;
  onItemSelect: (item: any) => void;
  view: 'universe' | 'galaxy' | 'system';
  activeGalaxy: string | null;
  activeSystem: string | null;
  systems: string[];
  items: any[];
}

export const DiscoveryUniverse = ({ 
  onGalaxySelect, 
  onSystemSelect, 
  onItemSelect,
  view, 
  activeGalaxy, 
  activeSystem,
  systems,
  items
}: DiscoveryUniverseProps) => {
  
  const galaxies = [
    { id: 'spotify', label: 'Spotify', icon: Music, color: '#1DB954', position: [-10, 5, 0] as [number, number, number] },
    { id: 'youtube', label: 'YT Music', icon: Video, color: '#FF0000', position: [10, 5, 0] as [number, number, number] },
    { id: 'apple', label: 'Apple Music', icon: Play, color: '#fa243c', position: [0, -5, 5] as [number, number, number] },
  ];

  return (
    <div className="w-full h-[750px] relative bg-black/40 rounded-[4rem] border border-white/5 overflow-hidden">
      <Canvas shadows dpr={[1, 2]} camera={{ position: [0, 0, 25], fov: 45 }}>
        <PerspectiveCamera makeDefault position={[0, 0, 25]} />
        <OrbitControls 
          enableZoom={true} 
          enablePan={false}
          autoRotate={view === 'universe'}
          autoRotateSpeed={0.2}
        />
        
        <Stars radius={100} depth={50} count={10000} factor={4} saturation={0} fade speed={1} />
        
        <ambientLight intensity={0.5} />
        <pointLight position={[20, 20, 20]} intensity={2} />
        
        {view === 'universe' && galaxies.map((g) => (
          <Galaxy 
            key={g.id}
            {...g}
            onClick={() => onGalaxySelect(g.id)}
          />
        ))}

        {view === 'galaxy' && systems.map((s, i) => {
            const angle = (i / systems.length) * Math.PI * 2;
            const r = 12;
            const pos: [number, number, number] = [Math.cos(angle) * r, Math.sin(angle) * r, 0];
            return (
              <SolarSystem 
                key={s}
                label={s}
                color={galaxies.find(g => g.id === activeGalaxy)?.color || '#fff'}
                position={pos}
                onClick={() => onSystemSelect(s)}
              />
            );
        })}

        {view === 'system' && items.map((item, i) => {
            const angle = (i / items.length) * Math.PI * 2;
            const r = 10;
            const pos: [number, number, number] = [Math.cos(angle) * r, Math.sin(angle) * r, 0];
            return (
              <group key={item.id} position={pos}>
                <Float speed={2} rotationIntensity={1} floatIntensity={1}>
                  <Sphere args={[1.2, 32, 32]} onClick={() => onItemSelect(item)}>
                    <meshStandardMaterial color="#fff" emissive="#fff" emissiveIntensity={0.2} metalness={1} roughness={0} />
                  </Sphere>
                  <Html distanceFactor={10} position={[0, 0, 0]} center>
                    <div className="flex flex-col items-center gap-2 cursor-pointer group" onClick={() => onItemSelect(item)}>
                       <img src={item.cover_url} className="w-16 h-16 rounded-xl border-2 border-white/20 shadow-2xl group-hover:scale-110 transition-transform" alt="" />
                       <div className="bg-black/60 backdrop-blur-md px-2 py-0.5 rounded border border-white/10 text-center max-w-[100px]">
                          <p className="text-[7px] font-black text-white uppercase truncate">{item.title}</p>
                          <p className="text-[5px] text-gray-400 font-black uppercase truncate">{item.artist_name}</p>
                       </div>
                    </div>
                  </Html>
                </Float>
              </group>
            );
        })}

        {/* Central visual for Galaxy/System views */}
        {view !== 'universe' && (
           <group>
              <Sphere args={[3, 64, 64]}>
                <meshStandardMaterial 
                  color={galaxies.find(g => g.id === activeGalaxy)?.color || '#fff'} 
                  emissive={galaxies.find(g => g.id === activeGalaxy)?.color || '#fff'}
                  emissiveIntensity={2}
                  wireframe
                />
              </Sphere>
              <Html center>
                 <div className="text-center">
                    <p className="text-[10px] font-black text-white uppercase tracking-[0.4em] mb-2">{view === 'galaxy' ? 'Platform Core' : 'Genre Nucleus'}</p>
                    <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter shadow-2xl">
                       {view === 'galaxy' ? activeGalaxy : activeSystem}
                    </h2>
                 </div>
              </Html>
           </group>
        )}
      </Canvas>

      <div className="absolute top-10 left-10 z-10 flex flex-col gap-4">
        <div className="flex items-center gap-4 px-6 py-4 rounded-3xl bg-black/60 backdrop-blur-xl border border-white/10 shadow-2xl">
          <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse shadow-[0_0_15px_#3b82f6]" />
          <div className="flex flex-col">
            <span className="text-xs font-black text-white uppercase tracking-[0.2em]">Universal Explorer v5.0</span>
            <span className="text-[9px] text-gray-500 font-black uppercase tracking-widest">Traversing Musical Constellations</span>
          </div>
        </div>
        
        {view !== 'universe' && (
           <button 
             onClick={() => onGalaxySelect('universe')}
             className="px-6 py-3 rounded-2xl bg-white text-black text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-2xl flex items-center gap-2 self-start"
           >
             <Maximize2 className="w-4 h-4" /> Reset Orbit
           </button>
        )}
      </div>

      <div className="absolute bottom-12 right-12 z-10 text-right">
        <p className="text-xs font-black text-gray-500 uppercase tracking-[0.3em] mb-3">Astro Navigation</p>
        <div className="px-6 py-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md inline-block shadow-2xl">
          <p className="text-[10px] font-black text-white uppercase italic tracking-tighter">
            {view === 'universe' ? 'Click Galaxy to Enter' : view === 'galaxy' ? 'Click Solar System to Enter' : 'Click Planets to Stream'}
          </p>
        </div>
      </div>
    </div>
  );
};
