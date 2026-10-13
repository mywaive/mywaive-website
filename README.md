# myWaive website

The marketing website for **myWaive** (Waive Ltd): [www.mywaive.io](https://www.mywaive.io).

It is a static site built with [Astro](https://astro.build). Every page is rendered to plain HTML and CSS at build time. The JavaScript only adds progressive enhancements: the mobile menu, tabs, contact form validation, scroll reveals and pointer effects. Every page still loads and reads correctly without it.

| | |
|---|---|
| Framework | Astro 7, static output |
| Language | TypeScript (strict), Astro components, plain CSS |
| Content | Astro content collections (Markdown validated by Zod schemas) |
| Fonts and icons | DM Sans, self-hosted via Fontsource. Material Symbols, inlined as SVG at build time |
| Testing | Playwright and axe-core |
| Runtime | Node.js 22.12 or later |

## Quick start

```sh
npm install
cp .env.example .env        # optional: sets the contact form endpoint
npx astro dev --background  # http://localhost:4321
```

Manage the background dev server with `npx astro dev stop`, `npx astro dev status` and `npx astro dev logs`.

## Commands

| Command | What it does |
|---|---|
| `npm run dev` | Start the dev server in the foreground |
| `npm run build` | Build the site into `dist/` |
| `npm run preview` | Serve the built site with Astro's preview server |
| `npm run check` | Type-check components, scripts and content schemas |
| `npm run serve:dist` | Serve `dist/` on port 4400 with the production redirects and security headers |
| `npm run qa` | Run the QA suite against the dev server |
| `npm run qa:dist` | Run the QA suite against `serve:dist`, with the real Content Security Policy |
| `npm run ui-audit` | Run the UI audit against `serve:dist` |
| `npm run images` | Generate scene photography into `src/assets/photos/` (needs `ATLASCLOUD_API_KEY`) |
| `node scripts/screens/render.mjs` | Re-render the product screens and the Open Graph image |
| `npm run deploy` | Build and deploy to Vercel production |
| `npm run deploy:preview` | Build and deploy to a Vercel preview URL |

## Project structure

```
src/
  pages/          Routes: one file per URL, markup only
  layouts/        Page shells: BaseLayout, PageLayout, LegalLayout
  components/
    global/       Site chrome: Header, Footer, CookieBanner, Logo
    sections/     Full-width page sections: HeroDark, FeatureTabs, Testimonials, …
    ui/           Small building blocks: Button, Icon, Photo, PhoneFrame, …
  content/        Markdown collections: legal, team, advisors, testimonials
  data/           Shared copy and site settings (site.ts, copy.ts)
  styles/         Design tokens and global CSS; page-level CSS in styles/pages/
  scripts/        Site-wide browser behaviour (scroll reveal, effects)
  utils/          Build-time helpers
  assets/         Images processed by Astro (photos, product screens, illustrations)
public/           Files served as they are (logos, favicon, video, robots.txt)
scripts/          Node tooling: QA, UI audit, screen renderer, image generation
context/          Design system and content briefs the site was built from
docs/             Developer documentation
```

Each component lives in its own folder, with a separate file for each concern:

```
components/sections/FeatureTabs/
  FeatureTabs.astro   markup and props
  FeatureTabs.css     styles, scoped to this component
  FeatureTabs.ts      browser behaviour (only when the component needs it)
```

## Documentation

| Guide | Covers |
|---|---|
| [Architecture](docs/architecture.md) | How the site fits together: rendering, routing, layouts, data flow, browser scripts |
| [Development](docs/development.md) | Setup, code conventions and step-by-step recipes for common changes |
| [Components](docs/components.md) | Every component, its props, and where it is used |
| [Styling](docs/styling.md) | Design tokens, global CSS, component styles, breakpoints, motion |
| [Content](docs/content.md) | Editing copy, legal pages, people, testimonials, images and icons |
| [Testing](docs/testing.md) | Type checks, the QA suite, the UI audit, other browsers |
| [Deployment](docs/deployment.md) | Build output, environment variables, hosting, security headers, the contact form |
# mywaive-website
