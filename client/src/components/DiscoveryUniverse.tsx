import { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Sphere, Html, PerspectiveCamera, OrbitControls, Stars, Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { 
  Music,
  Video,
  Play,
  ArrowLeft,
  Search
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
  
  const particlesCount = 2000;
  const positions = useMemo(() => {
    const pos = new Float32Array(particlesCount * 3);
    for (let i = 0; i < particlesCount; i++) {
      const theta = THREE.MathUtils.randFloatSpread(Math.PI * 2);
      const phi = THREE.MathUtils.randFloatSpread(Math.PI);
      const r = THREE.MathUtils.randFloat(1.5, 2.5);
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);
    }
    return pos;
  }, []);

  useFrame(() => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += 0.003;
      pointsRef.current.rotation.z += 0.001;
      const targetScale = hovered ? scale * 1.3 : scale;
      pointsRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
    }
  });

  return (
    <group position={position}>
      <Points ref={pointsRef} positions={positions} stride={3} frustumCulled={false}>
        <PointMaterial 
          transparent 
          color={color} 
          size={0.06} 
          sizeAttenuation={true} 
          depthWrite={false} 
          blending={THREE.AdditiveBlending}
        />
      </Points>
      
      <Sphere 
        args={[3, 32, 32]} 
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <meshBasicMaterial transparent opacity={0} />
      </Sphere>

      <Html distanceFactor={15} position={[0, -3.5, 0]} center>
        <div className={`flex flex-col items-center gap-4 transition-all duration-500 ${hovered ? 'scale-110' : 'scale-100'}`}>
          <div className={`p-4 rounded-3xl bg-black/60 backdrop-blur-xl border border-white/20 text-white shadow-[0_0_30px_${color}]`}>
            <Icon className="w-8 h-8" />
          </div>
          <span className="text-sm font-black text-white uppercase tracking-[0.4em] whitespace-nowrap bg-black/60 backdrop-blur-xl px-5 py-2 rounded-full border border-white/10 shadow-2xl">
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
      <Sphere args={[1, 32, 32]} onClick={onClick} onPointerOver={() => setHovered(true)} onPointerOut={() => setHovered(false)}>
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2} />
      </Sphere>
      
      {[2, 3, 4].map((r, i) => (
        <mesh key={i} rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[r, r + 0.03, 128]} />
          <meshBasicMaterial color="white" transparent opacity={0.15} side={THREE.DoubleSide} />
        </mesh>
      ))}

      <Html distanceFactor={12} position={[0, -2, 0]} center>
        <span className="text-[11px] font-black text-white uppercase tracking-[0.3em] whitespace-nowrap bg-black/60 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10 shadow-xl">
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
  onBack: () => void;
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
  onBack,
  view, 
  activeGalaxy, 
  activeSystem,
  systems,
  items
}: DiscoveryUniverseProps) => {
  
  const galaxies = [
    { id: 'spotify', label: 'Spotify', icon: Music, color: '#1DB954', position: [-15, 8, 0] as [number, number, number] },
    { id: 'youtube', label: 'YT Music', icon: Video, color: '#FF0000', position: [15, 8, 0] as [number, number, number] },
    { id: 'apple', label: 'Apple Music', icon: Play, color: '#fa243c', position: [0, -8, 8] as [number, number, number] },
  ];

  const activeGalaxyData = galaxies.find(g => g.id === activeGalaxy);

  return (
    <div className="w-full h-[750px] relative bg-black/40 rounded-[4rem] border border-white/5 overflow-hidden">
      <Canvas shadows dpr={[1, 2]} camera={{ position: [0, 0, 35], fov: 45 }}>
        <PerspectiveCamera makeDefault position={[0, 0, 35]} />
        <OrbitControls 
          enableZoom={true} 
          enablePan={false}
          minDistance={10}
          maxDistance={60}
          autoRotate={view === 'universe'}
          autoRotateSpeed={0.3}
        />
        
        <Stars radius={150} depth={50} count={12000} factor={4} saturation={0} fade speed={1.5} />
        
        <ambientLight intensity={0.6} />
        <pointLight position={[20, 20, 20]} intensity={2.5} />
        
        {/* Universe View: Show Galaxies */}
        {view === 'universe' && galaxies.map((g) => (
          <Galaxy 
            key={g.id}
            {...g}
            onClick={() => onGalaxySelect(g.id)}
          />
        ))}

        {/* Galaxy View: Show Genre Systems */}
        {view === 'galaxy' && systems.map((s, i) => {
            const angle = (i / systems.length) * Math.PI * 2;
            const r = 18;
            const pos: [number, number, number] = [Math.cos(angle) * r, Math.sin(angle) * r, 0];
            return (
              <SolarSystem 
                key={s}
                label={s}
                color={activeGalaxyData?.color || '#fff'}
                position={pos}
                onClick={() => onSystemSelect(s)}
              />
            );
        })}

        {/* System View: Show Item Planets */}
        {view === 'system' && items.map((item, i) => {
            const angle = (i / items.length) * Math.PI * 2;
            const r = 15;
            const pos: [number, number, number] = [Math.cos(angle) * r, Math.sin(angle) * r, 0];
            return (
              <group key={item.id} position={pos}>
                <Float speed={2} rotationIntensity={1.5} floatIntensity={1.5}>
                  <Sphere args={[1.5, 64, 64]} onClick={() => onItemSelect(item)}>
                    <meshStandardMaterial 
                      color="#fff" 
                      emissive={activeGalaxyData?.color || '#fff'} 
                      emissiveIntensity={0.3} 
                      metalness={0.9} 
                      roughness={0.1} 
                    />
                  </Sphere>
                  <Html distanceFactor={12} position={[0, 0, 0]} center>
                    <div className="flex flex-col items-center gap-3 cursor-pointer group" onClick={() => onItemSelect(item)}>
                       <div className="relative">
                          <div className={`absolute -inset-2 bg-gradient-to-tr from-white to-${activeGalaxyData?.color} rounded-2xl blur-lg opacity-0 group-hover:opacity-40 transition-opacity`} />
                          <img src={item.cover_url} className="w-20 h-20 rounded-2xl border-2 border-white/20 shadow-2xl group-hover:scale-110 transition-transform duration-500 relative z-10" alt="" />
                       </div>
                       <div className="bg-black/70 backdrop-blur-xl px-3 py-1 rounded-lg border border-white/10 text-center max-w-[120px] shadow-2xl">
                          <p className="text-[8px] font-black text-white uppercase truncate tracking-tighter">{item.title}</p>
                          <p className="text-[6px] text-gray-400 font-black uppercase truncate tracking-widest">{item.artist_name}</p>
                       </div>
                    </div>
                  </Html>
                </Float>
              </group>
            );
        })}

        {/* Core Visualization for Deep Views */}
        {view !== 'universe' && (
           <group>
              {/* Maintain Galaxy Visual in background */}
              <Points positions={new Float32Array(3000 * 3).map(() => THREE.MathUtils.randFloatSpread(40))} frustumCulled={false}>
                 <PointMaterial transparent color={activeGalaxyData?.color || '#fff'} size={0.08} opacity={0.1} sizeAttenuation />
              </Points>

              <Float speed={1.5}>
                <Sphere args={[4, 128, 128]}>
                  <meshStandardMaterial 
                    color={activeGalaxyData?.color || '#fff'} 
                    emissive={activeGalaxyData?.color || '#fff'}
                    emissiveIntensity={3}
                    wireframe
                    transparent
                    opacity={0.2}
                  />
                </Sphere>
              </Float>
              
              <Html center>
                 <div className="text-center group cursor-default">
                    <p className="text-[10px] font-black text-white uppercase tracking-[0.5em] mb-3 opacity-60">
                       {view === 'galaxy' ? 'GALACTIC NUCLEUS' : 'SYSTEM CORE'}
                    </p>
                    <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter drop-shadow-[0_0_20px_rgba(255,255,255,0.5)]">
                       {view === 'galaxy' ? activeGalaxy?.toUpperCase() : activeSystem?.toUpperCase()}
                    </h2>
                    <div className={`mt-6 h-1 w-20 mx-auto rounded-full bg-gradient-to-r from-transparent via-${activeGalaxyData?.color} to-transparent`} />
                 </div>
              </Html>
           </group>
        )}
      </Canvas>

      {/* Navigation Overlay */}
      <div className="absolute top-10 left-10 z-10 flex flex-col gap-5">
        <div className="flex items-center gap-5 px-7 py-5 rounded-[2.5rem] bg-black/60 backdrop-blur-2xl border border-white/10 shadow-2xl">
          <div className="relative">
             <div className={`absolute -inset-2 bg-blue-500 rounded-full blur-md animate-pulse opacity-50`} />
             <Search className="w-5 h-5 text-blue-400 relative z-10" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-black text-white uppercase tracking-[0.3em]">Astro Explorer v5.2</span>
            <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Traversing: {view.toUpperCase()}</span>
          </div>
        </div>
        
        {view !== 'universe' && (
           <button 
             onClick={onBack}
             className="px-8 py-4 rounded-3xl bg-white text-black text-[11px] font-black uppercase tracking-[0.2em] hover:scale-105 transition-all shadow-2xl flex items-center gap-3 self-start group"
           >
             <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Revert Orbit
           </button>
        )}
      </div>

      <div className="absolute bottom-12 right-12 z-10 text-right">
        <p className="text-[11px] font-black text-gray-500 uppercase tracking-[0.4em] mb-4">Interactive Controls</p>
        <div className="px-7 py-4 rounded-[2rem] bg-black/60 border border-white/10 backdrop-blur-2xl inline-block shadow-2xl">
          <p className="text-[11px] font-black text-white uppercase italic tracking-tighter">
            {view === 'universe' ? 'Select Galaxy to Synchronize' : view === 'galaxy' ? 'Select Solar System to Initialize' : 'Select Planet to Stream Signal'}
          </p>
          <p className="text-[9px] text-gray-500 uppercase tracking-widest mt-2">Drag: Orient • Scroll: Focal Length</p>
        </div>
      </div>
    </div>
  );
};
