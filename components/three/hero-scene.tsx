'use client'

import { Suspense, useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { MeshDistortMaterial, Sparkles, Stars } from '@react-three/drei'
import * as THREE from 'three'
import { useTheme } from '@/components/theme-provider'

/* ─────────────────────────────────────────────
   Orbit system
   Four tilted planes. Each carries a visible ring,
   a couple of solid satellites, and skill labels.
   ───────────────────────────────────────────── */

interface Orbit {
  r: number
  inc: number
  node: number
  opacity: number
}

const ORBITS: Orbit[] = [
  { r: 3.7, inc: 1.34, node: 0.22, opacity: 0.4 },
  { r: 4.35, inc: 1.05, node: -0.55, opacity: 0.3 },
  { r: 5.0, inc: 1.52, node: 0.85, opacity: 0.2 },
  { r: 5.65, inc: 0.88, node: 0.4, opacity: 0.13 },
]

interface OrbitSkill {
  label: string
  color: string
  orbit: number
  phase: number
  speed: number
}

/** The stack that actually ships in his projects, riding the orbits. */
const ORBIT_SKILLS: OrbitSkill[] = [
  { label: 'HTML & CSS', color: '#ff8904', orbit: 0, phase: 0.0, speed: 0.115 },
  { label: 'JavaScript', color: '#ffb900', orbit: 1, phase: 1.9, speed: 0.094 },
  { label: 'React', color: '#22d3ee', orbit: 0, phase: 3.3, speed: 0.115 },
  { label: 'Next.js', color: '#e7ecea', orbit: 2, phase: 0.8, speed: 0.076 },
  { label: 'TypeScript', color: '#38bdf8', orbit: 3, phase: 2.6, speed: 0.063 },
  { label: 'Node.js', color: '#4ade80', orbit: 1, phase: 4.6, speed: 0.094 },
  { label: 'Express', color: '#b9c2be', orbit: 2, phase: 3.9, speed: 0.076 },
  { label: 'MongoDB', color: '#34d399', orbit: 0, phase: 5.4, speed: 0.115 },
  { label: 'Redis', color: '#ff6f61', orbit: 3, phase: 5.1, speed: 0.063 },
  { label: 'Tailwind', color: '#22d3ee', orbit: 2, phase: 1.9, speed: 0.076 },
  { label: 'Socket.IO', color: '#a78bfa', orbit: 3, phase: 0.3, speed: 0.063 },
  { label: 'BullMQ', color: '#fb923c', orbit: 1, phase: 0.6, speed: 0.094 },
  { label: 'Mongoose', color: '#34d399', orbit: 2, phase: 5.6, speed: 0.076 },
  { label: 'Git', color: '#ff8904', orbit: 0, phase: 1.7, speed: 0.115 },
]

export { ORBIT_SKILLS }

/** Position on a tilted orbit plane: rotate in-plane point by inclination, then node. */
function orbitPosition(out: THREE.Vector3, orbit: Orbit, angle: number) {
  const x = Math.cos(angle) * orbit.r
  const z = Math.sin(angle) * orbit.r
  const y2 = -z * Math.sin(orbit.inc)
  const z2 = z * Math.cos(orbit.inc)
  out.set(
    x * Math.cos(orbit.node) + z2 * Math.sin(orbit.node),
    y2,
    -x * Math.sin(orbit.node) + z2 * Math.cos(orbit.node),
  )
  return out
}

interface SceneColors {
  core: string
  emissive: string
  wire: string
  dust: string
  rim: string
}

const DARK: SceneColors = {
  core: '#34d399',
  emissive: '#0d9488',
  wire: '#5eead4',
  dust: '#7fe8dd',
  rim: '#0f6f62',
}

// A metallic mint on a near-white page reflects straight to white and
// disappears, so light mode uses a dark, diffuse body instead.
const LIGHT: SceneColors = {
  core: '#0a4d45',
  emissive: '#0d5f52',
  wire: '#0b6355',
  dust: '#0f7a6a',
  rim: '#2f9b88',
}

/* ─────────────────────────────────────────────
   Core + cage
   ───────────────────────────────────────────── */

function Core({ colors, reduced }: { colors: SceneColors; reduced: boolean }) {
  const mesh = useRef<THREE.Mesh>(null)

  useFrame((_, delta) => {
    if (reduced || !mesh.current) return
    mesh.current.rotation.y += delta * 0.16
    mesh.current.rotation.x += delta * 0.05
  })

  return (
    <mesh ref={mesh}>
      <icosahedronGeometry args={[2.05, 24]} />
      <MeshDistortMaterial
        color={colors.core}
        emissive={colors.emissive}
        emissiveIntensity={0.35}
        roughness={0.24}
        metalness={0.9}
        distort={reduced ? 0 : 0.28}
        speed={1.1}
      />
    </mesh>
  )
}

function Cage({ colors, reduced }: { colors: SceneColors; reduced: boolean }) {
  const mesh = useRef<THREE.Mesh>(null)

  useFrame((_, delta) => {
    if (reduced || !mesh.current) return
    mesh.current.rotation.y -= delta * 0.1
    mesh.current.rotation.z += delta * 0.05
  })

  return (
    <mesh ref={mesh}>
      <icosahedronGeometry args={[3.15, 1]} />
      <meshBasicMaterial color={colors.wire} wireframe transparent opacity={0.26} />
    </mesh>
  )
}

function Rings({ colors }: { colors: SceneColors }) {
  return (
    <>
      {ORBITS.map((o, i) => (
        <group key={i} rotation={[0, o.node, 0]}>
          <mesh rotation={[o.inc, 0, 0]}>
            <torusGeometry args={[o.r, 0.0075, 8, 180]} />
            <meshBasicMaterial color={colors.wire} transparent opacity={o.opacity} />
          </mesh>
        </group>
      ))}
    </>
  )
}

function Satellites({ colors, reduced }: { colors: SceneColors; reduced: boolean }) {
  const refs = useRef<(THREE.Mesh | null)[]>([])
  const tmp = useMemo(() => new THREE.Vector3(), [])
  const config = useMemo(
    () =>
      Array.from({ length: 6 }, (_, i) => ({
        orbit: i % ORBITS.length,
        phase: (i / 6) * Math.PI * 2 + 0.6,
        speed: 0.13 + i * 0.02,
      })),
    [],
  )

  const elapsed = useRef(0)

  useFrame((_, delta) => {
    if (reduced) return
    elapsed.current += delta
    const t = elapsed.current
    config.forEach((c, i) => {
      const mesh = refs.current[i]
      if (!mesh) return
      orbitPosition(tmp, ORBITS[c.orbit], c.phase + t * c.speed)
      mesh.position.copy(tmp)
      mesh.rotation.x = t * 1.2
      mesh.rotation.y = t * 0.9
    })
  })

  return (
    <>
      {config.map((c, i) => (
        <mesh
          key={i}
          ref={(el) => {
            refs.current[i] = el
          }}
        >
          <octahedronGeometry args={[0.1, 0]} />
          <meshStandardMaterial color={colors.dust} roughness={0.3} metalness={0.8} />
        </mesh>
      ))}
    </>
  )
}

/* ─────────────────────────────────────────────
   Skill label projector

   The labels are real DOM nodes in an overlay, not sprites, so the text
   stays crisp at any zoom. Each frame an invisible anchor is placed on its
   orbit, its world position is projected through the camera, and the badge
   is moved to the resulting screen coordinate.
   ───────────────────────────────────────────── */

function LabelProjector({
  nodes,
  reduced,
}: {
  nodes: React.RefObject<(HTMLSpanElement | null)[]>
  reduced: boolean
}) {
  const { camera, size } = useThree()
  const anchors = useRef<(THREE.Object3D | null)[]>([])
  const tmp = useMemo(() => new THREE.Vector3(), [])
  const world = useMemo(() => new THREE.Vector3(), [])
  const guard = useRef({ from: 0.55, to: 0.68 })

  // Measure the real right edge of the hero copy column so the fade
  // boundary follows the actual layout instead of a guessed percentage.
  useEffect(() => {
    function measure() {
      const copy = document.querySelector('[data-hero-copy]')
      const host = document.querySelector('[data-hero-stage]')
      if (!copy || !host) return
      const cr = copy.getBoundingClientRect()
      const hr = host.getBoundingClientRect()
      if (hr.width <= 0) return
      guard.current = {
        from: (cr.right - hr.left + 8) / hr.width,
        to: (cr.right - hr.left + 92) / hr.width,
      }
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [size.width, size.height])

  const elapsed = useRef(0)

  useFrame((_, delta) => {
    const list = nodes.current
    if (!list) return
    elapsed.current += delta

    const show = size.width >= 1200
    const t = elapsed.current
    const halfW = size.width / 2
    const halfH = size.height / 2
    const g = guard.current

    for (let i = 0; i < ORBIT_SKILLS.length; i++) {
      const el = list[i]
      const anchor = anchors.current[i]
      if (!el || !anchor) continue

      if (!show) {
        el.style.opacity = '0'
        continue
      }

      const cfg = ORBIT_SKILLS[i]
      const angle = cfg.phase + (reduced ? 0 : t * cfg.speed)
      orbitPosition(tmp, ORBITS[cfg.orbit], angle)
      anchor.position.copy(tmp)
      anchor.getWorldPosition(world)

      const depth = world.distanceTo(camera.position)
      world.project(camera)

      if (world.z > 1) {
        el.style.opacity = '0'
        continue
      }

      const x = world.x * halfW + halfW
      const y = -world.y * halfH + halfH
      const scale = THREE.MathUtils.clamp(1 - (depth - 9) / 12, 0.62, 1.06)
      let fade = THREE.MathUtils.clamp(1 - (depth - 10.5) / 9, 0.22, 1)

      // Screen-space guards: the headline owns the left column, and a badge
      // clipped mid-word at the frame edge looks broken. Both fade instead.
      const fx = x / size.width
      const fy = y / size.height
      fade *= THREE.MathUtils.smoothstep(fx, g.from, g.to)
      fade *= 1 - THREE.MathUtils.smoothstep(fx, 0.94, 1.0)
      fade *= THREE.MathUtils.smoothstep(fy, 0.02, 0.1)
      fade *= 1 - THREE.MathUtils.smoothstep(fy, 0.9, 0.99)

      el.style.transform = `translate(-50%, -50%) translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) scale(${scale.toFixed(3)})`
      el.style.opacity = fade.toFixed(2)
      el.style.zIndex = String(Math.round(1000 - depth * 10))
    }
  })

  return (
    <>
      {ORBIT_SKILLS.map((s, i) => (
        <object3D
          key={s.label}
          ref={(el) => {
            anchors.current[i] = el
          }}
        />
      ))}
    </>
  )
}

/* ─────────────────────────────────────────────
   Scene composition
   ───────────────────────────────────────────── */

function SceneContent({
  colors,
  reduced,
  labelNodes,
}: {
  colors: SceneColors
  reduced: boolean
  labelNodes: React.RefObject<(HTMLSpanElement | null)[]>
}) {
  const worldRef = useRef<THREE.Group>(null)
  const { size, camera } = useThree()
  const pointer = useRef({ tx: 0, ty: 0, x: 0, y: 0 })

  // Composition: push the object into the right-hand negative space on
  // desktop; centre it above the copy and shrink it on small screens.
  useEffect(() => {
    const group = worldRef.current
    if (!group) return
    const wide = size.width >= 1024
    group.position.x = wide ? 4.05 : 0
    group.position.y = wide ? 0.25 : 2.1
    const s = wide ? 1 : THREE.MathUtils.clamp(size.width / 900, 0.52, 0.78)
    group.scale.setScalar(s)
    camera.position.z = wide ? 13.6 : 14.6
    camera.updateProjectionMatrix()
  }, [size.width, camera])

  useEffect(() => {
    function onMove(e: PointerEvent) {
      pointer.current.tx = (e.clientX / window.innerWidth - 0.5) * 2
      pointer.current.ty = (e.clientY / window.innerHeight - 0.5) * 2
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [])

  useFrame(() => {
    const group = worldRef.current
    if (!group) return
    const p = pointer.current
    p.x += (p.tx - p.x) * 0.045
    p.y += (p.ty - p.y) * 0.045
    group.rotation.y = p.x * 0.2
    group.rotation.x = p.y * 0.12
    camera.position.x = p.x * 0.55
    camera.position.y = 0.35 - p.y * 0.4
    camera.lookAt(group.position.x * 0.45, group.position.y * 0.3, 0)
  })

  return (
    <>
      <directionalLight position={[5, 6, 7]} intensity={reduced ? 2.2 : 2.5} />
      <directionalLight position={[-7, -3, -5]} intensity={2.2} color={colors.rim} />
      <pointLight position={[0, 0, 4.5]} intensity={30} distance={26} color={colors.core} />
      <ambientLight intensity={0.35} />

      <Stars radius={48} depth={30} count={900} factor={3.2} saturation={0} fade speed={0.4} />

      <group ref={worldRef}>
        <Core colors={colors} reduced={reduced} />
        <Cage colors={colors} reduced={reduced} />
        <Rings colors={colors} />
        <Satellites colors={colors} reduced={reduced} />
        <LabelProjector nodes={labelNodes} reduced={reduced} />
        {!reduced && (
          <Sparkles count={40} scale={9} size={2.4} speed={0.3} color={colors.dust} />
        )}
      </group>
    </>
  )
}

/* ─────────────────────────────────────────────
   Public component
   ───────────────────────────────────────────── */

export function HeroScene() {
  const { theme } = useTheme()
  const colors = theme === 'light' ? LIGHT : DARK
  const labelNodes = useRef<(HTMLSpanElement | null)[]>([])
  const reduced =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  return (
    <>
      {/* R3F measures the Canvas's parent, so the parent must have real
          dimensions. Styling the canvas itself with `absolute inset-0`
          looks right but reports a zero-size container, and the render
          loop never starts. */}
      <div className="absolute inset-0" aria-hidden="true">
      <Canvas
        dpr={[1, 1.9]}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        camera={{ fov: 46, position: [0, 0.35, 13.6], near: 0.1, far: 120 }}
        // A failed WebGL context must not take the hero down with it.
        onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
      >
        <Suspense fallback={null}>
          <SceneContent colors={colors} reduced={reduced} labelNodes={labelNodes} />
        </Suspense>
      </Canvas>
      </div>

      {/* Orbiting skill labels — DOM overlay, positioned each frame from 3D. */}
      <div className="orbit-layer" aria-hidden="true">
        {ORBIT_SKILLS.map((s, i) => (
          <span
            key={s.label}
            ref={(el) => {
              labelNodes.current[i] = el
            }}
            className="orbit-badge"
            style={{ color: s.color, borderColor: `${s.color}4d` }}
          >
            {s.label}
          </span>
        ))}
      </div>
    </>
  )
}
