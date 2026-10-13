const form = document.querySelector<HTMLFormElement>('[data-contact-form]');
if (form) {
  const summary = form.querySelector<HTMLElement>('[data-form-error]')!;
  const title = form.querySelector<HTMLElement>('[data-form-error-title]')!;
  const list = form.querySelector<HTMLUListElement>('[data-form-error-list]')!;
  const ok = form.querySelector<HTMLElement>('[data-form-success]')!;
  const fields = () => Array.from(form.elements).filter(
    (el): el is HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement =>
      (el instanceof HTMLInputElement || el instanceof HTMLSelectElement || el instanceof HTMLTextAreaElement) && el.name !== '_gotcha'
  );
  const labelFor = (el: HTMLElement) =>
    form.querySelector(`label[for="${el.id}"]`)?.textContent?.replace('*', '').trim() || el.getAttribute('name') || 'This field';
  const message = (el: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement) => {
    if (el.validity.valueMissing) {
      if (el.type === 'checkbox') return 'You need to agree before we can get in touch';
      if (el instanceof HTMLSelectElement) return `Choose an option for “${labelFor(el)}”`;
      return `Enter your ${labelFor(el).toLowerCase()}`;
    }
    if (el.validity.typeMismatch && el.type === 'email') return 'Enter an email address in the format name@example.com';
    return el.validationMessage;
  };
  const clear = (el: HTMLElement) => {
    el.removeAttribute('aria-invalid');
    const id = el.id + '-error';
    document.getElementById(id)?.remove();
    const d = (el.getAttribute('aria-describedby') || '').split(' ').filter((x) => x && x !== id).join(' ');
    d ? el.setAttribute('aria-describedby', d) : el.removeAttribute('aria-describedby');
  };
  // Clear a field's error once the person fixes it, but never validate mid-typing
  fields().forEach((el) => el.addEventListener('input', () => el.checkValidity() && clear(el)));

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    fields().forEach(clear);
    summary.hidden = true;
    const invalid = fields().filter((el) => !el.checkValidity());

    if (invalid.length) {
      list.innerHTML = '';
      invalid.forEach((el) => {
        const msg = message(el);
        el.setAttribute('aria-invalid', 'true');
        // Inline error beside the field, tied to it for screen readers
        const p = document.createElement('p');
        p.className = 'field-error'; p.id = el.id + '-error'; p.textContent = msg;
        (el.type === 'checkbox' ? el.parentElement : el.closest('.field'))?.appendChild(p);
        el.setAttribute('aria-describedby', [(el.getAttribute('aria-describedby') || ''), p.id].filter(Boolean).join(' '));
        // Matching entry in the summary, linked to the field
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = '#' + el.id; a.textContent = msg;
        a.addEventListener('click', (ev) => { ev.preventDefault(); el.focus(); });
        li.appendChild(a); list.appendChild(li);
      });
      title.textContent = invalid.length === 1 ? 'There is 1 problem with this form' : `There are ${invalid.length} problems with this form`;
      summary.hidden = false;
      summary.focus();
      return;
    }

    if (form.dataset.live !== 'true') {
      list.innerHTML = '';
      title.textContent = 'This form isn’t connected to a delivery service yet. Please email us instead.';
      summary.hidden = false; summary.focus();
      return;
    }
    try {
      const body = new URLSearchParams(new FormData(form) as unknown as Record<string, string>);
      const res = await fetch(form.action, { method: 'POST', body, headers: { Accept: 'application/json' } });
      if (!res.ok) throw new Error(String(res.status));
      form.classList.add('sent'); ok.hidden = false; ok.focus();
    } catch {
      list.innerHTML = '';
      title.textContent = 'Something went wrong sending your request. Please try again or email us directly.';
      summary.hidden = false; summary.focus();
    }
  });
}
