const header = document.querySelector<HTMLElement>('[data-header]');
if (header) {
  const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 24);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  const toggle = header.querySelector<HTMLButtonElement>('[data-menu-toggle]');
  toggle?.addEventListener('click', () => {
    const open = header.classList.toggle('menu-open');
    toggle.setAttribute('aria-expanded', String(open));
    document.documentElement.style.overflow = open ? 'hidden' : '';
  });

  header.querySelectorAll<HTMLElement>('[data-dropdown]').forEach((li) => {
    const btn = li.querySelector<HTMLButtonElement>('button');
    btn?.addEventListener('click', () => {
      const open = li.classList.toggle('open');
      btn.setAttribute('aria-expanded', String(open));
    });
    li.addEventListener('focusout', (e) => {
      if (!li.contains(e.relatedTarget as Node)) { li.classList.remove('open'); btn?.setAttribute('aria-expanded', 'false'); }
    });
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      header.querySelectorAll('[data-dropdown].open').forEach((li) => { li.classList.remove('open'); li.querySelector('button')?.setAttribute('aria-expanded', 'false'); });
      if (header.classList.contains('menu-open')) { toggle?.click(); toggle?.focus(); }
    }
  });
}
