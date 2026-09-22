/* ══════════════════════════════════════════
   scene.js — WebGL hero (three.js)
   Liquid-metal core + wireframe cage + orbit
   rings + particle field + mouse parallax.
   Degrades silently if WebGL is unavailable.
   ══════════════════════════════════════════ */

const canvas = document.getElementById('scene');
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function themeColors() {
  const dark = document.documentElement.classList.contains('dark');
  return dark
    ? { core: 0x34d399, wire: 0x4ade9f, dust: 0x7fe8bd, rim: 0x0f6f52 }
    // Light mode needs a much darker, more diffuse body: a metallic mint
    // on a near-white page reflects straight to white and disappears.
    : { core: 0x0a4d39, wire: 0x0b6349, dust: 0x0f7a5a, rim: 0x2f9b78 };
}

async function boot() {
  if (!canvas) return;

  // WebGL capability probe — bail out quietly on failure.
  try {
    const probe = document.createElement('canvas');
    const ok = probe.getContext('webgl2') || probe.getContext('webgl');
    if (!ok) return;
  } catch (e) {
    return;
  }

  let THREE;
  try {
    THREE = await import('https://cdn.jsdelivr.net/npm/three@0.169.0/build/three.module.js');
  } catch (e) {
    return;
  }

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(46, 1, 0.1, 120);
  camera.position.set(0, 0.35, 12.4);

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
  } catch (e) {
    return;
  }
  renderer.setClearColor(0x000000, 0);

  let C = themeColors();

  // ── group that holds everything, offset to the right on wide screens
  const world = new THREE.Group();
  scene.add(world);

  // ── core: distorted icosahedron with a glossy shell
  const coreGeo = new THREE.IcosahedronGeometry(2.05, 6);
  const basePos = coreGeo.attributes.position.array.slice(0);
  const coreMat = new THREE.MeshStandardMaterial({
    color: C.core,
    roughness: 0.22,
    metalness: 0.92,
    flatShading: false
  });
  const core = new THREE.Mesh(coreGeo, coreMat);
  world.add(core);

  // ── wireframe cage
  const cageGeo = new THREE.IcosahedronGeometry(3.15, 1);
  const cageMat = new THREE.MeshBasicMaterial({
    color: C.wire,
    wireframe: true,
    transparent: true,
    opacity: 0.26
  });
  const cage = new THREE.Mesh(cageGeo, cageMat);
  world.add(cage);

  // ── orbit system: each orbit is a tilted plane that carries a visible
  //    ring plus one or more skill labels riding it (solar-system read)
  const ORBITS = [
    { r: 3.7, inc: 1.34, node: 0.22, op: 0.4 },
    { r: 4.35, inc: 1.05, node: -0.55, op: 0.3 },
    { r: 5.0, inc: 1.52, node: 0.85, op: 0.2 },
    { r: 5.65, inc: 0.88, node: 0.4, op: 0.13 }
  ];

  const SKILLS = [
    { label: 'HTML & CSS', color: '#ff8904', orbit: 0, phase: 0.0, speed: 0.115 },
    { label: 'JavaScript', color: '#ffb900', orbit: 1, phase: 1.9, speed: 0.094 },
    { label: 'React', color: '#00e0e0', orbit: 0, phase: 3.3, speed: 0.115 },
    { label: 'Next.js', color: '#e7ecea', orbit: 2, phase: 0.8, speed: 0.076 },
    { label: 'TypeScript', color: '#00d3f2', orbit: 3, phase: 2.6, speed: 0.063 },
    { label: 'Node.js', color: '#05df72', orbit: 1, phase: 4.6, speed: 0.094 },
    { label: 'Express', color: '#b9c2be', orbit: 2, phase: 3.9, speed: 0.076 },
    { label: 'MongoDB', color: '#00d492', orbit: 0, phase: 5.4, speed: 0.115 },
    { label: 'Redis', color: '#ff6f61', orbit: 3, phase: 5.1, speed: 0.063 },
    { label: 'Tailwind', color: '#38bdf8', orbit: 2, phase: 1.9, speed: 0.076 },
    { label: 'REST APIs', color: '#00d492', orbit: 1, phase: 0.6, speed: 0.094 },
    { label: 'Socket.IO', color: '#a78bfa', orbit: 3, phase: 0.3, speed: 0.063 },
    { label: 'Git', color: '#ff8904', orbit: 0, phase: 1.7, speed: 0.115 },
    { label: 'PWA', color: '#4ade9f', orbit: 2, phase: 5.6, speed: 0.076 }
  ];

  const rings = new THREE.Group();
  ORBITS.forEach((o) => {
    const g = new THREE.TorusGeometry(o.r, 0.0075, 8, 180);
    const m = new THREE.MeshBasicMaterial({ color: C.wire, transparent: true, opacity: o.op });
    const ring = new THREE.Mesh(g, m);
    // torus lies in XY by default -> rotate into the orbit plane
    ring.rotation.set(o.inc, 0, 0);
    const holder = new THREE.Group();
    holder.rotation.y = o.node;
    holder.add(ring);
    rings.add(holder);
  });
  world.add(rings);

  // ── skill label anchors (invisible 3D points that DOM badges follow)
  const badgeLayer = document.getElementById('orbit-badges');
  const badges = [];

  if (badgeLayer) {
    badgeLayer.innerHTML = '';
    SKILLS.forEach((s) => {
      const anchor = new THREE.Object3D();
      world.add(anchor);

      const el = document.createElement('span');
      el.className = 'orbit-badge';
      el.textContent = s.label;
      el.style.color = s.color;
      el.style.borderColor = s.color + '4d';
      badgeLayer.appendChild(el);

      badges.push({ cfg: s, anchor, el, v: new THREE.Vector3() });
    });
  }

  // ── satellites: small solids also riding the orbits
  const sats = [];
  const satGeo = new THREE.OctahedronGeometry(0.1, 0);
  for (let i = 0; i < 6; i++) {
    const m = new THREE.MeshStandardMaterial({ color: C.dust, roughness: 0.3, metalness: 0.8 });
    const s = new THREE.Mesh(satGeo, m);
    sats.push({
      mesh: s,
      orbit: i % ORBITS.length,
      phase: (i / 6) * Math.PI * 2 + 0.6,
      speed: 0.13 + i * 0.02
    });
    world.add(s);
  }

  // position on a tilted orbit plane
  function orbitPos(out, orbitIndex, angle) {
    const o = ORBITS[orbitIndex];
    const x = Math.cos(angle) * o.r;
    const z = Math.sin(angle) * o.r;
    // rotate around X by inclination
    const y2 = -z * Math.sin(o.inc);
    const z2 = z * Math.cos(o.inc);
    // then around Y by ascending node
    out.set(
      x * Math.cos(o.node) + z2 * Math.sin(o.node),
      y2,
      -x * Math.sin(o.node) + z2 * Math.cos(o.node)
    );
    return out;
  }

  // ── particle dust field
  const DUST = 900;
  const dustGeo = new THREE.BufferGeometry();
  const dustPos = new Float32Array(DUST * 3);
  for (let i = 0; i < DUST; i++) {
    const r = 9 + Math.random() * 20;
    const th = Math.random() * Math.PI * 2;
    const ph = Math.acos(2 * Math.random() - 1);
    dustPos[i * 3] = r * Math.sin(ph) * Math.cos(th);
    dustPos[i * 3 + 1] = r * Math.cos(ph) * 0.55;
    dustPos[i * 3 + 2] = r * Math.sin(ph) * Math.sin(th);
  }
  dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
  const dustMat = new THREE.PointsMaterial({
    color: C.dust,
    size: 0.055,
    transparent: true,
    opacity: 0.6,
    sizeAttenuation: true,
    depthWrite: false
  });
  const dust = new THREE.Points(dustGeo, dustMat);
  scene.add(dust);

  // ── lighting
  const key = new THREE.DirectionalLight(0xffffff, 2.5);
  key.position.set(5, 6, 7);
  scene.add(key);

  const rim = new THREE.DirectionalLight(C.rim, 2.2);
  rim.position.set(-7, -3, -5);
  scene.add(rim);

  const fill = new THREE.PointLight(C.core, 30, 26);
  fill.position.set(0, 0, 4.5);
  scene.add(fill);

  const ambient = new THREE.AmbientLight(0xffffff, 0.35);
  scene.add(ambient);

  // ── responsive sizing + composition offset
  let showBadges = false;
  let guardFrom = 0.55;
  let guardTo = 0.68;

  function layout() {
    const host = canvas.parentElement || document.body;
    const w = host.clientWidth || window.innerWidth;
    const h = host.clientHeight || window.innerHeight;

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.9));
    renderer.setSize(w, h, false);
    camera.aspect = w / h;

    const wide = w >= 1024;
    // push the object into the right-hand negative space on desktop,
    // centre + shrink it on phones so it sits behind the copy
    world.position.x = wide ? 4.05 : 0;
    world.position.y = wide ? 0.25 : 2.1;
    const s = wide ? 1 : Math.max(0.52, Math.min(0.78, w / 900));
    world.scale.setScalar(s);
    camera.position.z = wide ? 13.6 : 14.6;

    camera.updateProjectionMatrix();

    // orbiting text labels only earn their space on wide screens —
    // below that they collide with the headline
    showBadges = w >= 1200;
    if (badgeLayer) badgeLayer.style.display = showBadges ? 'block' : 'none';

    // measure the real right edge of the copy column so the badge guard
    // adapts to the actual layout instead of a guessed percentage
    const copy = document.querySelector('.hero-copy');
    if (copy) {
      const cr = copy.getBoundingClientRect();
      const hr = host.getBoundingClientRect();
      guardFrom = (cr.right - hr.left + 8) / w;
      guardTo = (cr.right - hr.left + 92) / w;
    }
  }
  layout();

  // ── pointer parallax
  const target = { x: 0, y: 0 };
  const cur = { x: 0, y: 0 };
  window.addEventListener('pointermove', (e) => {
    target.x = (e.clientX / window.innerWidth - 0.5) * 2;
    target.y = (e.clientY / window.innerHeight - 0.5) * 2;
  }, { passive: true });

  // ── pause when the hero scrolls away (saves battery)
  let visible = true;
  const hero = document.getElementById('hero');
  if (hero && 'IntersectionObserver' in window) {
    new IntersectionObserver(
      (entries) => { visible = entries[0].isIntersecting; },
      { threshold: 0.02 }
    ).observe(hero);
  }

  // ── theme reaction
  function applyTheme() {
    C = themeColors();
    coreMat.color.setHex(C.core);
    cageMat.color.setHex(C.wire);
    dustMat.color.setHex(C.dust);
    rings.children.forEach((holder) => {
      holder.children.forEach((r) => r.material.color.setHex(C.wire));
    });
    sats.forEach((s) => s.mesh.material.color.setHex(C.dust));
    rim.color.setHex(C.rim);
    fill.color.setHex(C.core);
    const dark = document.documentElement.classList.contains('dark');
    cageMat.opacity = dark ? 0.26 : 0.5;
    dustMat.opacity = dark ? 0.6 : 0.5;
    dustMat.size = dark ? 0.055 : 0.045;
    // diffuse + matte in light mode so the silhouette reads against white
    coreMat.metalness = dark ? 0.92 : 0.18;
    coreMat.roughness = dark ? 0.22 : 0.52;
    key.intensity = dark ? 2.5 : 1.15;
    rim.intensity = dark ? 2.2 : 1.1;
    fill.intensity = dark ? 30 : 6;
    ambient.intensity = dark ? 0.35 : 0.55;
  }
  applyTheme();
  new MutationObserver(applyTheme).observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class']
  });

  window.addEventListener('resize', layout);

  // ── vertex wobble (liquid metal)
  const pos = coreGeo.attributes.position;
  function distort(t) {
    for (let i = 0; i < pos.count; i++) {
      const ix = i * 3;
      const x = basePos[ix], y = basePos[ix + 1], z = basePos[ix + 2];
      const n =
        Math.sin(x * 1.5 + t * 0.9) * 0.5 +
        Math.sin(y * 1.8 + t * 1.15) * 0.5 +
        Math.sin(z * 1.35 + t * 0.75) * 0.5;
      const k = 1 + n * 0.055;
      pos.array[ix] = x * k;
      pos.array[ix + 1] = y * k;
      pos.array[ix + 2] = z * k;
    }
    pos.needsUpdate = true;
    coreGeo.computeVertexNormals();
  }

  const clock = new THREE.Clock();
  const tmp = new THREE.Vector3();

  function frame() {
    requestAnimationFrame(frame);
    if (!visible) return;

    const t = clock.getElapsedTime();

    cur.x += (target.x - cur.x) * 0.045;
    cur.y += (target.y - cur.y) * 0.045;

    if (!reduced) {
      distort(t);
      core.rotation.y = t * 0.16;
      core.rotation.x = Math.sin(t * 0.22) * 0.12;
      cage.rotation.y = -t * 0.1;
      cage.rotation.z = t * 0.05;
      dust.rotation.y = t * 0.012;

      sats.forEach((s) => {
        orbitPos(tmp, s.orbit, s.phase + t * s.speed);
        s.mesh.position.copy(tmp);
        s.mesh.rotation.x = t * 1.2;
        s.mesh.rotation.y = t * 0.9;
      });
    }

    world.rotation.y = cur.x * 0.2;
    world.rotation.x = cur.y * 0.12;
    camera.position.x = cur.x * 0.55;
    camera.position.y = 0.35 - cur.y * 0.4;
    camera.lookAt(world.position.x * 0.45, world.position.y * 0.3, 0);

    renderer.render(scene, camera);

    // ── project the orbiting skill labels into screen space.
    //    Done after render so the camera matrices are current.
    if (showBadges && badges.length) {
      const rect = canvas.getBoundingClientRect();
      const halfW = rect.width / 2;
      const halfH = rect.height / 2;

      for (let i = 0; i < badges.length; i++) {
        const b = badges[i];
        const angle = b.cfg.phase + (reduced ? 0 : t * b.cfg.speed);
        orbitPos(tmp, b.cfg.orbit, angle);
        b.anchor.position.copy(tmp);
        b.anchor.getWorldPosition(b.v);

        // depth relative to the camera decides scale + fade, so labels
        // behind the core recede instead of fighting the foreground
        const depth = b.v.distanceTo(camera.position);
        b.v.project(camera);

        if (b.v.z > 1) { b.el.style.opacity = '0'; continue; }

        const x = b.v.x * halfW + halfW;
        const y = -b.v.y * halfH + halfH;
        const k = THREE.MathUtils.clamp(1 - (depth - 9) / 12, 0.62, 1.06);
        let fade = THREE.MathUtils.clamp(1 - (depth - 10.5) / 9, 0.22, 1);

        // Screen-space guard: the headline occupies the left column, so a
        // label swinging over it must dim out rather than fight the text.
        // Same at the frame edges, where a badge would be clipped mid-word.
        const fx = x / rect.width;
        const fy = y / rect.height;
        const leftGuard = THREE.MathUtils.smoothstep(fx, guardFrom, guardTo);
        const rightGuard = 1 - THREE.MathUtils.smoothstep(fx, 0.94, 1.0);
        const topGuard = THREE.MathUtils.smoothstep(fy, 0.02, 0.1);
        const botGuard = 1 - THREE.MathUtils.smoothstep(fy, 0.9, 0.99);
        fade *= leftGuard * rightGuard * topGuard * botGuard;

        b.el.style.transform =
          'translate(-50%, -50%) translate3d(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px,0) scale(' + k.toFixed(3) + ')';
        b.el.style.opacity = fade.toFixed(2);
        b.el.style.zIndex = String(Math.round(1000 - depth * 10));
      }
    }
  }

  frame();
  canvas.classList.add('is-on');
  document.documentElement.classList.add('has-webgl');
}

boot();
