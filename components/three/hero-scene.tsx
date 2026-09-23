'use client'

import { Suspense, useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { MeshDistortMaterial, Sparkles, Stars } from '@react-three/drei'
import * as THREE from 'three'
import { useTheme } from '@/components/theme-provider'
import { hasFinePointer, type DeviceTier } from '@/lib/device'

/* ─────────────────────────────────────────────
   Upstream deprecation notice

   three r183 deprecated `Clock` in favour of `Timer` and warns from the
   constructor. Nothing in this file builds one — R3F's frameloop store does
   (`@react-three/fiber@9.7.0`), so there is no change on our side that stops
   it, and no 9.x release has migrated: pmndrs/react-three-fiber#3741 is open
   and deferred to a major, because `Timer` would raise fiber's minimum three
   version from r156 to r178.

   That matters more than a tidy console, because three's `warn()` is not
   gated on NODE_ENV — it reaches production users too. `setConsoleFunction`
   is three's own supported hook for routing its logging, so this drops that
   one exact string and forwards every other message untouched. Delete the
   whole block once fiber migrates to `Timer`.

   (The forward is faithful: three only enriches params for its `TSL:`
   shader-language messages, which this scene never emits.)
   ───────────────────────────────────────────── */

const FIXED_UPSTREAM =
  'THREE.Clock: This module has been deprecated. Please use THREE.Timer instead.'

if (THREE.getConsoleFunction() === null) {
  THREE.setConsoleFunction((type, message, ...params) => {
    if (type === 'warn' && message === FIXED_UPSTREAM) return
    console[type](message, ...params)
  })
}

/* ─────────────────────────────────────────────
   Quality tiers

   The scene used to render at one fixed cost on every device. The dominant
   item was the core: `icosahedronGeometry(2.05, 6)` is 20 · 4⁶ = 81,920
   triangles, all of them re-displaced every frame by the distort material,
   for an object that is ~300px wide on a phone. Detail 5/4/3 costs 20,480 /
   5,120 / 1,280 triangles and — because the surface is flat-shaded — reads as
   *more* obviously cut crystal at the lower settings, not less.

   Everything else here follows the same rule: keep the composition identical,
   spend fewer triangles and fewer pixels on the devices that can't afford it.
   ───────────────────────────────────────────── */

interface Quality {
  dpr: [number, number]
  antialias: boolean
  /** Icosahedron subdivisions for the crystal body. */
  coreDetail: number
  /** Tubular segments per orbit ring. */
  ringSegments: number
  /** Width/height segments on the rim-glow shell. */
  atmoSegments: number
  /** The counter-rotating inner wireframe — depth cue, not structure. */
  innerCage: boolean
  starCount: number
  sparkleCount: number
  /** clearcoat + iridescence turn the body into a full physical shader. */
  richMaterial: boolean
  /** Projecting 14 DOM labels each frame is desktop-only anyway. */
  labels: boolean
}

const QUALITY: Record<DeviceTier, Quality> = {
  high: {
    dpr: [1, 1.75],
    antialias: true,
    coreDetail: 5,
    ringSegments: 180,
    atmoSegments: 48,
    innerCage: true,
    starCount: 900,
    sparkleCount: 40,
    richMaterial: true,
    labels: true,
  },
  mid: {
    dpr: [1, 1.5],
    antialias: true,
    coreDetail: 4,
    ringSegments: 128,
    atmoSegments: 32,
    innerCage: true,
    starCount: 520,
    sparkleCount: 22,
    richMaterial: true,
    labels: true,
  },
  low: {
    dpr: [1, 1.25],
    antialias: false,
    coreDetail: 3,
    ringSegments: 84,
    atmoSegments: 24,
    innerCage: false,
    starCount: 260,
    sparkleCount: 0,
    richMaterial: false,
    labels: false,
  },
}

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
  /** Faceted gem clusters embedded in the crystal surface. */
  shard: string
  /** Hot centre of each gem — reads as a refraction highlight. */
  flare: string
}

