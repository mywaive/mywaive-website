# Styling

The site uses plain CSS. There is no CSS framework and no preprocessor. Styles live in three layers:

| Layer | Location | Scope |
|---|---|---|
| Design tokens | `src/styles/tokens.css` | Custom properties on `:root` |
| Global styles | `src/styles/*.css`, imported by `global.css` | The whole site |
| Component and page styles | `Name/Name.css`, `src/styles/pages/*.css` | Scoped to one component or page |

## Design tokens

`tokens.css` defines every colour, size, space and timing value as a CSS custom property. Use the tokens instead of raw values. The tokens are derived from the myWaive design system in `context/design_system/` (the Figma style guide).

| Group | Examples | Notes |
|---|---|---|
| Brand palette | `--colour-primary-wave`, `--colour-primary-100…800`, `--colour-electric-cyan`, `--colour-electric-ruby-*`, `--colour-mint`, `--colour-grey-*` | Raw palette (British spelling: `colour`) |
| Semantic colours | `--color-brand`, `--color-text`, `--color-text-muted`, `--color-surface`, `--color-border`, `--color-focus` | Prefer these in components (US spelling: `color`) |
| Type | `--type-h0` to `--type-h5`, `--type-lead`, `--type-body`, `--type-small`, `--lh-*`, `--font-weight-*` | Heading sizes are fluid, using `clamp()` |
| Spacing | `--space-1` (4px) to `--space-10` (104px), `--section-y`, `--gutter` | `--section-y` is the fluid vertical padding of a section |
| Layout | `--container` (1280px), `--container-narrow` (860px), `--prose` (72ch) | |
| Shape | `--radius-sm`, `--radius-md`, `--radius-lg`, `--radius-pill`, `--shadow-card`, `--shadow-float` | |
| Motion | `--dur` (220ms), `--dur-reveal` (700ms), `--ease`, `--ease-out`, `--ease-in-out` | |

## Global styles

`src/styles/global.css` is imported once, by `BaseLayout`. It imports the other files in cascade order, and **the order matters**: a later file wins over an earlier one at equal specificity.

| File | Contents |
|---|---|
| `tokens.css` | Custom properties |
| `reset.css` | Box sizing, margins, media defaults, base typography, focus ring, reduced-motion overrides |
| `typography.css` | Type scale classes (`.h0`–`.h5`, `.lead`, `.small`), `.muted`, `.highlight` |
| `layout.css` | `.container`, `.container-narrow`, `.section`, `.section-header`, and small-screen adjustments |
| `utilities.css` | Surfaces (`.bg-*`), `.dotted`, `.panel`, `.bullets`, `.eyebrow`, `.grid` and `.grid-2/3/4`, `.card`, `.icon-tile`, `.visually-hidden`, `.skip-link`, `.prose` |
| `effects.css` | Scroll reveal, headline word animation, spotlight, tilt, magnet, star border, dot grid, shine, page transitions, scroll-lit headings |

Reach for an existing class before writing new CSS. A typical section needs no global CSS of its own:

```astro
<section class="section bg-muted">
  <div class="container">
    <div class="section-header">
      <p class="eyebrow">How it works</p>
      <h2 class="h3">Four steps to go-live</h2>
    </div>
    <ul class="grid grid-3" role="list">…</ul>
  </div>
</section>
```

## Surfaces and tones

A section's background comes from a surface class. Each class also sets the matching text colour.

| Class | Background |
|---|---|
| `bg-white` | White |
| `bg-muted` | Muslin white |
| `bg-tint` | Brilliant white (blue-tinted) |
| `bg-lilac`, `bg-lilac-strong` | Primary 100 / Primary 300 |
| `bg-brand`, `bg-brand-dark` | Wave blue / Primary 800 |
| `bg-dark` | Black |
| `bg-teal`, `bg-mint`, `bg-mint-bright` | Accent greens |
| `bg-pink`, `bg-ruby-tint`, `bg-ruby` | Electric Ruby shades |

