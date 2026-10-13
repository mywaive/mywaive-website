document.querySelectorAll<HTMLElement>('[data-tabs]').forEach((root) => {
  const tabs = Array.from(root.querySelectorAll<HTMLButtonElement>('[role="tab"]'));
  const panels = Array.from(root.querySelectorAll<HTMLElement>('[role="tabpanel"]'));
  // Sliding pill behind the selected tab (placed by JS so it works for the list and the pill row)
  const list = root.querySelector<HTMLElement>('[role="tablist"]')!;
  const ink = document.createElement('span');
  ink.className = 'tab-ink'; ink.setAttribute('aria-hidden', 'true');
  list.prepend(ink); list.classList.add('has-ink');
  const place = () => {
    const t = tabs.find((x) => x.getAttribute('aria-selected') === 'true')!;
    ink.style.transform = `translate(${t.offsetLeft}px, ${t.offsetTop}px)`;
    ink.style.width = `${t.offsetWidth}px`; ink.style.height = `${t.offsetHeight}px`;
  };
  const select = (i: number, focus = false) => {
    tabs.forEach((t, j) => { const on = i === j; t.setAttribute('aria-selected', String(on)); t.tabIndex = on ? 0 : -1; panels[j].hidden = !on; });
    place();
    if (focus) tabs[i].focus();
  };
  place();
  new ResizeObserver(place).observe(list);
  requestAnimationFrame(() => ink.classList.add('ready')); // no slide on first paint
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => select(i));
    t.addEventListener('keydown', (e) => {
      const n = tabs.length;
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') { e.preventDefault(); select((i + 1) % n, true); }
      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') { e.preventDefault(); select((i - 1 + n) % n, true); }
      if (e.key === 'Home') { e.preventDefault(); select(0, true); }
      if (e.key === 'End') { e.preventDefault(); select(n - 1, true); }
    });
  });
});
