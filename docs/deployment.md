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
| `PUBLIC_FORM_ENDPOINT` | ContactForm | **Build time.** The URL the contact form posts to. It is written into the HTML, so changing it needs a rebuild. When empty, the form shows a "not connected" message |
| `VERCEL_ENV` | BaseLayout | Set automatically by Vercel. Any value other than `production` adds `noindex` to every page |
| `ATLASCLOUD_API_KEY` | `scripts/images/generate.mjs` | Local tooling only; never needed for a build |

For local builds, copy `.env.example` to `.env`. On a host, set the variables in its build settings. `.env` is git-ignored; never commit secrets.

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
| `Content-Security-Policy` | `default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self' https://formspree.io; form-action 'self' https://formspree.io; frame-ancestors 'none'; base-uri 'self'; object-src 'none'; upgrade-insecure-requests` |
| `X-Content-Type-Options` | `nosniff` |
| `X-Frame-Options` | `DENY` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=(), interest-cohort=()` |

The CSP allows only same-origin scripts, styles, fonts and images, plus the contact form endpoint. If the form moves to a different provider, add that provider's origin to `connect-src` and `form-action`, or submissions will be blocked.

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

## Other hosts (e.g. GoDaddy)

To host somewhere else, such as GoDaddy's cPanel web hosting:

1. Build locally with the production environment variables set.
2. Upload the **contents** of `dist/` to the web root (on cPanel, usually `public_html/`).
3. Recreate every rule in [Host requirements](#host-requirements) in the host's own configuration. On Apache-based hosting such as cPanel, that means an `.htaccess` file in the web root. The repository does not include one yet.
4. Run the QA suite against the live URL (see above) and confirm the response headers in the browser's developer tools.

Without step 3, the site still loads, but it loses its security headers, the trailing-slash and `/for-industries` redirects, and long-term caching.

## Contact form

The form posts to whatever URL `PUBLIC_FORM_ENDPOINT` holds, and expects a JSON response (it sends `Accept: application/json`). It is built for [Formspree](https://formspree.io):

1. Create a form in Formspree and set the email address that should receive enquiries.
2. Set `PUBLIC_FORM_ENDPOINT=https://formspree.io/f/<form-id>` in the build environment.
3. Rebuild and deploy.
4. Send a test enquiry and confirm it arrives.

The hidden `_gotcha` field is Formspree's spam trap. A submission with that field filled in is discarded.

Any endpoint that accepts a `multipart/form-data` POST and returns a 2xx status on success will work, including a script on your own server. If it is on another origin, update the CSP as described in [Security headers](#security-headers). Whichever service handles submissions processes personal data, so name it in the privacy policy.

## Release checklist

1. `npm run check`: 0 errors and 0 warnings.
2. `npm run build`: no errors or warnings.
3. `npm run serve:dist`, then `npm run qa:dist` in Chromium, WebKit and Firefox: no problems.
4. `npm run ui-audit`: no findings.
5. Content: no `sample: true` testimonials on show, legal pages at `status: final`, regulatory wording signed off.
6. Deploy to a preview first and check it, then deploy to production.
7. After the production deploy, run the QA suite against the live URL.
