
import React, { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Points, PointMaterial } from "@react-three/drei";
import * as THREE from "three";


function FloatingOrb({ position, scale, color, speed }) {
  const mesh = useRef();
  const offset = useMemo(() => Math.random() * Math.PI * 2, []);

  useFrame(({ clock }) => {
    if (!mesh.current) return;
    const t = clock.getElapsedTime() * speed + offset;
    mesh.current.position.y = position[1] + Math.sin(t) * 0.4;
    mesh.current.position.x = position[0] + Math.cos(t * 0.6) * 0.2;
    mesh.current.rotation.z = t * 0.15;
  });

  return (
    <mesh ref={mesh} position={position} scale={scale}>
      <sphereGeometry args={[1, 32, 32]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.4}
        roughness={0.05}
        metalness={0.1}
        transparent
        opacity={0.18}
      />
    </mesh>
  );
}


function Particles({ count = 300 }) {
  const ref = useRef();

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3 + 0] = (Math.random() - 0.5) * 18;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 10;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 6;
    }
    return arr;
  }, [count]);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.rotation.y = clock.getElapsedTime() * 0.02;
    ref.current.rotation.x = clock.getElapsedTime() * 0.008;
  });

  return (
    <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color="#818cf8"
        size={0.055}
        sizeAttenuation
        depthWrite={false}
        opacity={0.7}
      />
    </Points>
  );
}


function GridLines() {
  const linesMesh = useMemo(() => {
    const geom = new THREE.BufferGeometry();
    const verts = [];
    const size = 12;
    const divisions = 16;
    const step = (size * 2) / divisions;
    for (let i = 0; i <= divisions; i++) {
      const x = -size + i * step;
      verts.push(x, -4.5, -size, x, -4.5, size);
      verts.push(-size, -4.5, x - size + i * step, size, -4.5, x - size + i * step);
    }
    geom.setAttribute("position", new THREE.Float32BufferAttribute(verts, 3));
    return geom;
  }, []);

  return (
    <lineSegments geometry={linesMesh}>
      <lineBasicMaterial color="#6366f1" transparent opacity={0.08} />
    </lineSegments>
  );
}


function Ring({ position, rotation, radius, color, speed }) {
  const mesh = useRef();
  useFrame(({ clock }) => {
    if (!mesh.current) return;
    mesh.current.rotation.z = clock.getElapsedTime() * speed;
    mesh.current.rotation.x = clock.getElapsedTime() * speed * 0.4;
  });
  return (
    <mesh ref={mesh} position={position} rotation={rotation}>
      <torusGeometry args={[radius, 0.025, 16, 80]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.6}
        transparent
        opacity={0.3}
      />
    </mesh>
  );
}


function Scene() {
  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[5, 5, 5]} intensity={1.2} color="#818cf8" />
      <pointLight position={[-5, -3, -5]} intensity={0.6} color="#c4b5fd" />

      
      <FloatingOrb position={[-4, 1.5, -3]} scale={2.8} color="#6366f1" speed={0.3} />
      <FloatingOrb position={[4.5, -1, -4]} scale={2.2} color="#818cf8" speed={0.25} />
      <FloatingOrb position={[0, 2.5, -5]} scale={1.6} color="#c4b5fd" speed={0.4} />
      <FloatingOrb position={[-6, -2, -2]} scale={1.4} color="#4f46e5" speed={0.2} />

      
      <Ring position={[3, 1, -3]} rotation={[0.5, 0.3, 0]} radius={1.8} color="#818cf8" speed={0.18} />
      <Ring position={[-3, 0.5, -4]} rotation={[1, 0.5, 0]} radius={1.3} color="#6366f1" speed={0.22} />
      <Ring position={[0.5, -1.5, -2]} rotation={[0.8, 0.2, 0]} radius={1.0} color="#c4b5fd" speed={0.3} />

      
      <Particles count={350} />

      
      <GridLines />
    </>
  );
}


export default function DashboardCanvas() {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
        overflow: "hidden",
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 7], fov: 55 }}
        style={{ width: "100%", height: "100%" }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 1.5]}
      >
        <Scene />
      </Canvas>
    </div>
  );
}
