# Content

Where each piece of content lives, and how to change it. All content is read at build time, so run `npm run build` (or watch the dev server) to see a change.

| Content | Location |
|---|---|
| Page copy (headlines, section text) | The page file in `src/pages/`, passed to sections as props |
| Copy shared by several pages | `src/data/copy.ts` |
| Company details, navigation, contact addresses | `src/data/site.ts` |
| Legal documents | `src/content/legal/*.md` |
| Leadership team and advisory board | `src/content/team/*.md`, `src/content/advisors/*.md` |
| Testimonials | `src/content/testimonials/*.md` |
| Scene photography | `src/assets/photos/` |
| Headshots | `src/assets/photos/people/` |
| Product screens | `src/assets/screens/` |
| Illustrations | `src/assets/illustrations/` |
| Logos, favicon, video, Open Graph image | `public/` |

## Page copy

Each page in `src/pages/` passes its copy to the sections it uses. To change a headline on the corporates page, edit `src/pages/for-industries/corporates.astro`:

```astro
<HeroDark
  headline="Personalised advice for every member"
  sub="Targeted support only goes so far…"
  photo="providers-family"
/>
```

Sections that leave out a copy prop show their default text. The defaults are in each component's frontmatter.

## Shared copy: `src/data/copy.ts`

Copy blocks used on more than one page live here, so they only need editing once:

| Export | Used by |
|---|---|
| `features` | FeatureTabs, FeatureList: the product features, each with its icon, screen and floating card |
| `deploymentOptions` | DeploymentOptions: embedded and stand-alone |
| `trust` | TrustGrid: security and compliance points |
| `roadmap` | Roadmap: the life-stage journey |
| `howItWorks` | HowItWorks: the default four steps |
| `onboarding` | HowItWorks on the industry pages: scoping to go-live |

## Site settings: `src/data/site.ts`

| Export | Contents |
|---|---|
| `site` | Name, company, domain, tagline, default meta description, contact addresses (`hello`, `privacy`), company numbers, registered office, regulatory statement, social profiles, contact form endpoint |
| `industries` | The three audiences: their labels, URLs, descriptions and icons. Used by the header dropdown, the footer and AudienceCards |
| `nav` | Main navigation |
| `legalPages` | Footer legal links |
| `cta` | The default call to action |

The regulatory statement appears in the footer of every page. Any change to it needs compliance sign-off.

## Content collections

The collections are defined, with their schemas, in `src/content.config.ts`. Each Markdown file is one entry, and its file name (without `.md`) is the entry's id. If the frontmatter breaks the schema, the build fails with a message naming the file and the field.

### Legal documents

`src/content/legal/<slug>.md` is published at `/legal/<slug>`.

```md
---
title: Privacy Policy
summary: How Waive collects, uses, shares and protects personal data.
lastUpdated: 2026-09-23
status: final
---

## Who we are

Body text in Markdown…
```

| Field | Type | |
|---|---|---|
| `title` | string | Page heading and `<title>` |
| `summary` | string | Meta description |
| `lastUpdated` | date (`YYYY-MM-DD`) | Shown under the title |
| `status` | `placeholder` \| `draft` \| `final` | Defaults to `draft`. Anything other than `final` shows a notice on the page |

`##` headings build the "On this page" contents list. Use `###` for sub-sections. Tables, lists, links and bold text are all styled.

To add a legal page, create the Markdown file, then add it to `legalPages` in `site.ts` so it shows in the footer.

### Team and advisors

`src/content/team/<id>.md` and `src/content/advisors/<id>.md` use the same schema:

```md
---
name: Joe Chapman
role: CTO
order: 3
photo: joe-chapman.jpg
linkedin: https://www.linkedin.com/in/josephphilipchapman
---
Short biography.
```

| Field | Type | |
|---|---|---|
| `name` | string | Required |
| `role` | string | Required |
| `order` | number | Required. Lower numbers come first |
| `photo` | string | File name in `src/assets/photos/people/`. Without it, the person's initials are shown |
| `linkedin` | URL | Adds a LinkedIn link to the tile |

The Markdown body holds the biography. The current PeopleGrid layout does not display it.

**Headshots** must exist (a missing file fails the build) and should be square, at least 800 × 800 px. They are shown at up to 400px, at 2× for sharp screens, and anything smaller logs a warning at build time. Use real photographs supplied by the person.

