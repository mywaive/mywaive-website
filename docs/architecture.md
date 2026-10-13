# Architecture

This guide explains how the site is put together and how a request becomes a page.

## Rendering model

The site is fully static. `astro build` renders every route to an HTML file in `dist/`, plus hashed CSS, JavaScript and image files in `dist/_astro/`. No server code runs in production, so any static host can serve the output.

All component logic (props, data lookups, content queries, image processing) runs **at build time**. Code inside the `---` frontmatter of an `.astro` file never reaches the browser. Only these reach the browser:

- the rendered HTML;
- the CSS from `src/styles/` and from each component's `.css` file;
- the `.ts` files that components load through a `<script>` tag;
- `public/js/flag.js`.

## Request flow

```
URL ─▶ src/pages/<route>.astro
         └─ PageLayout (marketing pages) or LegalLayout (legal pages)
              └─ BaseLayout      <head>, fonts, global CSS, Header, Footer, CookieBanner, site scripts
                   └─ <slot />   the page's sections
                        └─ sections/*  ─▶ ui/*        building blocks
                                       ─▶ data/*      shared copy and settings
                                       ─▶ content/*   Markdown collections
                                       ─▶ assets/*    images, optimised by astro:assets
```

## Routes

Astro maps files in `src/pages/` to URLs. The config sets `trailingSlash: 'never'`, so `/about` is canonical and `/about/` redirects to it.

| URL | File | Layout |
|---|---|---|
| `/` | `pages/index.astro` | PageLayout |
| `/about` | `pages/about.astro` | PageLayout |
| `/product` | `pages/product.astro` | PageLayout |
| `/contact` | `pages/contact.astro` | PageLayout |
| `/for-industries/pension-providers` | `pages/for-industries/pension-providers.astro` | PageLayout |
| `/for-industries/corporates` | `pages/for-industries/corporates.astro` | PageLayout |
| `/for-industries/partners` | `pages/for-industries/partners.astro` | PageLayout |
| `/legal/<slug>` | `pages/legal/[slug].astro` | LegalLayout |
| any unknown URL | `pages/404.astro` | PageLayout, without the CTA band |

