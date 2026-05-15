import { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Sphere, Html, PerspectiveCamera, OrbitControls, Stars, MeshDistortMaterial, MeshWobbleMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { 
  Users, 
  TrendingUp, 
  Disc, 
  History, 
  Layers, 
  User,
  Globe
} from 'lucide-react';

interface PlanetProps {
  position: [number, number, number];
  color: string;
  label: string;
  icon: any;
  onClick: () => void;
  scale?: number;
  type: string;
}

const Planet = ({ position, color, label, icon: Icon, onClick, scale = 1, type }: PlanetProps) => {
  const [hovered, setHovered] = useState(false);
  const meshRef = useRef<THREE.Mesh>(null!);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.005;
      const targetScale = hovered ? scale * 1.2 : scale;
      meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
      
      if (type === 'history') {
        meshRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
      }
    }
  });

  const renderMaterial = () => {
    switch (type) {
      case 'artists':
        return <MeshDistortMaterial color={color} speed={2} distort={0.3} radius={1} emissive={color} emissiveIntensity={0.5} />;
      case 'tracks':
        return <MeshWobbleMaterial color={color} speed={3} factor={0.6} emissive={color} emissiveIntensity={0.5} />;
      case 'albums':
        return (
          <meshStandardMaterial 
            color={color} 
            emissive={color} 
            emissiveIntensity={0.8} 
            roughness={0.1} 
            metalness={1}
            wireframe={!hovered}
          />
        );
      case 'history':
        return (
          <meshStandardMaterial 
            color={color} 
            emissive={color} 
            emissiveIntensity={0.5} 
            flatShading
          />
        );
      case 'playlists':
        return (
          <meshPhongMaterial 
            color={color} 
            emissive={color} 
            emissiveIntensity={0.4} 
            shininess={100}
            opacity={0.8}
            transparent
          />
        );
      case 'genres':
        return (
          <meshStandardMaterial 
            color={color} 
            emissive={color} 
            emissiveIntensity={0.6}
            wireframe
          />
        );
      default:
        return <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} />;
    }
  };

  return (
    <group position={position}>
      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
        <Sphere 
          ref={meshRef} 
          args={[1, 64, 64]} 
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
        >
          {renderMaterial()}
        </Sphere>
        
        <Html distanceFactor={12} position={[0, -1.8, 0]} center>
          <div className={`flex flex-col items-center gap-2 transition-all duration-300 ${hovered ? 'scale-110' : 'scale-100'}`}>
            <div className={`p-2 rounded-full bg-black/50 backdrop-blur-md border border-white/20 text-white shadow-xl`}>
              <Icon className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-black text-white uppercase tracking-[0.2em] whitespace-nowrap bg-black/50 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 shadow-xl">
              {label}
            </span>
          </div>
        </Html>
      </Float>
    </group>
  );
};

interface PlanetaryCatalogProps {
  onPlanetSelect: (type: string) => void;
  profile: any;
  analytics: any;
  activePlatform: 'spotify' | 'youtube';
}

