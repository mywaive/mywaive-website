const el = document.querySelector<HTMLElement>('[data-cookie]');
try {
  if (el && !localStorage.getItem('mw-cookie-ok')) el.hidden = false;
  el?.querySelector('[data-cookie-accept]')?.addEventListener('click', () => { try { localStorage.setItem('mw-cookie-ok', '1'); } catch {} el.hidden = true; });
} catch { /* storage unavailable: leave banner hidden */ }
