/**
 * Effects ported from React Bits (reactbits.dev, MIT + Commons Clause) to plain DOM,
 * so the site needs neither React nor GSAP/Motion:
 *   [data-scroll-reveal] ScrollReveal — words un-blur and brighten as the quote scrolls in; the block straightens from 3°
 *   [data-spotlight]     SpotlightCard — a soft light follows the pointer across the card
 *   [data-tilt]          TiltedCard    — 3D tilt toward the pointer
 *   [data-magnet]        Magnet        — the button eases toward a nearby pointer
 *   [data-count]         CountUp       — the number counts up from 0 when it comes into view
 *   .dotted sections     DotGrid       — the dots tint near the pointer, scatter on a quick move or click, spring back
 * BlurText, StarBorder, ShinyText and GlareHover are CSS-only. Everything is skipped under prefers-reduced-motion;
 * pointer effects also need a precise hover pointer.
 */
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;

function scrollReveal() {
  const blocks = [...document.querySelectorAll<HTMLElement>('[data-scroll-reveal]')];
  if (!blocks.length) return;
  const BASE_OPACITY = 0.1, BLUR = 4, ROTATE = 3, STAGGER = 0.05;
  const words = blocks.map((b) => [...b.querySelectorAll<HTMLElement>('.sr-word')]);
  let queued = false;
  const update = () => {
    queued = false;
    const vh = innerHeight;
    blocks.forEach((block, bi) => {
      const r = block.getBoundingClientRect();
      // React Bits scrubs to "bottom bottom", which for a short quote is ~70px of scroll and reads as a snap.
      // Here the words run from the quote's top at 85% of the viewport to 35%; the tilt settles over the first half.
      const start = vh * 0.85, end = vh * 0.35;
      const rot = Math.min(1, Math.max(0, (start - r.top) / ((start - end) / 2)));
      block.style.transform = `rotate(${(ROTATE * (1 - rot)).toFixed(2)}deg)`;
      const p = Math.min(1, Math.max(0, (start - r.top) / Math.max(1, start - end)));
      const list = words[bi], span = 1 + STAGGER * (list.length - 1);
      list.forEach((w, i) => {
        const local = Math.min(1, Math.max(0, p * span - i * STAGGER));
        w.style.opacity = String(BASE_OPACITY + (1 - BASE_OPACITY) * local);
        w.style.filter = local >= 1 ? '' : `blur(${(BLUR * (1 - local)).toFixed(2)}px)`;
      });
    });
  };
  const queue = () => { if (!queued) { queued = true; requestAnimationFrame(update); } };
  blocks.forEach((b) => { b.style.transformOrigin = '0% 50%'; });
  addEventListener('scroll', queue, { passive: true });
  addEventListener('resize', queue, { passive: true });
  update();
}

function spotlight() {
  document.addEventListener('pointermove', (e) => {
    const card = (e.target as Element | null)?.closest<HTMLElement>('[data-spotlight]');
    if (!card) return;
    const r = card.getBoundingClientRect();
    card.style.setProperty('--mx', `${e.clientX - r.left}px`);
    card.style.setProperty('--my', `${e.clientY - r.top}px`);
  }, { passive: true });
}

function tilt() {
  const AMPLITUDE = 10, SCALE = 1.04; // React Bits defaults are 14° / 1.1 — calmer for portraits
  document.querySelectorAll<HTMLElement>('[data-tilt]').forEach((el) => {
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      const dx = (e.clientX - r.left - r.width / 2) / (r.width / 2);
      const dy = (e.clientY - r.top - r.height / 2) / (r.height / 2);
      el.style.transform = `perspective(800px) rotateX(${(-dy * AMPLITUDE).toFixed(2)}deg) rotateY(${(dx * AMPLITUDE).toFixed(2)}deg) scale(${SCALE})`;
    });
    el.addEventListener('pointerleave', () => { el.style.transform = ''; });
  });
}

function magnet() {
  const PADDING = 60, STRENGTH = 4; // React Bits default strength 2 moves half the distance — too much for a CTA
  const els = [...document.querySelectorAll<HTMLElement>('[data-magnet]')];
  if (!els.length) return;
  addEventListener('mousemove', (e) => {
    for (const el of els) {
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      const near = Math.abs(cx - e.clientX) < r.width / 2 + PADDING && Math.abs(cy - e.clientY) < r.height / 2 + PADDING;
      el.classList.toggle('is-near', near);
      el.style.transform = near ? `translate3d(${((e.clientX - cx) / STRENGTH).toFixed(1)}px, ${((e.clientY - cy) / STRENGTH).toFixed(1)}px, 0)` : '';
    }
  }, { passive: true });
}

function countUp() {
  const els = [...document.querySelectorAll<HTMLElement>('[data-count]')];
  if (!els.length) return;
  const DURATION = 1600;
  const run = (el: HTMLElement) => {
    const raw = el.dataset.count!;
    const to = Number(raw.replace(/,/g, ''));
    const decimals = raw.includes('.') ? raw.split('.')[1].length : 0;
    const fmt = new Intl.NumberFormat('en-GB', { minimumFractionDigits: decimals, maximumFractionDigits: decimals, useGrouping: raw.includes(',') });
    const t0 = performance.now();
    const step = (now: number) => {
      const t = Math.min(1, (now - t0) / DURATION);
      el.textContent = fmt.format(to * (1 - (1 - t) ** 4)); // ease-out quart, settles like the spring
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  const io = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      io.unobserve(entry.target);
      // Hero cards float in at ~700ms; start counting as they land
      setTimeout(() => run(entry.target as HTMLElement), 700);
    }
  });
  els.forEach((el) => { el.textContent = '0'; io.observe(el); });
}

