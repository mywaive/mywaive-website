# Deployment

The site builds to a folder of static files. Any host that serves static files can run it, as long as it can also send the headers and redirects listed below.

## Build

```sh
npm ci
npm run build
```

The output is `dist/`:

```
dist/
  index.html, 404.html
  about/index.html, product/index.html, contact/index.html, …
  for-industries/<page>/index.html
  legal/<slug>/index.html
  _astro/          hashed CSS, JS and images (safe to cache for ever)
  logo/, media/, js/, favicon.svg, og-default.png, robots.txt
  sitemap-index.xml, sitemap-0.xml
```

The site's own URL is set by `site` in `astro.config.mjs` (`https://www.mywaive.io`). It is used for canonical links, Open Graph URLs and the sitemap. Change it there if the domain changes.

## Environment variables

| Variable | Used by | When |
|---|---|---|
| `CONTACT_TO` | `scripts/contact.mjs` | **Runtime.** Inbox(es) that receive enquiries; comma-separate for several. Defaults to `jchapman@mywaive.io, james@mywaive.io, hello@mywaive.io` |
| `CONTACT_FROM` | `scripts/contact.mjs` | **Runtime.** The `From` address. Defaults to `myWaive website <hello@mywaive.io>` |
| `SMTP_HOST`, `SMTP_PORT` | `scripts/contact.mjs` | **Runtime.** Mail server. Default `relay-hosting.secureserver.net:25` (GoDaddy's internal relay) |
| `SMTP_USER`, `SMTP_PASS` | `scripts/contact.mjs` | **Runtime.** Set to use an authenticated mailbox instead of the relay. `SMTP_SECURE` forces TLS (otherwise inferred: on for port 465) |
| `PUBLIC_FORM_ENDPOINT` | ContactForm | **Build time.** Override where the form posts. It is written into the HTML, so changing it needs a rebuild. When empty, the form posts to the site's own `/api/contact` |
| `VERCEL_ENV` | BaseLayout | Set automatically by Vercel. Any value other than `production` adds `noindex` to every page |
| `ATLASCLOUD_API_KEY` | `scripts/images/generate.mjs` | Local tooling only; never needed for a build |

Build-time variables must be set before `npm run build`; runtime variables are read by the Node server each time it starts (`scripts/contact.mjs` uses them to send mail). For local work, copy `.env.example` to `.env` — the server loads it on start. On a host, set the variables in its Node app / build settings. `.env` is git-ignored; never commit secrets.

## Host requirements

The repository's `vercel.json` configures the host. The same rules must be recreated on any other host.

### URLs

- **Clean URLs:** `/about` serves `about/index.html`.
- **No trailing slash:** `/about/` permanently redirects (308 or 301) to `/about`.
- **404:** unknown paths serve `404.html` with status 404.

### Redirects

| From | To | Type |
|---|---|---|
| `/for-industries` | `/for-industries/pension-providers` | Permanent |

### Security headers

Send these on every response:

| Header | Value |
|---|---|
| `Content-Security-Policy` | `default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; form-action 'self'; frame-ancestors 'none'; base-uri 'self'; object-src 'none'; upgrade-insecure-requests` |
| `X-Content-Type-Options` | `nosniff` |
| `X-Frame-Options` | `DENY` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=(), interest-cohort=()` |

The CSP allows only same-origin scripts, styles, fonts and images. The contact form posts to the site's own `/api/contact`, so `'self'` already covers it. If `PUBLIC_FORM_ENDPOINT` is pointed at a different-origin provider, add that provider's origin to `connect-src` and `form-action`, or submissions will be blocked.

### Caching

| Path | `Cache-Control` |
|---|---|
| `/_astro/*` | `public, max-age=31536000, immutable` (file names are content-hashed) |
| Everything else | The host's default (short, or revalidated), so new deployments show immediately |

### Testing a host's configuration

`npm run serve:dist` serves `dist/` locally using the rules in `vercel.json`. `npm run qa:dist` then tests the site under those exact headers. To check a live host, run the QA suite against it:

```sh
BASE=https://www.mywaive.io OUT=qa-output node scripts/qa.mjs
```

## Vercel

The repository is set up for Vercel, and deploys go straight from the working folder (not from git):

```sh
npm run deploy:preview   # build and deploy to a preview URL (noindex)
npm run deploy           # build and deploy to production
```

Both run `astro build` and then the Vercel CLI, which asks you to log in on first use. `vercel.json` provides the redirects, headers and caching above. `.vercelignore` keeps `context/`, `content/`, `docs/` and other local files out of the upload.

## GoDaddy (Node.js hosting)

GoDaddy's Node.js hosting (cPanel → **Setup Node.js App**, Phusion Passenger) runs the bundled server, `scripts/serve-dist.mjs`. The server does two jobs: it serves the built static site from `dist/` with the redirects, headers and caching from `vercel.json`, and it handles `POST /api/contact` to email enquiries (see [Contact form](#contact-form)). One Node process covers the whole site — there is no separate web server or `.htaccess` to configure.

1. **Build locally:** `npm ci && npm run build`. (The host does not need to build; it only runs the server.)
2. **Upload the project** to the application directory: `dist/`, `scripts/`, `vercel.json`, `package.json` and `package-lock.json`. `dist/` is git-ignored, so include it explicitly (upload it, or build on the host).
3. **Install runtime dependencies on the host:** `npm ci --omit=dev` (the cPanel app has a "Run NPM Install" button, or use the app's terminal).
4. **Configure the Node app** in cPanel:
   - **Node.js version:** 22.12 or later.
   - **Application startup file:** `scripts/serve-dist.mjs`. Passenger runs it directly and provides `PORT`; the server needs no command-line arguments.
   - **Environment variables:** at minimum the contact-form settings from [Environment variables](#environment-variables) (`CONTACT_TO`, `SMTP_HOST`, `SMTP_PORT`, and `SMTP_USER`/`SMTP_PASS` if using an authenticated mailbox).
5. **Start (or restart) the app**, then run the QA suite against the live URL (see above) and send a test enquiry to confirm it arrives at `hello@mywaive.io`.

### Static-only hosts

On a host that can only serve static files (e.g. plain cPanel shared hosting), upload the **contents** of `dist/` to the web root (usually `public_html/`) and recreate every rule in [Host requirements](#host-requirements) in the host's own config — on Apache that means an `.htaccess` file in the web root (the repository does not include one yet). The contact form will **not** work there: `/api/contact` needs the Node server. Either host on Node.js hosting, or set `PUBLIC_FORM_ENDPOINT` to an external provider before building.

## Contact form

The form posts to the site's own `/api/contact`, handled by `scripts/contact.mjs` running inside the Node server. It parses the submission, drops honeypot spam, and emails the enquiry to `CONTACT_TO` (comma-separate for several recipients, e.g. `jchapman@mywaive.io, james@mywaive.io, hello@mywaive.io`), with the sender's address as `Reply-To` so you can reply directly. The JavaScript path sends `Accept: application/json` and reads a `{ "ok": true }` response; the no-JavaScript path gets a plain thank-you page.

Mail is sent over SMTP, configured by the `SMTP_*` / `CONTACT_*` variables in [Environment variables](#environment-variables):

- **Authenticated mailbox (recommended):** set `SMTP_USER`/`SMTP_PASS` and point `SMTP_HOST`/`SMTP_PORT` at the mailbox's SMTP. For GoDaddy email that is `smtpout.secureserver.net:465`. The mail is then SPF-aligned and DKIM-signed, and mail between `@mywaive.io` boxes never leaves GoDaddy's mail system — so it reaches inboxes reliably.
- **GoDaddy's internal relay** (`relay-hosting.secureserver.net:25`, no login): works only from inside GoDaddy hosting and has poor deliverability. Because it is unauthenticated and not DKIM-signed, mail claiming to be from `@mywaive.io` is often **silently dropped or spam-filtered** — including by your own mailboxes. Avoid it for anything you need to receive reliably.

`CONTACT_FROM` must be an address you are authorised to send as — i.e. on the same domain as the authenticated `SMTP_USER`. A `From` that the sending server isn't authorised for will be junked as spoofing.

Each accepted send is logged to the host's app log as `[contact] sent id=… accepted=… rejected=… response=…`. If a test enquiry never arrives, check that line first: `accepted` should list every recipient and `response` should be a `250`. Anything in `rejected`, or a 4xx/5xx `response`, names the problem.

The hidden `_gotcha` field is a spam trap: a submission with it filled in is silently accepted but never emailed. To move delivery to a third-party provider instead, set `PUBLIC_FORM_ENDPOINT` to its URL and rebuild (and add its origin to the CSP's `connect-src`/`form-action`, per [Security headers](#security-headers)). Whichever service handles submissions processes personal data, so name it in the privacy policy.

To test the full pipeline locally without a reachable SMTP server, set `SMTP_JSON=true`: the server composes each message but does not send it.

### Deliverability (SPF, DKIM, DMARC)

Even with authenticated SMTP, set these DNS records for `mywaive.io` so receiving servers trust mail from the domain. Add them in GoDaddy's DNS manager; allow up to an hour (or the record's TTL) to take effect.

| Record | Host / name | Type | Value |
|---|---|---|---|
| **SPF** | `@` | TXT | `v=spf1 include:secureserver.net -all` (authorises GoDaddy's mail servers; keep a single SPF record and merge includes if one already exists) |
| **DKIM** | provided by GoDaddy | CNAME/TXT | Enable DKIM in the GoDaddy email control panel ("Email Deliverability" / DKIM) and add the record it gives you, so outgoing mail is cryptographically signed |
| **DMARC** | `_dmarc` | TXT | `v=DMARC1; p=none; rua=mailto:hello@mywaive.io` — start with `p=none` to monitor, then tighten to `p=quarantine` / `p=reject` once SPF and DKIM pass |

Verify after deploying:

1. Submit a test enquiry and confirm the `[contact] sent … accepted=… response=250` log line (see above).
2. Send one to an external Gmail address, open **Show original**, and check `SPF: PASS`, `DKIM: PASS`, `DMARC: PASS`.
3. Optionally run the message through [mail-tester.com](https://www.mail-tester.com) for a deliverability score.

If GoDaddy's authenticated SMTP still underdelivers, switch to a transactional email provider (Postmark, Resend, SendGrid, …) with a verified sending domain. It is the same `nodemailer` code path — only the `SMTP_*` values change — plus that provider's own SPF/DKIM records.

## Release checklist

1. `npm run check`: 0 errors and 0 warnings.
2. `npm run build`: no errors or warnings.
3. `npm run serve:dist`, then `npm run qa:dist` in Chromium, WebKit and Firefox: no problems.
4. `npm run ui-audit`: no findings.
5. Content: no `sample: true` testimonials on show, legal pages at `status: final`, regulatory wording signed off.
6. Deploy to a preview first and check it, then deploy to production.
7. After the production deploy, run the QA suite against the live URL.