const DARK: SceneColors = {
  core: '#34d399',
  emissive: '#0d9488',
  wire: '#5eead4',
  dust: '#7fe8dd',
  rim: '#0f6f62',
  shard: '#5eead4',
  flare: '#ccfbf1',
}

// A metallic mint on a near-white page reflects straight to white and
// disappears, so light mode uses a dark, diffuse body instead.
const LIGHT: SceneColors = {
  core: '#0a4d45',
  emissive: '#0d5f52',
  wire: '#0b6355',
  dust: '#0f7a6a',
  rim: '#2f9b88',
  shard: '#2f9b88',
  flare: '#8fd8c9',
}

/* ─────────────────────────────────────────────
   Core + cage
   ───────────────────────────────────────────── */

/** Gem clusters sitting in the crystal surface, mostly on the lit side. */
const SHARDS = [
  { dir: [0.42, 0.62, 0.66], size: 0.3, phase: 0.0, kind: 'ico' as const },
  { dir: [-0.56, 0.16, 0.81], size: 0.26, phase: 1.7, kind: 'oct' as const },
  { dir: [-0.24, -0.44, 0.86], size: 0.22, phase: 3.1, kind: 'ico' as const },
  { dir: [0.78, -0.12, 0.61], size: 0.19, phase: 4.4, kind: 'oct' as const },
  { dir: [0.06, 0.88, 0.47], size: 0.16, phase: 5.6, kind: 'ico' as const },
  { dir: [-0.82, 0.5, 0.26], size: 0.14, phase: 2.4, kind: 'oct' as const },
]

const CORE_R = 2.05

function CrystalShards({
  colors,
  reduced,
  quality,
}: {
  colors: SceneColors
  reduced: boolean
  quality: Quality
}) {
  const gems = useRef<(THREE.Mesh | null)[]>([])
  const halos = useRef<(THREE.Mesh | null)[]>([])
  const elapsed = useRef(0)

  // The two smallest gems are sub-pixel detail at phone scale.
  const shards = useMemo(
    () => (quality.coreDetail <= 3 ? SHARDS.slice(0, 4) : SHARDS),
    [quality.coreDetail],
  )
  const haloSegments = quality.coreDetail <= 3 ? 10 : 16

  const placed = useMemo(
    () =>
      shards.map((s) => {
        const v = new THREE.Vector3(...s.dir).normalize()
        return {
          ...s,
          // Seated just under the surface so the facets break through the
          // shell rather than hovering above it.
          pos: v.clone().multiplyScalar(CORE_R - s.size * 0.42),
          // Point one facet outward, like a crystal growing from the body.
          quat: new THREE.Quaternion().setFromUnitVectors(
            new THREE.Vector3(0, 1, 0),
            v,
          ),
        }
      }),
    [shards],
  )

  useFrame((_, delta) => {
    if (reduced) return
    elapsed.current += delta
    const t = elapsed.current
    for (let i = 0; i < placed.length; i++) {
      const gem = gems.current[i]
      const halo = halos.current[i]
      // Slow breathing glow, each gem on its own phase, so the surface
      // never reads as a flat colour.
      const pulse = 0.55 + 0.45 * Math.sin(t * 0.7 + placed[i].phase)
      if (gem) {
        const mat = gem.material as THREE.MeshStandardMaterial
        mat.emissiveIntensity = 1.5 + pulse * 2.4
        gem.rotation.y = t * 0.24 + placed[i].phase
      }
      if (halo) {
        const mat = halo.material as THREE.MeshBasicMaterial
        mat.opacity = 0.06 + pulse * 0.16
        halo.scale.setScalar(1 + pulse * 0.28)
      }
    }
  })

  return (
    <>
      {placed.map((s, i) => (
        <group key={i} position={s.pos} quaternion={s.quat}>
          <mesh
            ref={(el) => {
              gems.current[i] = el
            }}
          >
            {s.kind === 'ico' ? (
              <icosahedronGeometry args={[s.size, 0]} />
            ) : (
              <octahedronGeometry args={[s.size, 0]} />
            )}
            <meshStandardMaterial
              color={colors.flare}
              emissive={colors.shard}
              emissiveIntensity={2.2}
              roughness={0.05}
              metalness={0.1}
              flatShading
            />
          </mesh>

          {/* Additive bloom so the gem bleeds light into the body, which is
              what sells it as refraction rather than a stuck-on rock. */}
          <mesh
            ref={(el) => {
              halos.current[i] = el
            }}
            scale={1}
          >
            <sphereGeometry args={[s.size * 2.6, haloSegments, haloSegments]} />
            <meshBasicMaterial
              color={colors.flare}
              transparent
              opacity={0.14}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </mesh>
        </group>
      ))}
    </>
  )
}