function dotGrid() {
  const CELL = 18, R = 1.5, PROX = 120, SHOCK = 250, SPEED_TRIGGER = 100;
  const STIFF = 0.06, DAMP = 0.12; // per-frame spring: a little overshoot, like the original elastic return
  document.querySelectorAll<HTMLElement>('.dotted').forEach((section) => {
    const base = getComputedStyle(section).getPropertyValue('--dot').trim() || 'rgba(9, 102, 255, 0.16)';
    const canvas = document.createElement('canvas');
    canvas.className = 'dotgrid-canvas';
    canvas.setAttribute('aria-hidden', 'true');
    section.prepend(canvas);
    section.classList.add('dotgrid-on');
    const ctx = canvas.getContext('2d')!;
    let w = 0, h = 0, cols = 0, rows = 0;
    let ox = new Float32Array(0), oy = new Float32Array(0), vx = new Float32Array(0), vy = new Float32Array(0);
    const ptr = { x: -9999, y: -9999, t: 0, speed: 0, vx: 0, vy: 0, inside: false };
    let running = false, visible = false;

    const build = () => {
      const r = section.getBoundingClientRect(), dpr = devicePixelRatio || 1;
      w = r.width; h = r.height;
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      canvas.style.width = `${w}px`; canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      // Same lattice as the CSS pattern: one dot in the centre of each 18px tile
      cols = Math.ceil(w / CELL); rows = Math.ceil(h / CELL);
      const n = cols * rows;
      ox = new Float32Array(n); oy = new Float32Array(n); vx = new Float32Array(n); vy = new Float32Array(n);
      draw();
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = base;
      ctx.beginPath();
      const lit: number[] = [];
      for (let i = 0, n = cols * rows; i < n; i++) {
        const cx = (i % cols) * CELL + CELL / 2, cy = Math.floor(i / cols) * CELL + CELL / 2;
        const d = Math.hypot(cx - ptr.x, cy - ptr.y);
        if (d < PROX) { lit.push(i, d); continue; }
        ctx.moveTo(cx + ox[i] + R, cy + oy[i]); ctx.arc(cx + ox[i], cy + oy[i], R, 0, Math.PI * 2);
      }
      ctx.fill();
      // Near the pointer the dots tint to Wave blue and grow slightly
      for (let k = 0; k < lit.length; k += 2) {
        const i = lit[k], t = 1 - lit[k + 1] / PROX;
        const cx = (i % cols) * CELL + CELL / 2 + ox[i], cy = Math.floor(i / cols) * CELL + CELL / 2 + oy[i];
        ctx.fillStyle = `rgba(9, 102, 255, ${(0.16 + 0.74 * t).toFixed(3)})`;
        ctx.beginPath(); ctx.arc(cx, cy, R + 0.8 * t, 0, Math.PI * 2); ctx.fill();
      }
    };

    const tick = () => {
      let moving = false;
      for (let i = 0, n = cols * rows; i < n; i++) {
        if (ox[i] === 0 && oy[i] === 0 && vx[i] === 0 && vy[i] === 0) continue;
        vx[i] += -STIFF * ox[i] - DAMP * vx[i]; vy[i] += -STIFF * oy[i] - DAMP * vy[i];
        ox[i] += vx[i]; oy[i] += vy[i];
        if (Math.abs(ox[i]) + Math.abs(oy[i]) + Math.abs(vx[i]) + Math.abs(vy[i]) < 0.05) { ox[i] = oy[i] = vx[i] = vy[i] = 0; } else moving = true;
      }
      draw();
      if ((moving || ptr.inside) && visible) requestAnimationFrame(tick); else running = false;
    };
    const wake = () => { if (!running && visible) { running = true; requestAnimationFrame(tick); } };

    const push = (radius: number, strength: (d: number) => number) => {
      for (let i = 0, n = cols * rows; i < n; i++) {
        const cx = (i % cols) * CELL + CELL / 2, cy = Math.floor(i / cols) * CELL + CELL / 2;
        const dx = cx - ptr.x, dy = cy - ptr.y, d = Math.hypot(dx, dy);
        if (d >= radius || d === 0) continue;
        const f = strength(d);
        vx[i] += (dx / d) * f; vy[i] += (dy / d) * f;
      }
    };

    addEventListener('pointermove', (e) => {
      if (!visible) return;
      const r = section.getBoundingClientRect(), now = performance.now();
      const x = e.clientX - r.left, y = e.clientY - r.top, dt = Math.max(8, now - ptr.t);
      ptr.vx = ((x - ptr.x) / dt) * 1000; ptr.vy = ((y - ptr.y) / dt) * 1000;
      ptr.speed = Math.min(5000, Math.hypot(ptr.vx, ptr.vy));
      ptr.x = x; ptr.y = y; ptr.t = now;
      ptr.inside = x > -PROX && y > -PROX && x < w + PROX && y < h + PROX;
      if (ptr.inside && ptr.speed > SPEED_TRIGGER) push(PROX, (d) => (1 - d / PROX) * Math.min(6, ptr.speed / 400));
      wake();
    }, { passive: true });
    section.addEventListener('click', () => { push(SHOCK, (d) => (1 - d / SHOCK) * 5); wake(); });

    new ResizeObserver(build).observe(section);
    new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; if (!visible) { ptr.inside = false; ptr.x = ptr.y = -9999; draw(); } }).observe(section);
    build();
  });
}




export function initEffects() {
  if (reduced) return;
  scrollReveal();
  countUp();
  if (finePointer) { spotlight(); tilt(); magnet(); dotGrid(); }
}
