/* ══════════════════════════════════════════
   constellation.js — page-wide network field
   Drifting nodes + proximity links + a soft
   lagging glow that follows the pointer.
   Pure 2D canvas: cheap, runs behind the
   whole document, never blocks input.
   ══════════════════════════════════════════ */

(function () {
  var canvas = document.getElementById('constellation');
  if (!canvas) return;

  var ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) return;

  var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var DPR = 1;
  var W = 0;
  var H = 0;
  var nodes = [];
  var LINK = 150;          // px distance that draws a link
  var running = true;

  // pointer glow (the bright dot in the reference)
  var ptr = { x: -9999, y: -9999, gx: -9999, gy: -9999, active: false };

  function palette() {
    var dark = document.documentElement.classList.contains('dark');
    return dark
      ? { node: '120, 235, 205', link: '52, 211, 153', glow: '90, 240, 215', nodeA: 0.55, linkA: 0.16, glowA: 0.16 }
      : { node: '12, 90, 68', link: '15, 122, 90', glow: '20, 140, 105', nodeA: 0.4, linkA: 0.1, glowA: 0.07 };
  }
  var P = palette();

  function density() {
    // scale node count with area, but cap it hard on phones
    var area = W * H;
    var n = Math.round(area / 15500);
    return Math.max(34, Math.min(118, n));
  }

  function seed() {
    var count = density();
    nodes = [];
    for (var i = 0; i < count; i++) {
      nodes.push({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.17,
        vy: (Math.random() - 0.5) * 0.17,
        r: Math.random() * 1.15 + 0.7
      });
    }
  }

  function resize() {
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = Math.round(W * DPR);
    canvas.height = Math.round(H * DPR);
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    LINK = W < 640 ? 112 : 150;
    seed();
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    // ── links first, so nodes sit on top
    ctx.lineWidth = 0.6;
    for (var i = 0; i < nodes.length; i++) {
      var a = nodes[i];
      for (var j = i + 1; j < nodes.length; j++) {
        var b = nodes[j];
        var dx = a.x - b.x;
        var dy = a.y - b.y;
        var d2 = dx * dx + dy * dy;
        if (d2 > LINK * LINK) continue;
        var t = 1 - Math.sqrt(d2) / LINK;
        ctx.strokeStyle = 'rgba(' + P.link + ',' + (t * P.linkA).toFixed(3) + ')';
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
    }

    // ── nodes
    for (var k = 0; k < nodes.length; k++) {
      var n = nodes[k];
      ctx.fillStyle = 'rgba(' + P.node + ',' + P.nodeA + ')';
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fill();
    }

    // ── lagging pointer glow
    if (ptr.active && ptr.gx > -9000) {
      var grad = ctx.createRadialGradient(ptr.gx, ptr.gy, 0, ptr.gx, ptr.gy, 120);
      grad.addColorStop(0, 'rgba(' + P.glow + ',' + P.glowA + ')');
      grad.addColorStop(0.45, 'rgba(' + P.glow + ',' + (P.glowA * 0.3).toFixed(3) + ')');
      grad.addColorStop(1, 'rgba(' + P.glow + ',0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(ptr.gx, ptr.gy, 120, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = 'rgba(' + P.glow + ',0.75)';
      ctx.beginPath();
      ctx.arc(ptr.gx, ptr.gy, 2.1, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function step() {
    for (var i = 0; i < nodes.length; i++) {
      var n = nodes[i];
      n.x += n.vx;
      n.y += n.vy;

      if (n.x < -20) n.x = W + 20;
      if (n.x > W + 20) n.x = -20;
      if (n.y < -20) n.y = H + 20;
      if (n.y > H + 20) n.y = -20;

      // gentle drift away from the pointer
      if (ptr.active) {
        var dx = n.x - ptr.x;
        var dy = n.y - ptr.y;
        var d2 = dx * dx + dy * dy;
        if (d2 < 15000 && d2 > 1) {
          var f = (1 - d2 / 15000) * 0.5;
          var d = Math.sqrt(d2);
          n.x += (dx / d) * f;
          n.y += (dy / d) * f;
        }
      }
    }

    ptr.gx += (ptr.x - ptr.gx) * 0.06;
    ptr.gy += (ptr.y - ptr.gy) * 0.06;
  }

  // ── loop, throttled to ~40fps (plenty for slow drift, saves battery
  //    because a WebGL scene is already running in the hero)
  var last = 0;
  var INTERVAL = 1000 / 40;

  function frame(ts) {
    requestAnimationFrame(frame);
    if (!running) return;
    if (ts - last < INTERVAL) return;
    last = ts;
    step();
    draw();
  }

  resize();

  if (REDUCED) {
    // static field: draw the network once, no motion
    draw();
  } else {
    requestAnimationFrame(frame);
  }

  var rt;
  window.addEventListener('resize', function () {
    clearTimeout(rt);
    rt = setTimeout(function () {
      resize();
      if (REDUCED) draw();
    }, 180);
  });

  window.addEventListener('pointermove', function (e) {
    if (ptr.gx < -9000) { ptr.gx = e.clientX; ptr.gy = e.clientY; }
    ptr.x = e.clientX;
    ptr.y = e.clientY;
    ptr.active = true;
  }, { passive: true });

  window.addEventListener('pointerleave', function () { ptr.active = false; });

  document.addEventListener('visibilitychange', function () {
    running = !document.hidden;
  });

  new MutationObserver(function () {
    P = palette();
    if (REDUCED) draw();
  }).observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
})();
