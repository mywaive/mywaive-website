# Development

How to set up the project, the conventions the code follows, and step-by-step recipes for common changes.

## Setup

Requirements:

- Node.js 22.12 or later (`node -v`).
- npm.
- Optional, for the QA suite in other browsers: `npx playwright install firefox webkit`.

```sh
npm install
cp .env.example .env
npx astro dev --background
```

The dev server runs at `http://localhost:4321` and reloads on save. Manage it with:

```sh
npx astro dev status
npx astro dev logs
npx astro dev stop
```

In VS Code, install the recommended **Astro** extension (`astro-build.astro-vscode`). It provides syntax highlighting, type checking and autocompletion in `.astro` files.

## Everyday workflow

1. Run the dev server and make the change.
2. Check the page at desktop and phone widths, down to 320px.
3. Run `npm run check`.
4. Before committing anything that changes layout or behaviour, run the production QA suite (see [Testing](testing.md)).

## Conventions

### Files and folders

- **One component, one folder:** `src/components/<group>/Name/Name.astro`, with `Name.css` for styles and `Name.ts` for browser behaviour when needed. Name the files after the component, in PascalCase.
- **Choose the group by role:** `global/` for site chrome, `sections/` for full-width page bands, `ui/` for small reusable pieces. A component only uses components from its own group or the groups below it.
- **Pages contain markup only.** Copy and structure go in the page file. Styles go in `src/styles/pages/<page>.css`. Behaviour goes in a component.
- **Shared copy goes in `src/data/`.** Structured, repeatable content (people, quotes, legal text) goes in a content collection.

### Astro components

- Start the frontmatter with a short `/** … */` comment that says what the component is for.
- Declare a `Props` interface and destructure it with defaults:

  ```astro
  ---
  /** Numbered steps, in a row, beside the heading, or as a timeline. */
  import Icon from '@/components/ui/Icon/Icon.astro';
  interface Props { headline?: string; tone?: 'white' | 'muted'; layout?: 'row' | 'timeline' }
  const { headline = 'How it works', tone = 'white', layout = 'row' } = Astro.props;
  ---
  ```

- Use the `@/` alias for imports. Never use `../../` paths.
- Give sections a `tone` prop for their background, and default copy props so that a page can drop the section in with no props.
- Load styles and scripts at the end of the markup:

  ```astro
  <style>@import './Name.css';</style>
  <script>import './Name.ts';</script>
  ```

### CSS

- Use [design tokens](styling.md#design-tokens) for colour, spacing, type, radius and motion. Avoid raw values.
- Use the global classes (`section`, `container`, `grid grid-3`, `card`, `eyebrow`, `bg-*`) before writing new CSS.
- Write mobile-first, with the standard [breakpoints](styling.md#responsive-design).
- Use `:global()` for elements rendered by child components or created by scripts (see [Component styles](styling.md#component-styles)).
- Put motion under `prefers-reduced-motion: no-preference`.

### TypeScript and browser scripts

- TypeScript is in strict mode. `npm run check` must stay at 0 errors.
- Scripts are plain DOM code with no framework. Find elements by `data-*` attributes rather than classes, so styling changes cannot break behaviour.
- A component's script runs once per page, however many times the component appears. Handle every instance with `querySelectorAll`, or guard with `if (el)` when there is only one.
- **No inline scripts and no third-party scripts.** The Content Security Policy blocks them in production. Put code in a `.ts` file and load it with `<script>import …</script>`. Never use `is:inline` with code in it, `on*=""` attributes or `javascript:` URLs.
- **Enhance, don't depend.** The page must be complete without JavaScript. Hide content only under `html.js`.

### Accessibility

- Use semantic elements: `button` for actions, `a` for navigation, real headings in order, `ul role="list"` for lists styled without bullets.
- Every interactive element must work with the keyboard and show a visible focus ring.
- Interactive patterns follow the WAI-ARIA Authoring Practices. The tabs and the dropdown are the existing examples.
- Give meaningful images `alt` text, and decorative ones `alt=""`. An `Icon` without a `label` is hidden from screen readers.

## Recipes

### Add a page

1. Create `src/pages/<route>.astro`. The file path becomes the URL.
2. Wrap the content in `PageLayout`, with a title and description:

   ```astro
   ---
   import PageLayout from '@/layouts/PageLayout.astro';
   import HeroDark from '@/components/sections/HeroDark/HeroDark.astro';
   import HowItWorks from '@/components/sections/HowItWorks/HowItWorks.astro';
   ---
   <PageLayout title="Advisers" description="One sentence for search results, under 160 characters.">
     <HeroDark headline="Regulated advice at scale" photo="advisers-hero" image="An adviser with a client" />
     <HowItWorks tone="muted" />
   </PageLayout>
   ```

3. Link to the page from `nav` or `industries` in `src/data/site.ts` if it belongs in the menu.
4. Add the route to `pages` in `scripts/qa.mjs` and `PAGES` in `scripts/ui-audit.mjs` so that it is tested.

### Add a section component

1. Create `src/components/sections/MySection/` with `MySection.astro` and `MySection.css`.
2. Build it from the global classes:

   ```astro
   ---
   /** One-line description of the section. */
   interface Props { headline: string; tone?: 'white' | 'muted' }
   const { headline, tone = 'white' } = Astro.props;
   ---
   <section class:list={['section', `bg-${tone}`]}>
     <div class="container">
       <div class="section-header" data-reveal>
         <h2 class="h3">{headline}</h2>
       </div>
       <div class="my-section-body">…</div>
     </div>
   </section>
   <style>@import './MySection.css';</style>
   ```

3. Put component-specific rules in `MySection.css`. They are scoped automatically.
4. Add the component to [components.md](components.md).

### Add browser behaviour to a component

1. Mark the elements with data attributes, e.g. `<div data-accordion>`.
2. Create `Name.ts` beside the component:

   ```ts
   document.querySelectorAll<HTMLElement>('[data-accordion]').forEach((root) => {
     // wire up events here
   });
   ```

3. Load it from the component with `<script>import './Name.ts';</script>`.
4. Check that the component still makes sense with JavaScript disabled.
5. Add an interaction check to `scripts/qa.mjs` if the behaviour matters.

### Add an entrance animation or pointer effect

Add an attribute instead of writing JavaScript:

```astro
<li class="card" data-reveal data-spotlight="light" data-tilt>…</li>
```

See the [list of attributes](architecture.md#browser-scripts).

### Change navigation or footer links

Edit `src/data/site.ts`: `nav` for the header, `industries` for the dropdown and footer, `legalPages` for the footer's legal links.

### Add a photo, headshot, quote or legal page

See [Content](content.md).

### Add an icon

Use `<Icon name="…" />` with any [Material Symbols](https://fonts.google.com/icons) name, in snake case (e.g. `arrow_forward`). There's nothing to install.
