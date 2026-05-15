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
  color: string;
  label: string;
  icon: any;
  onClick: () => void;
  scale?: number;
  type: string;
  orbitRadius: number;
  orbitSpeed: number;
  orbitOffset: number;
}

const Planet = ({ color, label, icon: Icon, onClick, scale = 1, type, orbitRadius, orbitSpeed, orbitOffset }: PlanetProps) => {
  const [hovered, setHovered] = useState(false);
  const meshRef = useRef<THREE.Mesh>(null!);
  const groupRef = useRef<THREE.Group>(null!);

  useFrame((state) => {
    const t = state.clock.getElapsedTime() * orbitSpeed + orbitOffset;
    if (groupRef.current) {
      groupRef.current.position.x = Math.cos(t) * orbitRadius;
      groupRef.current.position.z = Math.sin(t) * orbitRadius;
    }
    
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
      const targetScale = hovered ? scale * 1.3 : scale;
      meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
      
      if (type === 'history') {
        meshRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
      }
    }
  });

  const renderMaterial = () => {
    switch (type) {
      case 'artists':
        return <MeshDistortMaterial color={color} speed={2} distort={0.4} radius={1} emissive={color} emissiveIntensity={0.5} />;
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
    <group ref={groupRef}>
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
        
        <Html distanceFactor={15} position={[0, -1.8, 0]} center>
          <div className={`flex flex-col items-center gap-2 transition-all duration-300 ${hovered ? 'scale-110' : 'scale-100'}`}>
            <div className={`p-2 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white shadow-xl`}>
              <Icon className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-black text-white uppercase tracking-[0.2em] whitespace-nowrap bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 shadow-xl">
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
  const isMobile = window.innerWidth < 768;
  const platformColor = activePlatform === 'spotify' ? '#1DB954' : '#FF0000';

  const planets = useMemo(() => [
    { type: 'artists', label: 'Top Artists', icon: Users, color: '#4f46e5', orbitRadius: isMobile ? 6 : 8, orbitSpeed: 0.2, orbitOffset: 0 },
    { type: 'tracks', label: 'Top Tracks', icon: TrendingUp, color: '#10b981', orbitRadius: isMobile ? 8.5 : 11, orbitSpeed: 0.15, orbitOffset: Math.PI * 0.4 },
    { type: 'genres', label: 'Neural Genres', icon: Globe, color: '#facc15', orbitRadius: isMobile ? 11 : 14, orbitSpeed: 0.1, orbitOffset: Math.PI * 0.8 },
    { type: 'albums', label: 'Saved Albums', icon: Disc, color: '#8b5cf6', orbitRadius: isMobile ? 13.5 : 17, orbitSpeed: 0.08, orbitOffset: Math.PI * 1.2 },
    { type: 'history', label: 'Recent History', icon: History, color: '#f59e0b', orbitRadius: isMobile ? 16 : 20, orbitSpeed: 0.06, orbitOffset: Math.PI * 1.6 },
    { type: 'playlists', label: 'Playlists', icon: Layers, color: '#ec4899', orbitRadius: isMobile ? 18.5 : 23, orbitSpeed: 0.05, orbitOffset: Math.PI * 1.9 },
  ], [isMobile]);

  return (
    <div className="w-full h-[500px] sm:h-[650px] md:h-[850px] relative bg-black/20 rounded-[2.5rem] sm:rounded-[3.5rem] md:rounded-[4.5rem] border border-white/5 overflow-hidden">
      <Canvas shadows dpr={[1, 2]} camera={{ position: [20, 20, 20], fov: isMobile ? 55 : 45 }}>
        <PerspectiveCamera makeDefault position={[20, 20, 20]} />
        <OrbitControls 
          enableZoom={true} 
          enablePan={false}
          minDistance={10}
          maxDistance={isMobile ? 50 : 40}
          autoRotate={false}
        />
        
        <Stars radius={100} depth={50} count={isMobile ? 5000 : 10000} factor={4} saturation={0} fade speed={1} />
        
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={2.5} color={platformColor} />
        <pointLight position={[-10, -10, -10]} intensity={1.5} color="#4f46e5" />
        <spotLight position={[0, 20, 0]} intensity={2} angle={0.3} penumbra={1} castShadow />

        {/* Central Platform Sun/Node */}
        <group position={[0, 0, 0]}>
           <Float speed={1.5} rotationIntensity={1} floatIntensity={1}>
              <Sphere args={[isMobile ? 2 : 3, 64, 64]} onClick={() => onPlanetSelect('profile')}>
                <meshStandardMaterial 
                  color={platformColor} 
                  emissive={platformColor}
                  emissiveIntensity={2}
                  wireframe
                  transparent
                  opacity={0.3}
                />
              </Sphere>
              
              <Html distanceFactor={15} position={[0, 0, 0]} center>
                <div 
                  className="flex flex-col items-center gap-3 sm:gap-4 cursor-pointer group"
                  onClick={() => onPlanetSelect('profile')}
                >
                   <div className="relative">
                      <div className={`absolute -inset-4 sm:-inset-8 bg-gradient-to-tr ${activePlatform === 'spotify' ? 'from-[#1DB954] to-[#191414]' : 'from-[#FF0000] to-[#282828]'} rounded-full blur-2xl sm:blur-3xl opacity-50 group-hover:opacity-70 transition-opacity duration-700 animate-pulse`} />
                      {profile?.images?.[0]?.url || profile?.avatar_url ? (
                        <img 
                          src={profile.images?.[0]?.url || profile.avatar_url} 
                          className="w-20 h-20 sm:w-32 h-32 rounded-full border-2 sm:border-4 border-white/20 shadow-2xl group-hover:scale-110 transition-transform duration-500 relative z-10" 
                          alt="" 
                        />
                      ) : (
                        <div className="w-20 h-20 sm:w-32 h-32 rounded-full bg-white/10 border-2 sm:border-4 border-white/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-500 relative z-10">
                           <User className="w-8 h-8 sm:w-12 sm:h-12 text-white" />
                        </div>
                      )}
                   </div>
                   
                   <div className="flex flex-col items-center relative z-10">
                      <span className="text-xs sm:text-lg font-black text-white uppercase tracking-[0.2em] sm:tracking-[0.3em] mb-1 drop-shadow-[0_0_15px_rgba(255,255,255,0.5)] whitespace-nowrap">
                        {profile?.display_name || profile?.username || 'Archive Node'}
                      </span>
                      {analytics && (
                         <div className="flex gap-2 sm:gap-3 mb-2">
                            <span className="text-[7px] sm:text-[9px] font-black text-blue-400 uppercase tracking-widest bg-blue-500/10 px-2 sm:px-3 py-0.5 sm:py-1 rounded-md border border-blue-500/20 backdrop-blur-md">
                               {(analytics.total_minutes / 1000).toFixed(1)}K MIN
                            </span>
                            <span className="text-[7px] sm:text-[9px] font-black text-purple-400 uppercase tracking-widest bg-purple-500/10 px-2 sm:px-3 py-0.5 sm:py-1 rounded-md border border-purple-500/20 backdrop-blur-md">
                               {analytics.total_tracks} NODES
                            </span>
                         </div>
                      )}
                      <div className="px-3 sm:px-5 py-1 sm:py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-md">
                        <span className="text-[8px] sm:text-[10px] font-black text-gray-300 uppercase tracking-[0.2em]">Profile Core</span>
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
            color={p.color}
            label={p.label}
            icon={p.icon}
            onClick={() => onPlanetSelect(p.type)}
            scale={isMobile ? 0.8 : 1.2}
            orbitRadius={p.orbitRadius}
            orbitSpeed={p.orbitSpeed}
            orbitOffset={p.orbitOffset}
          />
        ))}

        {/* Orbital Path Rings */}
        {planets.map((p, i) => (
          <mesh key={`orbit-${i}`} rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[p.orbitRadius - 0.05, p.orbitRadius + 0.05, 128]} />
            <meshBasicMaterial color="white" transparent opacity={0.08} side={THREE.DoubleSide} />
          </mesh>
        ))}
      </Canvas>
      
      <div className="absolute top-4 left-4 sm:top-10 sm:left-10 z-10">
        <div className="flex items-center gap-3 sm:gap-4 px-4 py-3 sm:px-6 sm:py-4 rounded-2xl sm:rounded-3xl bg-black/60 backdrop-blur-xl border border-white/10 shadow-2xl">
          <div className={`w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 rounded-full animate-pulse ${activePlatform === 'spotify' ? 'bg-[#1DB954] shadow-[0_0_15px_#1DB954]' : 'bg-[#FF0000] shadow-[0_0_15px_#FF0000]'}`} />
          <div className="flex flex-col">
            <span className="text-[10px] sm:text-sm font-black text-white uppercase tracking-[0.2em]">Orbital Analytics Engine</span>
            <span className="text-[8px] sm:text-[10px] text-gray-500 font-black uppercase tracking-widest">Gravitational Sync: Nominal</span>
          </div>
        </div>
      </div>

      <div className="absolute bottom-6 sm:bottom-12 right-6 sm:right-12 z-10 text-right max-w-[150px] sm:max-w-none">
        <p className="hidden sm:block text-[10px] sm:text-xs font-black text-gray-500 uppercase tracking-[0.3em] mb-3">Navigation Command</p>
        <div className="px-4 py-2 sm:px-6 sm:py-3 rounded-xl sm:rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md inline-block shadow-2xl">
          <p className="text-[8px] sm:text-[10px] font-black text-white uppercase italic tracking-tighter">
            {isMobile ? 'Drag to Orient • Click to Visit' : 'Drag to Rotate • Scroll to Zoom • Click Planets to Visit'}
          </p>
        </div>
      </div>
    </div>
  );
};
