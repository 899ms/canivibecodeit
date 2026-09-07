/* Content collections. One so far: studies (src/content/studies/<slug>.md).
   The id of an entry is its filename, which must equal the registry slug in
   src/lib/studies.js. Frontmatter carries the structured blocks of the page
   (opener, figure block, the three cards, footer line); the body is the
   chapters, starting at "## 1." and ending with "## how this was scored". */
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const figure = z.object({
  src: z.string(),
  alt: z.string(),
  caption: z.string().optional(),
});

const studies = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/studies' }),
  schema: z.object({
    title: z.string(),
    // First paragraph of chapter 0: rendered under the h1 on the cover.
    standfirst: z.string(),
    verdict: z.enum(['yes', 'kinda', 'no']),
    // The two-sentence verdict, rendered in the verdict block.
    verdict_text: z.string(),
    // The rest of chapter 0 after the verdict (plain text), optional.
    opener: z.string().optional(),
    // Figure block under the chart: one wide figure, then a row of two.
    cover_figure: figure.optional(),
    row_figures: z.array(figure).max(2).optional(),
    // The three cards (eyebrow, heading, intro, then label/title/body each;
    // `accent: true` gives one card the primary border).
    cards: z
      .object({
        eyebrow: z.string().optional(),
        title: z.string(),
        intro: z.string().optional(),
        items: z
          .array(z.object({ label: z.string(), title: z.string(), body: z.string(), accent: z.boolean().optional() }))
          .min(1)
          .max(3),
      })
      .optional(),
    // The closing paragraph, rendered verbatim in the footer line.
    footer_line: z.string(),
    // One-line descriptions for the contents list, in chapter order (01..).
    // Omitted: the first sentence of each chapter is used.
    contents: z.array(z.string()).optional(),
    // ISO date of the last substantive edit; falls back to publishedAt.
    updated: z.string().optional(),
  }),
});

export const collections = { studies };