export const PlanetaryCatalog = ({ onPlanetSelect, profile, analytics, activePlatform }: PlanetaryCatalogProps) => {
  const platformColor = activePlatform === 'spotify' ? '#1DB954' : '#FF0000';

  const planets = useMemo(() => [
    { type: 'artists', label: 'Top Artists', icon: Users, color: '#4f46e5', position: [-8, 4, 0] as [number, number, number] },
    { type: 'tracks', label: 'Top Tracks', icon: TrendingUp, color: '#10b981', position: [8, 4, 0] as [number, number, number] },
    { type: 'genres', label: 'Neural Genres', icon: Globe, color: '#facc15', position: [0, 8, -4] as [number, number, number] },
    { type: 'albums', label: 'Saved Albums', icon: Disc, color: '#8b5cf6', position: [-9, -4, 2] as [number, number, number] },
    { type: 'history', label: 'Recent History', icon: History, color: '#f59e0b', position: [9, -4, 2] as [number, number, number] },
    { type: 'playlists', label: 'Playlists', icon: Layers, color: '#ec4899', position: [0, -8, 4] as [number, number, number] },
  ], []);

  return (
    <div className="w-full h-[850px] relative bg-black/20 rounded-[4.5rem] border border-white/5 overflow-hidden">
      <Canvas shadows dpr={[1, 2]} camera={{ position: [0, 0, 20], fov: 45 }}>
        <PerspectiveCamera makeDefault position={[0, 0, 20]} />
        <OrbitControls 
          enableZoom={false} 
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.3}
          maxPolarAngle={Math.PI / 1.5}
          minPolarAngle={Math.PI / 3}
        />
        
        <Stars radius={100} depth={50} count={8000} factor={4} saturation={0} fade speed={1} />
        
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={2} color={platformColor} />
        <pointLight position={[-10, -10, -10]} intensity={1} color="#4f46e5" />
        <spotLight position={[0, 15, 0]} intensity={1.5} angle={0.3} penumbra={1} castShadow />

        {/* Central Platform Sun/Node */}
        <group position={[0, 0, 0]}>
           <Float speed={1.5} rotationIntensity={1} floatIntensity={1}>
              <Sphere args={[2.5, 64, 64]} onClick={() => onPlanetSelect('profile')}>
                <meshStandardMaterial 
                  color={platformColor} 
                  emissive={platformColor}
                  emissiveIntensity={1.5}
                  wireframe
                  transparent
                  opacity={0.4}
                />
              </Sphere>
              
              <Html distanceFactor={14} position={[0, 0, 0]} center>
                <div 
                  className="flex flex-col items-center gap-4 cursor-pointer group"
                  onClick={() => onPlanetSelect('profile')}
                >
                   <div className="relative">
                      <div className={`absolute -inset-6 bg-gradient-to-tr ${activePlatform === 'spotify' ? 'from-[#1DB954] to-[#191414]' : 'from-[#FF0000] to-[#282828]'} rounded-full blur-3xl opacity-40 group-hover:opacity-60 transition-opacity duration-700 animate-pulse`} />
                      {profile?.images?.[0]?.url || profile?.avatar_url ? (
                        <img 
                          src={profile.images?.[0]?.url || profile.avatar_url} 
                          className="w-28 h-28 rounded-full border-4 border-white/20 shadow-2xl group-hover:scale-110 transition-transform duration-500 relative z-10" 
                          alt="" 
                        />
                      ) : (
                        <div className="w-28 h-28 rounded-full bg-white/10 border-4 border-white/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-500 relative z-10">
                           <User className="w-12 h-12 text-white" />
                        </div>
                      )}
                   </div>
                   
                   <div className="flex flex-col items-center relative z-10">
                      <span className="text-base font-black text-white uppercase tracking-[0.3em] mb-1 drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]">
                        {profile?.display_name || profile?.username || 'Archive Node'}
                      </span>
                      {analytics && (
                         <div className="flex gap-3 mb-2">
                            <span className="text-[8px] font-black text-blue-400 uppercase tracking-widest bg-blue-500/10 px-3 py-1 rounded-md border border-blue-500/20">
                               {(analytics.total_minutes / 1000).toFixed(1)}K MIN
                            </span>
                            <span className="text-[8px] font-black text-purple-400 uppercase tracking-widest bg-purple-500/10 px-3 py-1 rounded-md border border-purple-500/20">
                               {analytics.total_tracks} NODES
                            </span>
                         </div>
                      )}
                      <div className="px-4 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-md">
                        <span className="text-[9px] font-black text-gray-300 uppercase tracking-[0.2em]">Profile Core</span>
                      </div>
                   </div>
                </div>
              </Html>
           </Float>
        </group>

        {planets.map((p) => (
          <Planet 
            key={p.type}
            type={p.type}
            position={p.position}
            color={p.color}
            label={p.label}
            icon={p.icon}
            onClick={() => onPlanetSelect(p.type)}
            scale={1.1}
          />
        ))}

        {/* Orbital Path Lines */}
        {planets.map((p, i) => (
          <mesh key={`orbit-${i}`} rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[Math.sqrt(p.position[0]**2 + p.position[1]**2 + p.position[2]**2) - 0.05, Math.sqrt(p.position[0]**2 + p.position[1]**2 + p.position[2]**2) + 0.05, 128]} />
            <meshBasicMaterial color="white" transparent opacity={0.05} side={THREE.DoubleSide} />
          </mesh>
        ))}
      </Canvas>
      
      <div className="absolute top-10 left-10 z-10">
        <div className="flex items-center gap-4 px-6 py-4 rounded-3xl bg-black/40 backdrop-blur-xl border border-white/10 shadow-2xl">
          <div className={`w-3 h-3 rounded-full animate-pulse ${activePlatform === 'spotify' ? 'bg-[#1DB954] shadow-[0_0_15px_#1DB954]' : 'bg-[#FF0000] shadow-[0_0_15px_#FF0000]'}`} />
          <div className="flex flex-col">
            <span className="text-xs font-black text-white uppercase tracking-[0.2em]">Orbital Analytics Active</span>
            <span className="text-[9px] text-gray-500 font-black uppercase tracking-widest">Neural Pathway Synchronized</span>
          </div>
        </div>
      </div>

      <div className="absolute bottom-12 right-12 z-10 text-right">
        <p className="text-xs font-black text-gray-500 uppercase tracking-[0.3em] mb-3">Navigation Command</p>
        <div className="px-6 py-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md inline-block shadow-2xl">
          <p className="text-[10px] font-black text-white uppercase italic tracking-tighter">Drag to Rotate • Click Planets to Visit • Hover for Identity</p>
        </div>
      </div>
    </div>
  );
};