Add `on-dark` to a dark surface so the nested elements (eyebrows, muted text, icon tiles, focus rings) switch to their light versions. Add `dotted` for the dot texture, which `effects.ts` then makes react to the pointer. Section components choose these classes for you through their `tone` prop.

Colour pairs follow the accessibility rules in `context/design_system/accessibility.md`. For example, white text on Electric Ruby is allowed for large text only, so `bg-ruby` uses a dark ruby for body text.

## Component styles

Each component keeps its styles in `Name.css`, next to `Name.astro`, which loads them with:

```astro
<style>@import './Name.css';</style>
```

Astro scopes these rules to the component. At build time it adds a `data-astro-cid-*` attribute to each element the component renders, and to each selector in its CSS. So `.card` in `Testimonials.css` only matches cards rendered by `Testimonials.astro`. Class names can repeat across components without clashing.

Scoping has two consequences:

1. **Elements rendered by a child component, or created by a script, are not matched.** Wrap that part of the selector in `:global()`:

   ```css
   /* Button is a child component, so its root needs :global */
   .hero-actions :global(.btn) { flex: 1 1 100%; }

   /* .tab-ink is created by FeatureTabs.ts at runtime */
   .tablist :global(.tab-ink) { position: absolute; }
   ```

2. **To style based on an ancestor outside the component**, wrap that ancestor in `:global()`:

   ```css
   :global(.bg-lilac) .tab { background: rgba(255, 255, 255, 0.55); }
   :global(html.js) .timeline .step::before { transform: scaleY(0); }
   ```

Scoped selectors carry the extra attribute, so they are one class more specific than the same selector in a global file. A component rule therefore beats a global utility with the same selector.

### Page styles

Pages use the same pattern, with their stylesheet in `src/styles/pages/`:

```astro
<style>@import '../styles/pages/about.css';</style>
```

Keep page CSS for page-specific layout only, such as a two-column grid around two sections. Anything reusable belongs in a component.

## Responsive design

The CSS is written mobile first. Use these breakpoints:

| Breakpoint | Query | Used for |
|---|---|---|
| Small phones | `@media (max-width: 599px)` | Tighter spacing, stacked buttons |
| Tablet and up | `@media (min-width: 600px)` | Two-column grids, larger gutter |
| Desktop and up | `@media (min-width: 1080px)` | Full layouts, three- and four-column grids |
| Below desktop | `@media (max-width: 1079px)` | Mobile navigation and stacked heroes |

The page gutter (`--gutter`) grows at 600px and 1080px. Content never exceeds `--container`. Grids use fixed column counts per breakpoint, not `auto-fit`, so a list of six items never wraps as four plus two.

Every page must fit a 320px viewport without horizontal scrolling. The QA suite checks this.

## Typography

DM Sans (variable, with optical sizing) is self-hosted through `@fontsource-variable/dm-sans` and imported by `BaseLayout`. Heading levels and visual sizes are separate concerns: use the right element for the document outline (`h1`, `h2`, …) and a size class for the look (`<h2 class="h3">`). Headings use `text-wrap: balance` and paragraphs `text-wrap: pretty`.

## Motion

All motion is CSS-first, and none of it is required to understand the page.

- **Reveal on scroll:** add `data-reveal`, and `data-stagger` on the parent for a cascade. The styles are in `effects.css`; the trigger is in `scripts/reveal.ts`.
- **Hero headline:** HeroDark splits the headline into words at build time (`utils/words.ts`). The words blur in on load, then the highlighted phrase gets a single shine.
- **Pointer effects:** `data-spotlight`, `data-tilt` and `data-magnet` (see [Architecture](architecture.md#browser-scripts)).
- **Page transitions:** cross-document view transitions (`@view-transition { navigation: auto; }`), in browsers that support them.

Rules for new motion:

- Animate only `transform`, `opacity` and `filter`.
- Put entrance animations inside `@media (prefers-reduced-motion: no-preference)`. `reset.css` also shortens every animation and transition under reduced motion, as a safety net.
- Use the motion tokens for durations and easing.
- Animations that start from hidden must only hide content under `html.js`, so the page still shows everything without JavaScript.