function Core({
  colors,
  reduced,
  quality,
}: {
  colors: SceneColors
  reduced: boolean
  quality: Quality
}) {
  const shell = useRef<THREE.Group>(null)

  useFrame((_, delta) => {
    if (reduced || !shell.current) return
    shell.current.rotation.y += delta * 0.16
    shell.current.rotation.x += delta * 0.05
  })

  return (
    <group>
      {/* Body + gems share one transform so the facets stay welded to the
          surface as the crystal turns. */}
      <group ref={shell}>
        <mesh>
          <icosahedronGeometry args={[CORE_R, quality.coreDetail]} />
          <MeshDistortMaterial
            color={colors.core}
            emissive={colors.emissive}
            emissiveIntensity={0.38}
            roughness={0.12}
            metalness={0.55}
            // Flat shading turns the subdivided icosahedron into thousands of
            // discrete planes: each one takes the light at its own angle, so
            // the body reads as cut crystal instead of a smooth blob.
            flatShading
            clearcoat={quality.richMaterial ? 1 : 0}
            clearcoatRoughness={0.16}
            iridescence={quality.richMaterial ? 0.55 : 0}
            iridescenceIOR={1.4}
            distort={reduced ? 0 : 0.24}
            speed={1.1}
          />
        </mesh>

        {/* Faint facet net over the body — the polygon seams you can just
            make out on a real cut stone. */}
        <mesh scale={1.012}>
          <icosahedronGeometry args={[CORE_R, 2]} />
          <meshBasicMaterial
            color={colors.flare}
            wireframe
            transparent
            opacity={0.07}
            depthWrite={false}
          />
        </mesh>

        <CrystalShards colors={colors} reduced={reduced} quality={quality} />
      </group>

      {/* Atmosphere shell: back-faces only, additive, so it reads as a rim
          glow around the orb instead of a second visible sphere. */}
      <mesh scale={1.16}>
        <sphereGeometry args={[CORE_R, quality.atmoSegments, quality.atmoSegments]} />
        <meshBasicMaterial
          color={colors.wire}
          transparent
          opacity={0.07}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </group>
  )
}

function Cage({
  colors,
  reduced,
  quality,
}: {
  colors: SceneColors
  reduced: boolean
  quality: Quality
}) {
  const outer = useRef<THREE.Mesh>(null)
  const inner = useRef<THREE.Mesh>(null)

  useFrame((_, delta) => {
    if (reduced) return
    if (outer.current) {
      outer.current.rotation.y -= delta * 0.1
      outer.current.rotation.z += delta * 0.05
    }
    // Counter-rotating second shell: the two wireframes slide across each
    // other and read as a lattice with depth, not a single flat net.
    if (inner.current) {
      inner.current.rotation.y += delta * 0.07
      inner.current.rotation.x -= delta * 0.035
    }
  })

  return (
    <>
      <mesh ref={outer}>
        <icosahedronGeometry args={[3.15, 1]} />
        <meshBasicMaterial color={colors.wire} wireframe transparent opacity={0.26} />
      </mesh>
      {quality.innerCage && (
        <mesh ref={inner}>
          <icosahedronGeometry args={[2.62, 2]} />
          <meshBasicMaterial
            color={colors.wire}
            wireframe
            transparent
            opacity={0.09}
            depthWrite={false}
          />
        </mesh>
      )}
    </>
  )
}

