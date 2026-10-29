# Components

A reference for every component in `src/components/`. Each one lives in its own folder (`Name/Name.astro`, `Name.css`, and `Name.ts` when it has browser behaviour). Import components with the `@/` alias:

```astro
---
import HeroDark from '@/components/sections/HeroDark/HeroDark.astro';
---
```

The `Props` interface at the top of each `.astro` file is the source of truth for its props. The tables below summarise them. A prop with no default is optional unless it is marked **required**.

## Common props

Most sections share these props:

| Prop | Meaning |
|---|---|
| `tone` | Background of the section. Maps to a surface class such as `bg-white`, `bg-muted`, `bg-lilac`, `bg-ruby-tint` or `bg-dark`. `dark` also switches the text to light colours (`on-dark`). See [Styling](styling.md#surfaces-and-tones) |
| `eyebrow` | Small uppercase label above the headline. `false` or `''` hides it |
| `headline`, `intro` | Section heading and the paragraph under it. Most sections have default copy |
| `id` | The section's `id`, used for in-page links such as `/product#features` |
| `embedded` | Renders a plain `<div>` with no section padding or background, for placing the block inside another section |

## Global

Used once per page by `BaseLayout`. Pages do not import these.

### Header

Sticky site header with the logo, the main navigation (from `nav` in `data/site.ts`), the "For Industries" dropdown, the call-to-action button and the mobile menu. It turns solid once the page has scrolled.

| Prop | Type | Default | |
|---|---|---|---|
| `theme` | `'dark' \| 'light'` | `'light'` | `dark` uses the white logo and light links while the header sits over a dark hero |

Behaviour (`Header.ts`): scrolled state, mobile menu toggle (locks page scroll while open), dropdowns opened by click or hover, and Escape to close.

### Footer

Logo, industry links, legal links, company numbers, registered office, regulatory statement and social links. Everything comes from `data/site.ts`. No props.

### CookieBanner

Essential-cookies notice with an OK button. It stays hidden once dismissed, using the `mw-cookie-ok` key in `localStorage`. Keep its wording in line with `/legal/cookie-policy`. No props.

### Logo

The myWaive logo as inline SVG, so its colour follows `currentColor` and the round mark can animate on hover.

| Prop | Type | Default |
|---|---|---|
| `variant` | `'black' \| 'white' \| 'wave'` | `'black'` |
| `height` | `number` (px) | `36` |
| `class` | `string` | |

## Sections

Full-width bands that pages stack in order.

### HeroDark

The main page hero: headline, supporting copy, CTA buttons, and a visual on the right (a photo, a phone screen, a desktop screen or a placeholder), with optional floating UI cards. Despite its name, it supports light tones too.

| Prop | Type | Default | |
|---|---|---|---|
| `headline` | `string` | **required** | Words animate in one at a time |
| `highlight` | `string` | | Part of `headline` to colour |
| `eyebrow`, `sub` | `string` | | |
| `primary` | `{ label, href }` | Book a demo → `/contact` | |
| `secondary` | `{ label, href }` | | Ghost button beside the primary one |
| `hideActions` | `boolean` | `false` | Hide both buttons |
| `tone` | `'dark' \| 'lilac' \| 'light' \| 'pink' \| 'white'` | `'dark'` | |
| `accent` | `'wave' \| 'cyan' \| 'ruby'` | `'wave'` | Colour of the highlight, eyebrow and glow |
| `photo` | `string` | | Name of a file in `src/assets/photos/` |
| `photoRatio` | `string` | `'4 / 5'` | CSS aspect ratio for the photo |
| `screen` | `string` | | Phone screen from `src/assets/screens/`, used when there is no photo |
| `desktopScreen` | `string` | | Desktop screen in a browser frame; takes priority over `photo` and `screen` |
| `image` | `string` | | Alt text for the visual (or the brief shown on the placeholder) |
| `imageIcon` | `string` | `'person'` | Icon on the placeholder |
| `cards` | `{ icon, label?, value, note?, progress? }[]` | `[]` | Floating cards over the visual (see FloatingCard) |
| `compact` | `boolean` | `false` | Less padding underneath |

Used on: home, product, all three industry pages.

### HeroLight

A simple centred hero on a light background, with no visual.

| Prop | Type | Default |
|---|---|---|
| `headline` | `string` | **required** |
| `highlight` | `string` | |
| `highlightColor` | `'brand' \| 'ruby'` | `'brand'` |
| `eyebrow`, `sub` | `string` | |
| `short` | `boolean` | `false` (less vertical padding) |

Used on: contact.

### AudienceCards

Three cards, one per audience (providers, corporates, benefits providers), each linking to its industry page.

| Prop | Type | Default |
|---|---|---|
| `items` | `{ icon, title, text, href, cta?, photo?, alt? }[]` | The three industries |
| `variant` | `'photo' \| 'plain'` | `'photo'` (cards with a photo background) |
| `align` | `'left' \| 'center'` | `'left'` |
| `panelTone` | `'ruby-tint' \| 'lilac' \| false` | `false` (puts the grid on a coloured panel) |
| `tone` | `'muted' \| 'white' \| 'lilac' \| 'ruby-tint'` | `'white'` |
| `eyebrow`, `headline`, `id` | | Defaults provided |

Used on: home.

### FeatureTabs

The product features as an accessible tab set. Each tab shows its copy and a device visual (laptop, tablet and phone).

| Prop | Type | Default |
|---|---|---|
| `items` | Same shape as `features` | `features` from `data/copy.ts` |
| `limit` | `number` | All items |
| `variant` | `'list' \| 'pills'` | `'list'` (vertical tab list) |
| `tone` | `'white' \| 'muted' \| 'lilac'` | `'white'` |
| `eyebrow`, `headline`, `intro`, `id`, `embedded` | | Defaults provided |

Behaviour (`FeatureTabs.ts`): ARIA tabs pattern, with arrow keys, Home and End, and a sliding indicator behind the active tab.

Used on: home, product.

### FeatureList

A grid of icon tiles with short titles.

| Prop | Type | Default |
|---|---|---|
| `headline` | `string` | **required** |
| `items` | `{ icon, title, text? }[]` | |
| `include` | `number[]` | Indexes into `features`, used when `items` is not given |
| `columns` | `2 \| 3 \| 4` | `3` |
| `tiles` | `'blue-grey'` | Blue-grey cards with white icon tiles |
| `tone` | `'white' \| 'muted' \| 'dark' \| 'lilac'` | `'white'` |
| `eyebrow`, `intro` | | |

Used on: all three industry pages.

### HowItWorks

Numbered steps.

| Prop | Type | Default |
|---|---|---|
| `steps` | `{ icon, title, text }[]` | `howItWorks` from `data/copy.ts` |
| `layout` | `'row' \| 'side' \| 'timeline'` | `'row'` |
| `link` | `{ label, href }` | Button beside the heading (`side` layout only) |
| `tone` | `'white' \| 'muted' \| 'dark' \| 'lilac'` | `'white'` |
| `eyebrow`, `headline`, `intro`, `id`, `embedded` | | Defaults provided |

The `timeline` layout draws a connecting line that grows as each step is revealed.

Used on: home, product, all three industry pages.

### ImageBanner

A full-width photo card with the headline and text laid over it.

| Prop | Type | Default |
|---|---|---|
| `headline`, `text`, `photo`, `alt` | `string` | **required** |
| `align` | `'left' \| 'right'` | `'left'` (side the text sits on) |
| `accent` | `'wave' \| 'cyan' \| 'ruby'` | `'wave'` |
| `tone` | `'white' \| 'muted' \| 'lilac'` | `'white'` |
| `eyebrow` | `string` | |

Used on: all three industry pages.

### IllustrationCards

Solid colour cards, each with a title at the top and a line illustration filling the bottom. SVG illustrations are used as they are; PNG and JPG illustrations are resized and served as WebP.

| Prop | Type | Default |
|---|---|---|
| `headline` | `string` | **required** |
| `cards` | `{ illustration, title, text?, colour }[]` | **required**. `illustration` is a file name in `src/assets/illustrations/` without its extension |
| `tone` | `'white' \| 'muted' \| 'mint-bright'` | `'white'` |
| `dotted` | `boolean` | `false` |
| `eyebrow`, `intro` | | |

Used on: home, about.

### PillarStrip

The four product pillars as photo cards with a colour bar on top.

| Prop | Type | Default |
|---|---|---|
| `items` | `{ title, colour, photo, alt }[]` | **required** |

Used on: product.

### Testimonials

Quotes from the `testimonials` collection. Real quotes are listed before samples, and quotes for the given `audience` before the rest.

| Prop | Type | Default |
|---|---|---|
| `audience` | `'providers' \| 'corporates' \| 'partners'` | |
| `limit` | `number` | `3` |
| `only` | `string` | Show one quote by its file name (shown even when `published: false`) |
| `feature` | `boolean` | `false` (one large centred quote, without a card) |
| `highlight` | `string` | Part of the headline to colour |
| `tone` | `'dark' \| 'white' \| 'lilac' \| 'ruby-tint'` | `'dark'` |
| `dotted` | `boolean` | `false` |
| `eyebrow`, `headline` | | Defaults provided |

Used on: home, all three industry pages.

### BusinessCase

Columns of benefit points, each with an icon and a title.

| Prop | Type | Default |
|---|---|---|
| `headline` | `string` | **required** |
| `columns` | `{ icon, title, points: string[] }[]` | **required** |
| `tone` | `'white' \| 'muted'` | `'white'` |
| `eyebrow`, `intro` | | |

Used on: corporates.

### DeploymentOptions

The two deployment models (embedded and stand-alone), from `deploymentOptions` in `data/copy.ts`.

| Prop | Type | Default |
|---|---|---|
| `tone` | `'white' \| 'muted' \| 'ruby-tint'` | `'muted'` |
| `headline`, `intro`, `id`, `embedded` | | Defaults provided |

Used on: product, partners.

### TrustGrid

Security and compliance points, from `trust` in `data/copy.ts`.

| Prop | Type | Default |
|---|---|---|
| `limit` | `number` | All items |
| `tone` | `'white' \| 'muted' \| 'dark'` | `'dark'` |
| `headline`, `intro`, `id` | | Defaults provided |

Used on: product, partners.

### Roadmap

The life-stage journey ("while saving… and into retirement"), from `roadmap` in `data/copy.ts`.

| Prop | Type | Default |
|---|---|---|
| `headline`, `intro` | `string` | Defaults provided |

Used on: product.

### PeopleGrid

Leadership and advisory board as square tiles, from the `team` and/or `advisors` collections. Each collection is sorted by `order`; pass both to render them as one grid, in the order given.

| Prop | Type | Default |
|---|---|---|
| `collection` | `'team' \| 'advisors'`, or an array of both | **required** |
| `headline` | `string` | **required** |
| `columns` | `3 \| 4 \| 5` | `3` |

Used on: about.

### ContactForm

The demo-request form: name, email, organisation, role, size, message and consent, plus a hidden spam-trap field (`_gotcha`). It posts to `site.formEndpoint`. When no endpoint is set, a valid submission shows a "not connected" message instead of pretending to send. No props.

Behaviour (`ContactForm.ts`):

- validates on submit, never while the user is typing;
- shows an error summary that links to each field, plus an inline error under each field (wired up with `aria-describedby`);
- moves focus to the summary, or to the success message;
- sends the form with `fetch` and shows a success or failure state.

Used on: contact.

### ContactDetails

Contact email and LinkedIn link, from `data/site.ts`. No props.

Used on: contact.

### CTABand

The closing call to action with a product screen. `PageLayout` adds it to every page automatically; see [Architecture](architecture.md#layouts).

| Prop | Type | Default |
|---|---|---|
| `headline` | `string` | 'See myWaive in action' |
| `sub` | `string` | Default provided |
| `label`, `href` | `string` | Book a demo → `/contact` |
| `screen` | `string` | `'figma-dashboard'` |
| `tone` | `'page' \| 'lilac'` | `'page'` |

## UI

Small building blocks used by sections.

### Button

A link styled as a button when `href` is set, otherwise a `<button>`.

| Prop | Type | Default |
|---|---|---|
| `href` | `string` | |
| `variant` | `'primary' \| 'secondary' \| 'ghost' \| 'inverse'` | `'primary'` |
| `size` | `'md' \| 'lg'` | `'md'` |
| `icon` | `string` | Material Symbols name, shown after the label |
| `type` | `'button' \| 'submit'` | `'button'` |
| `class` | `string` | |

### Icon

A Google Material Symbols (Rounded) icon, inlined as SVG at build time. No icon font or third-party request is needed. The icon is sized in `em`, so `font-size` controls it.

| Prop | Type | Default | |
|---|---|---|---|
| `name` | `string` | **required** | Symbol name, e.g. `arrow_forward`. An unknown name fails the build |
| `fill` | `boolean` | `false` | Filled instead of outlined |
| `label` | `string` | | Accessible name. Without it, the icon is hidden from screen readers |
| `size` | `number` (px) | | |
| `class` | `string` | | |

Browse names at [fonts.google.com/icons](https://fonts.google.com/icons).

### SocialIcon

Brand marks for social links, which Material Symbols does not include. Decorative; the surrounding link carries the label.

| Prop | Type | Default |
|---|---|---|
| `name` | `'linkedin'` | **required** |
| `size` | `number` | `22` |

### Photo

A photography slot. It renders `src/assets/photos/<name>.{png,jpg,jpeg,webp}` as responsive WebP. If the file does not exist, it renders an `ImagePlaceholder` showing the `alt` text as a brief.

| Prop | Type | Default |
|---|---|---|
| `name` | `string` | **required** |
| `alt` | `string` | **required** (`''` for decorative images) |
| `ratio` | `string` | `'4 / 5'` |
| `widths` | `number[]` | `[480, 768, 1024, 1536]` |
| `eager` | `boolean` | `false` (lazy loading); set `true` for images above the fold |
| `tone`, `icon` | | Placeholder appearance |
| `class` | `string` | |

### ImagePlaceholder

A branded frame that marks where a photo will go and shows its brief.

| Prop | Type | Default |
|---|---|---|
| `alt` | `string` | **required** |
| `ratio` | `string` | `'4 / 5'` |
| `tone` | `'light' \| 'dark' \| 'brand'` | `'light'` |
| `icon` | `string` | `'person'` |
| `class` | `string` | |

### Avatar

A headshot from `src/assets/photos/people/`, or initials on a brand tint when no photo is given. A `photo` that does not exist fails the build. A source image narrower than twice the display size logs a warning.

| Prop | Type | Default |
|---|---|---|
| `name` | `string` | **required** |
| `photo` | `string` | File name, e.g. `joe-chapman.jpg` |
| `size` | `number` (px) | `96` |

### PhoneFrame

A phone device frame around a product screen from `src/assets/screens/` (390 × 844 at 2×).

| Prop | Type | Default |
|---|---|---|
| `screen` | `string` | **required** (file name without `.png`) |
| `alt` | `string` | **required** |
| `width` | `number` | `300` |
| `eager` | `boolean` | `false` |
| `class` | `string` | |

### BrowserFrame

A desktop browser frame around a product screen (1440 × 900 at 2×).

| Prop | Type | Default |
|---|---|---|
| `screen` | `string` | **required** |
| `alt` | `string` | **required** |
| `sizes` | `string` | `'(min-width: 1080px) 720px, 100vw'` |
| `eager` | `boolean` | `false` |
| `class` | `string` | |

### DeviceStack

A laptop, tablet and phone, each showing a product screen. Used by FeatureTabs.

| Prop | Type | Default |
|---|---|---|
| `phone` | `string` | **required** |
| `alt` | `string` | **required** |
| `laptop` | `string` | `'figma-dashboard'` |
| `tablet` | `string` | `'figma-fund-review'` |
| `eager` | `boolean` | `false` |

### FloatingCard

A small product-style card that floats over hero visuals. It is decorative. A number inside `value` or `note` counts up when the card comes into view.

| Prop | Type | Default |
|---|---|---|
| `icon`, `value` | `string` | **required** |
| `label`, `note` | `string` | |
| `progress` | `number` (0–100) | Shows a progress bar |
| `class` | `string` | |