`/legal/[slug].astro` is a dynamic route. Its `getStaticPaths()` creates one page for each Markdown file in `src/content/legal/`. `/for-industries` has no page of its own; the host redirects it to `/for-industries/pension-providers` (see [Deployment](deployment.md#redirects)).

The `@astrojs/sitemap` integration writes `sitemap-index.xml` and `sitemap-0.xml` on every build.

## Layouts

Layouts live in `src/layouts/` and nest inside each other.

**`BaseLayout.astro`** is the HTML document every page uses. It:

- imports the DM Sans font and `styles/global.css`;
- writes the `<head>`: title, description, canonical URL, Open Graph and Twitter tags, favicon, and Organization structured data (JSON-LD);
- adds `noindex` when the `noindex` prop is set, and on every Vercel preview deployment;
- loads `public/js/flag.js` as a blocking script (see [Progressive enhancement](#progressive-enhancement));
- renders the skip link, `Header`, `<main>`, `Footer` and `CookieBanner`;
- loads `BaseLayout.ts`, which starts the site-wide scroll reveals and effects.

**`PageLayout.astro`** wraps BaseLayout and adds a closing `CTABand` after the page content. Pass `cta={false}` to drop the band (the about, contact and 404 pages do), or an object to change its wording.

**`LegalLayout.astro`** uses BaseLayout directly, for legal documents. It renders a title bar, a "last updated" date, a notice when the document is not final, an in-page table of contents built from the document's `##` headings, and the Markdown body styled by the `.prose` class.

## Components

Components are grouped by role. Each group may only use the groups below it:

| Group | Role | Examples |
|---|---|---|
| `global/` | Site chrome, used once per page by BaseLayout | Header, Footer, CookieBanner, Logo |
| `sections/` | Full-width bands that a page stacks vertically | HeroDark, FeatureTabs, HowItWorks, Testimonials |
| `ui/` | Small reusable pieces with no page context | Button, Icon, Photo, PhoneFrame, BrowserFrame |

Pages are short. They choose sections, set props and pass copy, and contain little markup of their own. Most sections take a `tone` prop for their background, plus props to override their default copy. See the [component reference](components.md).

### Component files

```
Name/
  Name.astro   frontmatter (imports, Props interface, build-time logic) + markup
  Name.css     styles
  Name.ts      browser script (optional)
```

`Name.astro` pulls in the other two files at the end of its markup:

```astro
<style>@import './Name.css';</style>
<script>import './Name.ts';</script>
```

Astro treats the imported CSS exactly like an inline `<style>` block, so the rules are **scoped** to that component. Astro bundles the script as an ES module and includes it **once per page**, however many times the component appears. See [Styling](styling.md#component-styles) for how scoping works.

## Data flow

Content comes from three places, all read at build time.

| Source | What lives there | Read with |
|---|---|---|
| `src/data/site.ts` | Company details, contact addresses, navigation, legal links, social links, regulatory statement, form endpoint | `import { site, nav } from '@/data/site'` |
| `src/data/copy.ts` | Copy blocks reused across pages: features, deployment options, trust points, roadmap, how-it-works steps, onboarding steps | `import { features } from '@/data/copy'` |
| `src/content/` | Markdown collections: `legal`, `team`, `advisors`, `testimonials` | `getCollection('team')` from `astro:content` |

The collection schemas live in `src/content.config.ts`. A Markdown file that breaks its schema fails the build. Field-level details are in [Content](content.md).

## Images

Images in `src/assets/` go through `astro:assets`: they are resized, converted to WebP, given a `srcset`, and written to `dist/_astro/` with hashed names. Components find images by name with `import.meta.glob`. For example, `<Photo name="home-hero" />` resolves to `src/assets/photos/home-hero.jpg`. A missing file shows a branded placeholder, or fails the build for headshots.

Files in `public/` are served exactly as they are, with no processing: logos, favicon, the Open Graph image, the about-page video and its captions.

## Browser scripts

| Script | Loaded by | Purpose |
|---|---|---|
| `public/js/flag.js` | BaseLayout, blocking, in `<head>` | Adds `js` to `<html>` before first paint so reveal content can start hidden |
| `src/scripts/reveal.ts` | `BaseLayout.ts` | Fades in `[data-reveal]` elements once, as they scroll into view |
| `src/scripts/effects.ts` | `BaseLayout.ts` | Pointer and scroll effects: spotlight, tilt, magnet, count-up, dot grid, scroll-revealed quotes |
| `Header/Header.ts` | Header | Sticky-header state, mobile menu, dropdowns, Escape to close |
| `FeatureTabs/FeatureTabs.ts` | FeatureTabs | Accessible tabs with arrow-key navigation and the sliding indicator |
| `ContactForm/ContactForm.ts` | ContactForm | Validation, error summary, submission |
| `CookieBanner/CookieBanner.ts` | CookieBanner | Shows the banner until it is dismissed (remembered in `localStorage`) |

The effects are switched on by data attributes in the markup, so a component only needs to add the attribute:

| Attribute | Effect |
|---|---|
| `data-reveal` | Fades and rises into view once. Inside a `data-stagger` parent, children cascade 60 ms apart |
| `data-spotlight` (`="light"` on light cards) | A soft light follows the pointer |
| `data-tilt` | The card tilts in 3D toward the pointer |
| `data-magnet` | The element eases toward a nearby pointer |
| `data-count` | The number counts up from 0 when it comes into view |
| `data-scroll-reveal` | A quote's words un-blur and brighten as it scrolls in |
| `.dotted` (class) | The dot pattern reacts to the pointer |

### Progressive enhancement

- **Without JavaScript, everything is visible.** Hidden-until-revealed styles only apply under `html.js`. If the reveal module has not loaded within 3 seconds, `flag.js` removes the class and shows everything.
- **Reduced motion is respected.** With `prefers-reduced-motion: reduce`, reveals become a plain fade and every movement effect is skipped.
- **Pointer effects need a real pointer.** They only run when the device reports `(hover: hover) and (pointer: fine)`.

## Security model

The site is served with a strict Content Security Policy: `script-src 'self'`, with no inline scripts and no third-party scripts, fonts or images. The code respects this in three ways:

- Every script is an external, same-origin file. `astro.config.mjs` sets `vite.build.assetsInlineLimit: 0` so Vite never inlines one.
- Fonts are self-hosted, and icons are inlined SVG, so no font or icon CDN is needed.
- The only outside origin allowed is the contact form endpoint, in `connect-src` and `form-action`.

The full header list is in [Deployment](deployment.md#security-headers).

## Import paths

`tsconfig.json` maps `@/` to `src/`. Use it for every import in `.astro` and `.ts` files:

```ts
import Button from '@/components/ui/Button/Button.astro';
import { site } from '@/data/site';
```

CSS `@import` does not support the alias. Use a relative path there, for example `'../styles/pages/about.css'`.