function Rings({ colors, quality }: { colors: SceneColors; quality: Quality }) {
  return (
    <>
      {ORBITS.map((o, i) => (
        <group key={i} rotation={[0, o.node, 0]}>
          <mesh rotation={[o.inc, 0, 0]}>
            <torusGeometry args={[o.r, 0.0075, 6, quality.ringSegments]} />
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
          <meshStandardMaterial
            color={colors.flare}
            emissive={colors.shard}
            emissiveIntensity={0.9}
            roughness={0.08}
            metalness={0.3}
            flatShading
          />
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

   There is no point running any of this below ~1200px: the copy column owns
   the frame and every badge would be faded to zero anyway. Below that width
   the projector hides the layer once and then does nothing per frame.
   ───────────────────────────────────────────── */

const CORE_RADIUS = CORE_R
const LABEL_MIN_WIDTH = 1200

function LabelProjector({
  nodes,
  reduced,
  worldRef,
}: {
  nodes: React.RefObject<(HTMLSpanElement | null)[]>
  reduced: boolean
  worldRef: React.RefObject<THREE.Group | null>
}) {
  const { camera, size } = useThree()
  const anchors = useRef<(THREE.Object3D | null)[]>([])
  const tmp = useMemo(() => new THREE.Vector3(), [])
  const world = useMemo(() => new THREE.Vector3(), [])
  const coreCenter = useMemo(() => new THREE.Vector3(), [])
  const coreEdge = useMemo(() => new THREE.Vector3(), [])
  const camRight = useMemo(() => new THREE.Vector3(), [])
  const guard = useRef({ from: 0.55, to: 0.68 })
  const hidden = useRef(false)

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

    // Narrow viewport: hide once, then spend nothing until it widens.
    if (size.width < LABEL_MIN_WIDTH) {
      if (!hidden.current) {
        for (const el of list) if (el) el.style.opacity = '0'
        hidden.current = true
      }
      return
    }
    hidden.current = false

    elapsed.current += delta
    const t = elapsed.current
    const halfW = size.width / 2
    const halfH = size.height / 2
    const g = guard.current

    // Project the solid core to a screen-space circle. The labels live in a
    // DOM layer that always paints above the canvas, so without this a label
    // swinging behind the orb would still draw on top of it and break the
    // illusion of depth.
    let coreX = 0
    let coreY = 0
    let coreR = 0
    let coreDepth = Infinity
    const group = worldRef.current
    if (group) {
      group.getWorldPosition(coreCenter)
      coreDepth = coreCenter.distanceTo(camera.position)
      camera.matrixWorld.extractBasis(camRight, tmp, tmp)
      coreEdge
        .copy(coreCenter)
        .addScaledVector(camRight, CORE_RADIUS * group.scale.x)
      coreCenter.project(camera)
      coreEdge.project(camera)
      coreX = coreCenter.x * halfW + halfW
      coreY = -coreCenter.y * halfH + halfH
      coreR = Math.abs(coreEdge.x * halfW + halfW - coreX)
    }

    for (let i = 0; i < ORBIT_SKILLS.length; i++) {
      const el = list[i]
      const anchor = anchors.current[i]
      if (!el || !anchor) continue

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

      // Gentler depth ramps than before: the labels are the content here, so
      // a far one must still be readable rather than shrinking into noise.
      const scale = THREE.MathUtils.clamp(1 - (depth - 9) / 22, 0.86, 1.1)
      let fade = THREE.MathUtils.clamp(1 - (depth - 11) / 16, 0.58, 1)

      // Hide behind the orb.
      if (coreR > 0 && depth > coreDepth) {
        const dx = x - coreX
        const dy = y - coreY
        const inside = Math.sqrt(dx * dx + dy * dy) / coreR
        if (inside < 1.04) {
          fade *= THREE.MathUtils.smoothstep(inside, 0.72, 1.04) * 0.9
        }
      }

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
  quality,
  labelNodes,
}: {
  colors: SceneColors
  reduced: boolean
  quality: Quality
  labelNodes: React.RefObject<(HTMLSpanElement | null)[]>
}) {
  const worldRef = useRef<THREE.Group>(null)
  const { size, camera } = useThree()
  const pointer = useRef({ tx: 0, ty: 0, x: 0, y: 0 })
  const parallax = useRef(false)

  // Composition: push the object into the right-hand negative space on
  // desktop; centre it above the copy and shrink it on small screens.
  useEffect(() => {
    const group = worldRef.current
    if (!group) return
    const wide = size.width >= 1024
    group.position.x = wide ? 4.05 : 0
    // On a phone the copy runs the full width of the frame, so the orb sits
    // high behind the headline (and `.hero-canvas` dims it) instead of
    // fighting the text for the same pixels.
    group.position.y = wide ? 0.25 : size.width >= 768 ? 1.8 : 2.4
    const s = wide ? 1 : THREE.MathUtils.clamp(size.width / 900, 0.46, 0.78)
    group.scale.setScalar(s)
    camera.position.z = wide ? 13.6 : 14.6
    camera.updateProjectionMatrix()
  }, [size.width, camera])

  // Pointer parallax is a mouse affordance. On a touch screen `pointermove`
  // only fires mid-drag, so the scene would lurch while the user scrolls —
  // and the listener would add work to every scroll frame for nothing.
  useEffect(() => {
    if (!hasFinePointer()) {
      parallax.current = false
      return
    }
    parallax.current = true

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
    if (parallax.current) {
      p.x += (p.tx - p.x) * 0.045
      p.y += (p.ty - p.y) * 0.045
    }
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

      <Stars
        radius={48}
        depth={30}
        count={quality.starCount}
        factor={3.2}
        saturation={0}
        fade
        speed={0.4}
      />

      <group ref={worldRef}>
        <Core colors={colors} reduced={reduced} quality={quality} />
        <Cage colors={colors} reduced={reduced} quality={quality} />
        <Rings colors={colors} quality={quality} />
        <Satellites colors={colors} reduced={reduced} />
        {quality.labels && (
          <LabelProjector nodes={labelNodes} reduced={reduced} worldRef={worldRef} />
        )}
        {!reduced && quality.sparkleCount > 0 && (
          <Sparkles
            count={quality.sparkleCount}
            scale={9}
            size={2.4}
            speed={0.3}
            color={colors.dust}
          />
        )}
      </group>
    </>
  )
}

/* ─────────────────────────────────────────────
   Public component
   ───────────────────────────────────────────── */

export function HeroScene({
  tier = 'high',
  active = true,
  reduced = false,
}: {
  tier?: DeviceTier
  /** False when the hero has scrolled away or the tab is hidden. */
  active?: boolean
  reduced?: boolean
}) {
  const { theme } = useTheme()
  const colors = theme === 'light' ? LIGHT : DARK
  const labelNodes = useRef<(HTMLSpanElement | null)[]>([])
  const quality = QUALITY[tier]

  return (
    <>
      {/* R3F measures the Canvas's parent, so the parent must have real
          dimensions. Styling the canvas itself with `absolute inset-0`
          looks right but reports a zero-size container, and the render
          loop never starts. */}
      <div className="hero-canvas absolute inset-0" aria-hidden="true">
        <Canvas
          dpr={quality.dpr}
          // `never` fully parks the render loop. Previously the scene kept
          // drawing at 60fps while the visitor read the case studies six
          // sections down — the largest single waste on the page.
          frameloop={active && !reduced ? 'always' : 'never'}
          gl={{
            antialias: quality.antialias,
            alpha: true,
            powerPreference: 'high-performance',
          }}
          camera={{ fov: 46, position: [0, 0.35, 13.6], near: 0.1, far: 120 }}
          // A failed WebGL context must not take the hero down with it.
          onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
        >
          <Suspense fallback={null}>
            <SceneContent
              colors={colors}
              reduced={reduced}
              quality={quality}
              labelNodes={labelNodes}
            />
          </Suspense>
        </Canvas>
      </div>

      {/* Orbiting skill labels — DOM overlay, positioned each frame from 3D.
          Skipped entirely on tiers that never show them. */}
      {quality.labels && (
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
      )}
    </>
  )
}
