/* Content collections. One so far: studies (src/content/studies/<slug>.md).
   The id of an entry is its filename, which must equal the registry slug in
   src/lib/studies.js. Frontmatter carries the structured blocks of the page
   (opener, figure block, the three cards, footer line); the body is the
   chapters, starting at "## 1." and ending with "## how this was scored". */
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const image = z.object({ src: z.string(), alt: z.string() });

/* A figure slot: one image, or a pair (the second image under `pair`, shown
   side by side on wide screens and stacked on phones), plus one caption. */
const figure = image.extend({
  caption: z.string().optional(),
  pair: image.optional(),
});

const studies = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/studies' }),
  schema: z.object({
    title: z.string(),
    // First paragraph of chapter 0: the cover standfirst. The meta and card
    // descriptions are derived from it at build time (lib/studies.js).
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
    // `accent: true` gives one card the primary border). Only what is here
    // renders; no cards in the file means no cards block on the page.
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
    // Data figures: SVG bar charts placed in the body with a `[chart: <id>]`
    // line (lib/study-chart.mjs). value is a number; unit is printed after
    // it; meta is a small secondary figure after the label.
    // `type: columns` draws columns on a shared y axis instead (prefix, max,
    // step, columns with a bar and/or marks); `alt` overrides the aria text.
    charts: z
      .array(
        z.object({
          id: z.string().regex(/^[a-z0-9-]+$/),
          type: z.enum(['bars', 'columns']).optional(),
          title: z.string().optional(),
          note: z.string().optional(),
          alt: z.string().optional(),
          unit: z.string().optional(),
          prefix: z.string().optional(),
          max: z.number().optional(),
          step: z.number().optional(),
          rows: z
            .array(z.object({ label: z.string(), value: z.number(), meta: z.string().optional(), accent: z.boolean().optional() }))
            .optional(),
          columns: z
            .array(
              z.object({
                label: z.string(),
                bar: z.object({ value: z.number(), label: z.string().optional(), accent: z.boolean().optional() }).optional(),
                marks: z
                  .array(z.object({ value: z.number(), label: z.string().optional(), accent: z.boolean().optional(), above: z.boolean().optional() }))
                  .optional(),
              })
            )
            .optional(),
        })
      )
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
