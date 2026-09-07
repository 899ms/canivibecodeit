/* Content collections. One so far: studies (src/content/studies/<slug>.md).
   The id of an entry is its filename, which must equal the registry slug in
   src/lib/studies.js. Frontmatter carries the structured bits of the opener
   (standfirst, verdict, footer line); the body is the chapters, starting at
   "## 1." and ending with "## how this was scored". */
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const studies = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/studies' }),
  schema: z.object({
    title: z.string(),
    // First paragraph of chapter 0: rendered under the h1 on the cover.
    standfirst: z.string(),
    verdict: z.enum(['yes', 'kinda', 'no']),
    // The two-sentence verdict, rendered in the verdict box.
    verdict_text: z.string(),
    // The rest of chapter 0 after the verdict (plain text), optional.
    opener: z.string().optional(),
    // The closing paragraph, rendered verbatim above the paid-partnership
    // label and the sponsor mark.
    footer_line: z.string(),
    // One-line descriptions for the contents list, in chapter order (01..).
    // Omitted: the first sentence of each chapter is used.
    contents: z.array(z.string()).optional(),
    // ISO date of the last substantive edit; falls back to publishedAt.
    updated: z.string().optional(),
  }),
});

export const collections = { studies };
