# Testing

The site has no unit tests, because there is almost no logic to unit-test. Quality is checked with a type check and two browser-based suites that run against the real pages.

| Check | Command | Runs against |
|---|---|---|
| Type check | `npm run check` | Source |
| Build | `npm run build` | Source |
| QA suite | `npm run qa` / `npm run qa:dist` | Dev server / production build |
| UI audit | `npm run ui-audit` | Production build |

Before every deployment, all four must pass with no errors and no findings.

## Type check

```sh
npm run check
```

Runs `astro check`. It type-checks every `.astro` and `.ts` file, including component props and the content collection schemas. It must report 0 errors and 0 warnings.

The build also validates content: Markdown that breaks its schema, a missing headshot, or an unknown icon name fails `npm run build` with a message naming the file.

## QA suite: `scripts/qa.mjs`

Visits every route at desktop (1440 × 900) and mobile (390 × 844) sizes, and checks:

| Check | Fails when |
|---|---|
| Content Security Policy | The page triggers a CSP violation or a JavaScript error under the real policy |
| Console | Any JavaScript error is logged |
| Layout | The page scrolls horizontally |
| Accessibility | axe-core finds a WCAG 2.0 A/AA or 2.1 AA violation |
| Mobile menu | The menu button is missing, or the menu does not open |
| Cookie banner | It is not shown on the first visit, does not hide on OK, or returns after a reload |
| Dropdown | "For Industries" does not open on hover, closes while the pointer moves onto it, or its links do not navigate |
| Tabs | Clicking a tab or using the arrow keys does not switch panels |

Full-page screenshots of every route are written to `qa-output/` for visual review.

### Running it

Against the dev server (quick, while working):

```sh
npx astro dev --background
npm run qa
```

Against the production build. This is the run that counts, because only `serve:dist` sends the real security headers:

```sh
npm run build
npm run serve:dist        # serves dist/ on http://localhost:4400 (leave it running)
npm run qa:dist           # in a second terminal
```

The script prints `QA: no problems found`, or one line per problem.

### Other browsers

```sh
BROWSER=webkit  npm run qa:dist   # Safari's engine
BROWSER=firefox npm run qa:dist
CHANNEL=chrome  npm run qa:dist   # an installed Chrome instead of Playwright's Chromium
```

Install the extra engines once with `npx playwright install firefox webkit`. Run all three engines before a release.

| Variable | Default | |
|---|---|---|
| `BASE` | `http://localhost:4321` | Site to test (`qa:dist` sets `http://localhost:4400`) |
| `OUT` | `/tmp/qa` | Screenshot folder (the npm scripts set `qa-output`) |
| `BROWSER` | `chromium` | `chromium`, `firefox` or `webkit` |
| `CHANNEL` | | `chrome` or `msedge` to use an installed browser |

## UI audit: `scripts/ui-audit.mjs`

Checks usability rules that axe-core does not cover. Run it against `serve:dist`:

```sh
npm run ui-audit
```

| Severity | Rule |
|---|---|
| High | Touch and click targets smaller than 24 × 24 px (WCAG 2.5.8; links inside sentences are exempt) |
| High | Images without `width` and `height` (layout shift) |
| High | Tab stops without a visible focus ring |
| High | The contact form's error summary is not focused, or does not link to the invalid fields |
| Medium | Buttons and primary CTAs shorter than 44 px |
| Medium | Raster images served without a `srcset` |
| Medium | Skipped heading levels (an `h4` straight after an `h2`) |
| Medium | Invalid form fields not marked with `aria-invalid` and linked error text |
| Low | Paragraphs wider than 90 characters |
| Low | Animations longer than 50 ms under `prefers-reduced-motion` |

The script prints `UI audit: no findings`, or one line per finding.

## Manual checks

Some things are only reliable by eye. Before a release:

- Look through the `qa-output/` screenshots of every page at both sizes.
- Tab through a page with the keyboard. Focus must always be visible, and the order must make sense.
- With reduced motion switched on in the OS, check that nothing slides or zooms.
- Disable JavaScript and confirm every page still shows all of its content.
- Submit the contact form empty, then with valid details, and check both outcomes.
- Test on a real phone, ideally one iPhone (Safari) and one Android (Chrome).

## Accessibility standard

The site targets **WCAG 2.1 AA** (`context/design_system/accessibility.md`). The UI audit also applies the WCAG 2.2 target-size rule. In practice:

- Colour pairs come from the design system's accessibility board (`context/design_system/accessibility.md`).
- Every interactive element is reachable and usable by keyboard, with a visible focus ring.
- Form errors are announced, summarised and linked to their fields.
- Images have meaningful `alt` text, or `alt=""` when decorative.
- The about-page video has captions.
- Motion respects `prefers-reduced-motion`.
