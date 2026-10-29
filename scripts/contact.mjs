// Contact form handler: receives a POST from the demo-request form (contact.astro),
// validates it, drops honeypot spam, and emails the enquiry to the site inbox.
// Mounted at POST /api/contact by scripts/serve-dist.mjs. Configured entirely by
// environment variables (see .env.example) so no secrets live in the repo.
//
// Delivery path is chosen by env: set GRAPH_* to send via Microsoft 365 with app-only OAuth
// (preferred — the tenant blocks basic-auth SMTP); otherwise it falls back to SMTP (a
// transactional provider, or SMTP_JSON=true in dev to compose without sending).
import nodemailer from 'nodemailer';

const MAX_BODY = 64 * 1024; // enquiries are tiny; anything larger is abuse
const TO = process.env.CONTACT_TO || 'jchapman@mywaive.io, james@mywaive.io, hello@mywaive.io';
const FROM = process.env.CONTACT_FROM || 'myWaive website <hello@mywaive.io>';
const addr = (s) => (/<([^>]+)>/.exec(s)?.[1] || s).trim(); // bare address from "Name <addr>"
const recipients = (s) => s.split(',').map(addr).filter(Boolean);

const GRAPH = process.env.GRAPH_CLIENT_ID
  ? {
      tenant: process.env.GRAPH_TENANT_ID,
      clientId: process.env.GRAPH_CLIENT_ID,
      clientSecret: process.env.GRAPH_CLIENT_SECRET,
      sender: process.env.GRAPH_SENDER || addr(FROM), // the 365 mailbox to send as
    }
  : null;

// --- Microsoft Graph (OAuth2 client-credentials, app-only) ---
let token = { value: '', exp: 0 };
async function graphToken() {
  if (token.value && Date.now() < token.exp) return token.value;
  const res = await fetch(`https://login.microsoftonline.com/${GRAPH.tenant}/oauth2/v2.0/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ client_id: GRAPH.clientId, client_secret: GRAPH.clientSecret, scope: 'https://graph.microsoft.com/.default', grant_type: 'client_credentials' }),
  });
  if (!res.ok) throw new Error(`graph token ${res.status}: ${await res.text()}`);
  const j = await res.json();
  token = { value: j.access_token, exp: Date.now() + (j.expires_in - 60) * 1000 }; // refresh a minute early
  return token.value;
}
async function graphSend({ subject, html, replyTo }) {
  const message = {
    subject,
    body: { contentType: 'HTML', content: html },
    from: { emailAddress: { address: GRAPH.sender } },
    toRecipients: recipients(TO).map((a) => ({ emailAddress: { address: a } })),
    replyTo: replyTo ? [{ emailAddress: { address: replyTo } }] : undefined,
  };
  const res = await fetch(`https://graph.microsoft.com/v1.0/users/${encodeURIComponent(GRAPH.sender)}/sendMail`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${await graphToken()}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, saveToSentItems: false }),
  });
  if (!res.ok) throw new Error(`graph sendMail ${res.status}: ${await res.text()}`);
  console.log(`[contact] sent via Graph as ${GRAPH.sender} to ${recipients(TO).join(',')}`);
}

// --- SMTP fallback (nodemailer): a transactional provider, or SMTP_JSON=true for local dev ---
let transport;
const mailer = () => {
  if (transport) return transport;
  if (process.env.SMTP_JSON === 'true') return (transport = nodemailer.createTransport({ jsonTransport: true }));
  const host = process.env.SMTP_HOST || 'relay-hosting.secureserver.net';
  const port = Number(process.env.SMTP_PORT || 25);
  const secure = process.env.SMTP_SECURE ? process.env.SMTP_SECURE === 'true' : port === 465;
  const auth = process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined;
  transport = nodemailer.createTransport({ host, port, secure, requireTLS: !secure, auth }); // 587 upgrades via STARTTLS
  console.log(`[contact] mail via ${host}:${port}${secure ? ' TLS' : ''} ${auth ? `auth=${auth.user}` : 'NO AUTH (relay — unreliable)'}`);
  return transport;
};
async function smtpSend({ subject, html, text, replyTo }) {
  const info = await mailer().sendMail({ from: FROM, to: TO, replyTo, subject, text, html });
  console.log(`[contact] sent id=${info.messageId} accepted=${(info.accepted || []).join(',')} rejected=${(info.rejected || []).join(',')} response=${info.response || ''}`);
}

const deliver = (msg) => (GRAPH ? graphSend(msg) : smtpSend(msg));

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

    await deliver({
      subject: `New demo request — ${get('name')}${get('organisation') ? `, ${get('organisation')}` : ''}`,
      text,
      html,
      replyTo: get('email'),
    });

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
