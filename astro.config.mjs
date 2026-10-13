// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://www.mywaive.io',
  trailingSlash: 'never',
  integrations: [sitemap()],
  // Emit every script as an external file so the strict CSP (script-src 'self', see vercel.json) covers it.
  vite: { build: { assetsInlineLimit: 0 } },
});
