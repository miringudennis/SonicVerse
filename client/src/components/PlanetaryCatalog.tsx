import { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Sphere, Html, PerspectiveCamera, OrbitControls, Stars } from '@react-three/drei';
import * as THREE from 'three';
import { 
  Users, 
  TrendingUp, 
  Disc, 
  History, 
  Layers, 
  User
} from 'lucide-react';

interface PlanetProps {
  position: [number, number, number];
  color: string;
  label: string;
  icon: any;
  onClick: () => void;
  scale?: number;
  emissiveIntensity?: number;
}

const Planet = ({ position, color, label, icon: Icon, onClick, scale = 1, emissiveIntensity = 1 }: PlanetProps) => {
  const [hovered, setHovered] = useState(false);
  const meshRef = useRef<THREE.Mesh>(null!);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.005;
      if (hovered) {
        meshRef.current.scale.lerp(new THREE.Vector3(scale * 1.2, scale * 1.2, scale * 1.2), 0.1);
      } else {
        meshRef.current.scale.lerp(new THREE.Vector3(scale, scale, scale), 0.1);
      }
    }
  });

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
          <meshStandardMaterial 
            color={color} 
            emissive={color}
            emissiveIntensity={hovered ? emissiveIntensity * 2 : emissiveIntensity}
            metalness={0.8}
            roughness={0.2}
          />
        </Sphere>
        
        <Html distanceFactor={10} position={[0, -1.5, 0]} center>
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
  activePlatform: 'spotify' | 'youtube';
}

export const PlanetaryCatalog = ({ onPlanetSelect, profile, activePlatform }: PlanetaryCatalogProps) => {
  const platformColor = activePlatform === 'spotify' ? '#1DB954' : '#FF0000';

  const planets = [
    { type: 'artists', label: 'Top Artists', icon: Users, color: '#4f46e5', position: [-4, 2, 0] as [number, number, number] },
    { type: 'tracks', label: 'Top Tracks', icon: TrendingUp, color: '#10b981', position: [4, 2, 0] as [number, number, number] },
    { type: 'albums', label: 'Saved Albums', icon: Disc, color: '#8b5cf6', position: [-5, -2, -2] as [number, number, number] },
    { type: 'history', label: 'Recent History', icon: History, color: '#f59e0b', position: [5, -2, -2] as [number, number, number] },
    { type: 'playlists', label: 'Playlists', icon: Layers, color: '#ec4899', position: [0, -4, 2] as [number, number, number] },
  ];

  return (
    <div className="w-full h-[600px] relative bg-black/20 rounded-[3rem] border border-white/5 overflow-hidden">
      <Canvas shadows camera={{ position: [0, 0, 12], fov: 50 }}>
        <PerspectiveCamera makeDefault position={[0, 0, 12]} />
        <OrbitControls 
          enableZoom={false} 
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.5}
          maxPolarAngle={Math.PI / 1.5}
          minPolarAngle={Math.PI / 3}
        />
        
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        
        <ambientLight intensity={0.2} />
        <pointLight position={[10, 10, 10]} intensity={1.5} color={platformColor} />
        <pointLight position={[-10, -10, -10]} intensity={1} color="#4f46e5" />

        {/* Central Platform Sun/Node */}
        <group position={[0, 0, 0]}>
           <Float speed={1.5} rotationIntensity={1} floatIntensity={1}>
              <Sphere args={[1.5, 64, 64]} onClick={() => onPlanetSelect('profile')}>
                <meshStandardMaterial 
                  color={platformColor} 
                  emissive={platformColor}
                  emissiveIntensity={2}
                  wireframe
                  transparent
                  opacity={0.6}
                />
              </Sphere>
              <Html distanceFactor={10} position={[0, 0, 0]} center>
                <div 
                  className="flex flex-col items-center gap-4 cursor-pointer group"
                  onClick={() => onPlanetSelect('profile')}
                >
                   {profile?.images?.[0]?.url || profile?.avatar_url ? (
                     <img 
                       src={profile.images?.[0]?.url || profile.avatar_url} 
                       className="w-20 h-20 rounded-full border-4 border-white/20 shadow-2xl group-hover:scale-110 transition-transform duration-500" 
                       alt="" 
                     />
                   ) : (
                     <div className="w-20 h-20 rounded-full bg-white/10 border-4 border-white/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                        <User className="w-8 h-8 text-white" />
                     </div>
                   )}
                   <div className="flex flex-col items-center">
                      <span className="text-xs font-black text-white uppercase tracking-[0.3em] mb-1 drop-shadow-lg">
                        {profile?.display_name || profile?.username || 'Archive Node'}
                      </span>
                      <div className="px-3 py-1 rounded-full bg-white/10 border border-white/20 backdrop-blur-md">
                        <span className="text-[8px] font-black text-gray-300 uppercase tracking-[0.2em]">Profile Planet</span>
                      </div>
                   </div>
                </div>
              </Html>
           </Float>
        </group>

        {planets.map((p) => (
          <Planet 
            key={p.type}
            position={p.position}
            color={p.color}
            label={p.label}
            icon={p.icon}
            onClick={() => onPlanetSelect(p.type)}
            scale={0.8}
            emissiveIntensity={1}
          />
        ))}

        {/* Orbital Rings for visual effect */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[6, 6.1, 64]} />
          <meshBasicMaterial color="white" transparent opacity={0.05} side={THREE.DoubleSide} />
        </mesh>
        <mesh rotation={[Math.PI / 2.5, 0, 0]}>
          <ringGeometry args={[8, 8.1, 64]} />
          <meshBasicMaterial color="white" transparent opacity={0.03} side={THREE.DoubleSide} />
        </mesh>
      </Canvas>
      
      <div className="absolute top-8 left-8 z-10">
        <div className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-black/40 backdrop-blur-md border border-white/10">
          <div className={`w-2 h-2 rounded-full animate-pulse ${activePlatform === 'spotify' ? 'bg-[#1DB954]' : 'bg-[#FF0000]'}`} />
          <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Orbital Navigation Active</span>
        </div>
      </div>

      <div className="absolute bottom-8 right-8 z-10 text-right">
        <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-1">Navigation System</p>
        <p className="text-xs font-black text-white uppercase italic tracking-tighter">Drag to Rotate • Click Planets to Visit</p>
      </div>
    </div>
  );
};
