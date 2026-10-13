// Contact form handler: receives a POST from the demo-request form (contact.astro),
// validates it, drops honeypot spam, and emails the enquiry to the site inbox.
// Mounted at POST /api/contact by scripts/serve-dist.mjs. Configured entirely by
// environment variables (see .env.example) so no secrets live in the repo.
import nodemailer from 'nodemailer';

const MAX_BODY = 64 * 1024; // enquiries are tiny; anything larger is abuse
const TO = process.env.CONTACT_TO || 'jchapman@mywaive.io, james@mywaive.io, hello@mywaive.io';
const FROM = process.env.CONTACT_FROM || 'myWaive website <hello@mywaive.io>';

// One transport for the process. Defaults to GoDaddy's internal relay
// (relay-hosting.secureserver.net:25, no auth, only reachable from GoDaddy hosting).
// Set SMTP_USER/SMTP_PASS to switch to an authenticated mailbox (e.g. smtpout.secureserver.net:465).
let transport;
const mailer = () => {
  if (transport) return transport;
  if (process.env.SMTP_JSON === 'true') return (transport = nodemailer.createTransport({ jsonTransport: true })); // dev: compose but don't send
  const host = process.env.SMTP_HOST || 'relay-hosting.secureserver.net';
  const port = Number(process.env.SMTP_PORT || 25);
  const secure = process.env.SMTP_SECURE ? process.env.SMTP_SECURE === 'true' : port === 465;
  const auth = process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined;
  transport = nodemailer.createTransport({ host, port, secure, auth });
  return transport;
};

// The fields the form (ContactForm.astro) sends, with human labels for the email.
const FIELDS = [
  ['name', 'Full name'],
  ['email', 'Work email'],
  ['organisation', 'Organisation'],
  ['role', 'Role'],
  ['size', 'Members / employees'],
  ['message', 'Message'],
];
const REQUIRED = ['name', 'email', 'organisation', 'role'];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const readBody = (req) =>
  new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on('data', (c) => {
      size += c.length;
      if (size > MAX_BODY) { reject(new Error('payload too large')); req.destroy(); return; }
      chunks.push(c);
    });
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });

// Parse either the browser's native urlencoded POST or the script's fetch (also urlencoded).
// JSON is accepted too, so the endpoint is easy to call from anywhere.
const parse = (raw, type = '') => {
  if (type.includes('application/json')) {
    const o = JSON.parse(raw || '{}');
    return (k) => (o[k] == null ? '' : String(o[k]).trim());
  }
  const p = new URLSearchParams(raw);
  return (k) => (p.get(k) || '').trim();
};

const send = (res, status, body) => {
  const json = typeof body !== 'string';
  res.writeHead(status, { 'Content-Type': json ? 'application/json' : 'text/html; charset=utf-8', 'X-Content-Type-Options': 'nosniff' });
  res.end(json ? JSON.stringify(body) : body);
};

// Minimal styled page for the no-JavaScript path (the fetch path reads JSON and never sees this).
const page = (title, body) =>
  `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title>` +
  `<body style="font-family:system-ui,sans-serif;max-width:40rem;margin:4rem auto;padding:0 1.5rem;line-height:1.6">` +
  `<h1>${title}</h1>${body}<p><a href="/contact">Back to the form</a></p>`;

export async function handleContact(req, res) {
  const wantsJson = (req.headers.accept || '').includes('application/json');
  try {
    const raw = await readBody(req);
    const get = parse(raw, req.headers['content-type'] || '');

    // Honeypot: a filled hidden field means a bot. Pretend it worked; send nothing.
    if (get('_gotcha')) return wantsJson ? send(res, 200, { ok: true }) : send(res, 200, page('Thanks', '<p>Your request has been received.</p>'));

    const errors = REQUIRED.filter((k) => !get(k));
    if (get('email') && !EMAIL_RE.test(get('email'))) errors.push('email');
    if (get('consent') !== 'on' && get('consent') !== 'true') errors.push('consent');
    if (errors.length) {
      return wantsJson
        ? send(res, 400, { ok: false, errors })
        : send(res, 400, page('Please check the form', `<p>Some required details were missing or invalid: ${errors.join(', ')}.</p>`));
    }

    const lines = FIELDS.map(([k, label]) => `${label}: ${get(k) || '—'}`);
    const received = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
    const text = `New demo request from the myWaive website\n\n${lines.join('\n')}\n\nReceived from: ${received}`;
    const html =
      `<h2>New demo request from the myWaive website</h2><table cellpadding="6" style="border-collapse:collapse">` +
      FIELDS.map(([k, label]) => `<tr><td style="font-weight:600;vertical-align:top">${label}</td><td>${(get(k) || '—').replace(/</g, '&lt;')}</td></tr>`).join('') +
      `</table>`;

    const info = await mailer().sendMail({
      from: FROM,
      to: TO,
      replyTo: get('email'),
      subject: `New demo request — ${get('name')}${get('organisation') ? `, ${get('organisation')}` : ''}`,
      text,
      html,
    });
    // Logged to the host's app log so you can confirm the mail server accepted it (and for whom)
    console.log(`[contact] sent id=${info.messageId} accepted=${(info.accepted || []).join(',')} rejected=${(info.rejected || []).join(',')} response=${info.response || ''}`);

    return wantsJson
      ? send(res, 200, { ok: true })
      : send(res, 200, page('Thanks — we’ll be in touch', '<p>We aim to reply within two working days.</p>'));
  } catch (err) {
    const tooLarge = err && err.message === 'payload too large';
    console.error('[contact] failed:', err);
    return wantsJson
      ? send(res, tooLarge ? 413 : 500, { ok: false, error: 'send_failed' })
      : send(res, tooLarge ? 413 : 500, page('Something went wrong', '<p>We couldn’t send your request. Please try again, or email hello@mywaive.io directly.</p>'));
  }
}
