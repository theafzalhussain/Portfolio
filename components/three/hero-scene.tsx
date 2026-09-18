'use client'

import { Suspense, useEffect, useRef, useState, type ReactNode } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, MeshDistortMaterial, Sparkles, Stars } from '@react-three/drei'
import * as THREE from 'three'
import { useTheme } from '@/components/theme-provider'

interface SceneColors {
  core: string
  coreEmissive: string
  shell: string
  ringA: string
  ringB: string
  shapeA: string
  shapeB: string
  gridA: string
  gridB: string
  sparkles: string
  pointLight: string
}

const DARK: SceneColors = {
  core: '#5eead4',
  coreEmissive: '#0d9488',
  shell: '#2dd4bf',
  ringA: '#5eead4',
  ringB: '#34d399',
  shapeA: '#34d399',
  shapeB: '#64748b',
  gridA: '#115e59',
  gridB: '#1e293b',
  sparkles: '#5eead4',
  pointLight: '#34d399',
}

const LIGHT: SceneColors = {
  core: '#0d9488',
  coreEmissive: '#14b8a6',
  shell: '#0d9488',
  ringA: '#0d9488',
  ringB: '#059669',
  shapeA: '#059669',
  shapeB: '#94a3b8',
  gridA: '#99f6e4',
  gridB: '#cbd5e1',
  sparkles: '#0d9488',
  pointLight: '#059669',
}

/** MeshDistortMaterial core — a slow "liquid metal" orb. */
function CoreOrb({ color, emissive }: { color: string; emissive: string }) {
  const mesh = useRef<THREE.Mesh>(null)
  useFrame((_, delta) => {
    if (!mesh.current) return
    mesh.current.rotation.y += delta * 0.22
    mesh.current.rotation.x += delta * 0.06
  })
  return (
    <mesh ref={mesh}>
      <sphereGeometry args={[1.15, 64, 64]} />
      <MeshDistortMaterial
        color={color}
        emissive={emissive}
        emissiveIntensity={0.35}
        roughness={0.12}
        metalness={0.85}
        distort={0.42}
        speed={1.8}
      />
    </mesh>
  )
}

/** Counter-rotating wireframe shells — the "3D architecture" cage. */
function WireShells({ color, ringA, ringB }: { color: string; ringA: string; ringB: string }) {
  const group = useRef<THREE.Group>(null)
  useFrame((_, delta) => {
    if (!group.current) return
    group.current.rotation.y -= delta * 0.1
    group.current.rotation.z += delta * 0.03
  })
  return (
    <group ref={group}>
      <mesh rotation={[0.45, 0, 0.2]}>
        <icosahedronGeometry args={[1.95, 1]} />
        <meshBasicMaterial color={color} wireframe transparent opacity={0.14} />
      </mesh>
      <mesh rotation={[Math.PI / 2.7, 0, 0.35]}>
        <torusGeometry args={[2.55, 0.014, 8, 140]} />
        <meshStandardMaterial color={ringA} transparent opacity={0.5} roughness={0.4} metalness={0.4} />
      </mesh>
      <mesh rotation={[Math.PI / 1.9, 0.5, -0.4]}>
        <torusGeometry args={[2.9, 0.008, 8, 140]} />
        <meshStandardMaterial color={ringB} transparent opacity={0.35} roughness={0.4} metalness={0.4} />
      </mesh>
    </group>
  )
}

/** Small floating accents (octahedron, torus, wire box) with gentle drift. */
function FloatingShapes({ a, b }: { a: string; b: string }) {
  return (
    <>
      <Float speed={1.7} rotationIntensity={1.2} floatIntensity={1.6}>
        <mesh position={[2.45, 1.35, -0.6]}>
          <octahedronGeometry args={[0.34, 0]} />
          <meshStandardMaterial color={a} roughness={0.25} metalness={0.6} />
        </mesh>
      </Float>
      <Float speed={1.3} rotationIntensity={0.8} floatIntensity={1.3}>
        <mesh position={[-2.55, -1.15, 0.4]} rotation={[0.6, 0, 0.4]}>
          <torusGeometry args={[0.3, 0.1, 16, 48]} />
          <meshStandardMaterial color={b} roughness={0.3} metalness={0.5} />
        </mesh>
      </Float>
      <Float speed={1.5} rotationIntensity={1.1} floatIntensity={1.5}>
        <mesh position={[1.95, -1.75, -0.9]} rotation={[0.5, 0.7, 0]}>
          <boxGeometry args={[0.42, 0.42, 0.42]} />
          <meshStandardMaterial color={a} wireframe transparent opacity={0.65} />
        </mesh>
      </Float>
      <Float speed={1.1} rotationIntensity={0.6} floatIntensity={1.1}>
        <mesh position={[-2.1, 1.9, -1.2]}>
          <tetrahedronGeometry args={[0.26, 0]} />
          <meshStandardMaterial color={b} roughness={0.35} metalness={0.5} />
        </mesh>
      </Float>
    </>
  )
}

/** Subtle mouse-parallax rig so the whole structure reacts to the pointer. */
function ParallaxRig({ children }: { children: ReactNode }) {
  const group = useRef<THREE.Group>(null)
  useFrame((state) => {
    if (!group.current) return
    const { x, y } = state.pointer
    group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, x * 0.22, 0.045)
    group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, -y * 0.16, 0.045)
  })
  return <group ref={group}>{children}</group>
}

export default function HeroScene() {
  const { theme } = useTheme()
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    setReduced(window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  }, [])

  const c = theme === 'light' ? LIGHT : DARK

  return (
    <Canvas
      dpr={[1, 1.8]}
      camera={{ position: [0, 0, 7.5], fov: 42 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      frameloop={reduced ? 'never' : 'always'}
      aria-hidden="true"
      style={{ background: 'transparent' }}
    >
      <ambientLight intensity={theme === 'light' ? 0.7 : 0.5} />
      <directionalLight position={[4, 6, 5]} intensity={1.15} />
      <pointLight position={[-4, -2, -4]} intensity={30} color={c.pointLight} />
      <Suspense fallback={null}>
        <ParallaxRig>
          <CoreOrb color={c.core} emissive={c.coreEmissive} />
          <WireShells color={c.shell} ringA={c.ringA} ringB={c.ringB} />
          <FloatingShapes a={c.shapeA} b={c.shapeB} />
        </ParallaxRig>
        <Stars radius={55} depth={35} count={1400} factor={3} saturation={0} fade speed={0.6} />
        <Sparkles count={70} scale={[9, 6, 6]} size={1.6} speed={0.35} color={c.sparkles} />
        <gridHelper
          args={[36, 36, c.gridA, c.gridB]}
          position={[0, -3.2, 0]}
          material-transparent
          material-opacity={0.35}
        />
      </Suspense>
    </Canvas>
  )
}
