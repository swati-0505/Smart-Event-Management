
import React, { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Points, PointMaterial } from "@react-three/drei";
import * as THREE from "three";


function Stars({ count = 600, radius = 30, size = 0.04, speed = 0.04, color = "#a5b4fc" }) {
  const ref = useRef();
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * 2 * Math.PI;
      const phi = Math.acos(2 * Math.random() - 1);
      arr[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      arr[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      arr[i * 3 + 2] = radius * Math.cos(phi);
    }
    return arr;
  }, [count, radius]);

  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.y = clock.getElapsedTime() * speed;
      ref.current.rotation.x = clock.getElapsedTime() * speed * 0.3;
    }
  });

  return (
    <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial transparent color={color} size={size} sizeAttenuation depthWrite={false} opacity={0.8} />
    </Points>
  );
}


function AuroraTorus({ position, args, color, emissive, speed, rotAxis = [0.3, 1, 0.2] }) {
  const mesh = useRef();
  useFrame(({ clock }) => {
    if (!mesh.current) return;
    const t = clock.getElapsedTime() * speed;
    mesh.current.rotation.x = rotAxis[0] * t;
    mesh.current.rotation.y = rotAxis[1] * t;
    mesh.current.rotation.z = rotAxis[2] * t;
  });
  return (
    <mesh ref={mesh} position={position}>
      <torusKnotGeometry args={args} />
      <meshStandardMaterial
        color={color}
        emissive={emissive}
        emissiveIntensity={0.55}
        wireframe={false}
        roughness={0.1}
        metalness={0.4}
        transparent
        opacity={0.22}
      />
    </mesh>
  );
}


function DriftingShape({ startPos, type = "oct", speed = 0.18, rotSpeed = 0.4, color = "#818cf8" }) {
  const mesh = useRef();
  const offset = useMemo(() => Math.random() * 10, []);

  useFrame(({ clock }) => {
    if (!mesh.current) return;
    const t = clock.getElapsedTime() * speed + offset;
    
    mesh.current.position.y = startPos[1] + ((t * 0.5) % 12) - 6;
    mesh.current.position.x = startPos[0] + Math.sin(t * 0.4) * 0.8;
    mesh.current.rotation.x += rotSpeed * 0.01;
    mesh.current.rotation.y += rotSpeed * 0.008;
  });

  return (
    <mesh ref={mesh} position={startPos}>
      {type === "oct" ? (
        <octahedronGeometry args={[0.35, 0]} />
      ) : (
        <boxGeometry args={[0.45, 0.45, 0.45]} />
      )}
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.4}
        wireframe
        transparent
        opacity={0.55}
      />
    </mesh>
  );
}


function MovingLight({ radius = 5, speed = 0.3, color = "#818cf8", intensity = 2.5, yOffset = 0 }) {
  const light = useRef();
  useFrame(({ clock }) => {
    if (!light.current) return;
    const t = clock.getElapsedTime() * speed;
    light.current.position.x = Math.sin(t) * radius;
    light.current.position.z = Math.cos(t) * radius;
    light.current.position.y = yOffset + Math.sin(t * 0.4) * 1.5;
  });
  return <pointLight ref={light} color={color} intensity={intensity} distance={20} />;
}


function WavePlane() {
  const mesh = useRef();
  const geomRef = useRef();

  const geometry = useMemo(() => {
    const g = new THREE.PlaneGeometry(30, 8, 60, 20);
    return g;
  }, []);

  useFrame(({ clock }) => {
    if (!geomRef.current) return;
    const t = clock.getElapsedTime();
    const pos = geomRef.current.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      pos.setZ(i, Math.sin(x * 0.4 + t * 0.8) * 0.25 + Math.cos(y * 0.6 + t * 0.5) * 0.15);
    }
    pos.needsUpdate = true;
    geomRef.current.computeVertexNormals();
  });

  return (
    <mesh ref={mesh} rotation={[-Math.PI / 2.5, 0, 0]} position={[0, -4, -2]}>
      <primitive object={geometry} ref={geomRef} />
      <meshStandardMaterial
        color="#4338ca"
        emissive="#312e81"
        emissiveIntensity={0.3}
        wireframe
        transparent
        opacity={0.18}
      />
    </mesh>
  );
}


function Scene() {
  const shapes = useMemo(
    () =>
      Array.from({ length: 14 }, (_, i) => ({
        key: i,
        startPos: [(Math.random() - 0.5) * 18, (Math.random() - 0.5) * 12, (Math.random() - 0.5) * 6 - 3],
        type: i % 2 === 0 ? "oct" : "box",
        speed: 0.08 + Math.random() * 0.12,
        rotSpeed: 0.3 + Math.random() * 0.5,
        color: ["#818cf8", "#6366f1", "#c4b5fd", "#a5b4fc"][i % 4],
      })),
    []
  );

  return (
    <>
      <ambientLight intensity={0.15} />

      
      <MovingLight radius={6} speed={0.25} color="#6366f1" intensity={3} yOffset={1} />
      <MovingLight radius={8} speed={0.18} color="#c4b5fd" intensity={2} yOffset={-1} />
      <MovingLight radius={4} speed={0.4} color="#818cf8" intensity={1.5} yOffset={2} />

      
      <Stars count={700} radius={28} size={0.04} speed={0.025} color="#e0e7ff" />
      <Stars count={300} radius={16} size={0.06} speed={0.045} color="#818cf8" />

      
      <AuroraTorus
        position={[6, 1, -8]}
        args={[2.5, 0.6, 80, 14, 3, 5]}
        color="#4f46e5"
        emissive="#6366f1"
        speed={0.07}
        rotAxis={[0.2, 1, 0.15]}
      />
      <AuroraTorus
        position={[-7, -1.5, -10]}
        args={[2, 0.45, 80, 14, 2, 3]}
        color="#7c3aed"
        emissive="#a855f7"
        speed={0.055}
        rotAxis={[0.4, 0.8, 0.3]}
      />
      <AuroraTorus
        position={[1, 3, -12]}
        args={[1.5, 0.3, 64, 12, 4, 7]}
        color="#312e81"
        emissive="#818cf8"
        speed={0.09}
        rotAxis={[0.1, 0.5, 0.6]}
      />

      
      {shapes.map((s) => (
        <DriftingShape key={s.key} {...s} />
      ))}

      
      <WavePlane />
    </>
  );
}


export default function HeroCanvas() {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 10], fov: 60 }}
        style={{ width: "100%", height: "100%" }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 1.5]}
      >
        <Scene />
      </Canvas>
    </div>
  );
}
