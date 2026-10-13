import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

const legal = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/legal' }),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    lastUpdated: z.coerce.date(),
    status: z.enum(['placeholder', 'draft', 'final']).default('draft'),
  }),
});

const people = z.object({
  name: z.string(),
  role: z.string(),
  order: z.number(),
  photo: z.string().optional(),
  linkedin: z.string().url().optional(),
});

const team = defineCollection({ loader: glob({ pattern: '*.md', base: './src/content/team' }), schema: people });
const advisors = defineCollection({ loader: glob({ pattern: '*.md', base: './src/content/advisors' }), schema: people });

const testimonials = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/testimonials' }),
  schema: z.object({
    quote: z.string(),
    attribution: z.string(),
    organisation: z.string(),
    audience: z.enum(['providers', 'corporates', 'partners', 'general']).default('general'),
    order: z.number().default(99),
    published: z.boolean().default(true),
    /** Illustrative quote written for the prototype — shown with a visible badge until replaced by a real one. */
    sample: z.boolean().default(false),
  }),
});

export const collections = { legal, team, advisors, testimonials };
