import { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  uniform float uTime;
  uniform vec2 uResolution;
  varying vec2 vUv;

  void main() {
    vec2 p = vUv * 2.0 - 1.0;
    p.x *= uResolution.x / uResolution.y;

    float d = length(p);
    
    // Create animated color waves
    vec3 col1 = vec3(0.02, 0.05, 0.2); // Deep Blue
    vec3 col2 = vec3(0.4, 0.1, 0.5);   // Deep Purple
    vec3 col3 = vec3(0.1, 0.0, 0.2);   // Darker shade
    
    float noise = sin(p.x * 2.0 + uTime * 0.5) * cos(p.y * 2.0 + uTime * 0.3);
    float mask = smoothstep(0.4, 0.0, d + noise * 0.2);
    
    vec3 finalCol = mix(col1, col2, 0.5 + 0.5 * sin(uTime * 0.2 + p.x));
    finalCol = mix(finalCol, col3, noise * 0.5);
    
    gl_FragColor = vec4(finalCol * (1.0 - d * 0.5), 1.0);
  }
`;

function GradientPlane() {
  const meshRef = useRef<THREE.Mesh>(null!);
  const { size } = useThree();
  
  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uResolution: { value: new THREE.Vector2(size.width, size.height) }
  }), [size]);

  useFrame((state) => {
    if (meshRef.current) {
      (meshRef.current.material as THREE.ShaderMaterial).uniforms.uTime.value = state.clock.getElapsedTime();
    }
  });

  return (
    <mesh ref={meshRef} scale={[size.width / 100, size.height / 100, 1]}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
      />
    </mesh>
  );
}

export const ShaderBackground = () => {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none opacity-40">
      <Canvas camera={{ position: [0, 0, 1] }}>
        <GradientPlane />
      </Canvas>
    </div>
  );
};