### Testimonials

`src/content/testimonials/<id>.md`:

```md
---
quote: "myWaive found three old pots and explained why in plain English."
attribution: Scheme member, 41
organisation: Pilot user
audience: general
order: 5
published: true
sample: false
---
```

| Field | Type | Default | |
|---|---|---|---|
| `quote` | string | | Required |
| `attribution` | string | | Required: the person's role or description |
| `organisation` | string | | Required |
| `audience` | `providers` \| `corporates` \| `partners` \| `general` | `general` | Pages prefer quotes for their audience |
| `order` | number | `99` | Lower numbers come first |
| `published` | boolean | `true` | `false` hides the quote from lists. A page can still show it by id with `only` |
| `sample` | boolean | `false` | Marks an illustrative quote. Samples always come after real quotes |

Replace each sample with a real, approved quote and set `sample: false` before launch.

## Images

### Scene photography

`<Photo name="home-hero" alt="…" />` renders `src/assets/photos/home-hero.{jpg,png,webp}`. To add or replace a photo, drop a file with that name into `src/assets/photos/`; there's no code to change. Supply photos at least 1536px wide. The build creates the smaller WebP sizes. When a named photo is missing, the page shows a placeholder with the `alt` text as a brief, so gaps are easy to spot.

`npm run images` can generate the seven scene photos (`home-hero`, `providers-hero`, `corporates-hero`, `partners-hero`, `about-team`, `about-why`, `corporates-impact`) with the Atlas Cloud image API. The script reads `ATLASCLOUD_API_KEY` from the environment; it does not load `.env`, so pass the key on the command line:

```sh
export ATLASCLOUD_API_KEY=…                     # or prefix each command with it
npm run images                                  # generate any missing photos
npm run images -- --only home-hero,about-team   # only these photos
npm run images -- --force                       # overwrite existing PNGs
npm run images -- --model <model-id>            # use another model
```

The script writes `<slug>.png` and skips any slug whose PNG already exists. The photos currently on the site are JPGs, so a generated PNG would sit beside the JPG with the same name. Keep only one file per name.

Never generate images of real people: team and advisor headshots must be genuine photographs.

### Product screens

Phone, tablet and desktop frames show PNGs from `src/assets/screens/`:

- Phone screens: 390 × 844 at 2×.
- Desktop screens: 1440 × 900 at 2×.
- Files starting with `figma-` are exported from the product designs.
- The rest (`dashboard`, `modeller`, `advice`, `consolidation`, `education`, `investments`, `reviews`, `desktop-*`) are drawn as HTML in `scripts/screens/render.mjs`.

Re-render them, and the Open Graph image `public/og-default.png`, with:

```sh
node scripts/screens/render.mjs
```

To change what a rendered screen shows, edit its HTML in `render.mjs` (shared chrome is in `scripts/screens/template.mjs`) and run the script again.

### Illustrations

The IllustrationCards line art lives in `src/assets/illustrations/` and is referenced by file name without the extension. Prefer SVG. PNG and JPG files are resized and served as WebP.

### Files in `public/`

These are copied to the site root as they are, with no processing or hashing:

- `logo/`: logo variants and the app icon.
- `favicon.svg`.
- `og-default.png`: the social sharing image.
- `media/`: the about-page video, its poster and its English captions (`.vtt`). Keep the captions in step with the video.
- `js/flag.js`: see [Architecture](architecture.md#progressive-enhancement).
- `robots.txt`.

## Icons

Icons are [Material Symbols Rounded](https://fonts.google.com/icons), referenced by name:

```astro
<Icon name="verified_user" />
<Icon name="check_circle" fill />
```

Every icon in the set is available, with no download step. A misspelt name fails the build with `Icon "…" not found`. Data in `copy.ts` and `site.ts` stores icon names as plain strings, e.g. `icon: 'savings'`.

## Writing guidelines

- Use UK English throughout (organisation, personalised, programme).
- Describe the product as **regulated advice delivered through FCA-authorised partner firms**. Waive Ltd and myWaive Ltd are not themselves authorised. Wording about regulation, performance or outcomes needs compliance review.
- Keep headlines short. Most sections are designed for headlines of about one line on desktop.
- Every meaningful image needs `alt` text that describes it. Decorative images take `alt=""`.
