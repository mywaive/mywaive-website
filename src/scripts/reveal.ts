/**
 * Scroll reveals, fired once per element (marketing surfaces only).
 * [data-reveal] elements start hidden via CSS when <html> has the `js` class.
 * [data-stagger] parents give their [data-reveal] children an index for a 60ms cascade.
 */
export function initReveal() {
  document.querySelectorAll<HTMLElement>('[data-stagger]').forEach((group) => {
    group.querySelectorAll<HTMLElement>('[data-reveal]').forEach((el, i) => {
      if (!el.style.getPropertyValue('--i')) el.style.setProperty('--i', String(i));
    });
  });

  const els = document.querySelectorAll<HTMLElement>('[data-reveal]:not(.is-in)');
  if (!('IntersectionObserver' in window)) {
    els.forEach((el) => el.classList.add('is-in'));
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      }
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.12 },
  );

  els.forEach((el) => io.observe(el));
  (window as unknown as { __revealReady?: boolean }).__revealReady = true;
}
