/* Studies: long-form, commissioned pieces (moat studies). The registry is the
   one list of studies; the prose for each lives in src/content/studies/
   <slug>.md (a content collection, see src/content.config.mjs), so a new
   study is one registry entry, one markdown file, its figures under
   public/studies/<key>/, and a flag flip.

   The whole section is gated by STUDIES_LIVE (flags.js): routes 404, the nav
   entry and the homepage callout do not render, the sitemap omits it, and
   flags-off output is byte-identical to a build without this file.

   Public-repo rule: the only commercial facts that belong here are the
   sponsor's name and URL. Nothing else about the arrangement, ever. */

export const STUDIES = [
  {
    slug: 'can-you-vibecode-ahrefs',
    number: 1,
    // Display casing follows the Paper mockup (sentence case); the <title>
    // and crumbs lowercase it.
    title: 'Can you vibecode Ahrefs?',
    // The death-list entry the study is about: its moat tags drive the
    // highlighted rows of the "which moats actually held" chart.
    subjectSlug: 'ahrefs',
    // No description here: the meta description and the index card line are
    // derived from the article's own standfirst at build time (studyDescription),
    // so the frozen article fixes them without touching the registry.
    // Logo: the official Ahrefs wordmark, reuse granted to the study;
    // source noted in logoSource. Shown once, next to the top paid label,
    // capped at 30px tall (the site's own mark is 30px).
    sponsor: {
      name: 'Ahrefs',
      url: 'https://ahrefs.com',
      logo: '/studies/ahrefs/ahrefs-logo.svg', // inverted (white) mark, dark theme
      logoLight: '/studies/ahrefs/ahrefs-logo-light.svg', // primary mark, light theme
      logoSource: 'https://ahrefs.com/logo (Primary logo: Ahrefs-Logo-Inverted-Transparent.svg and Ahrefs-Logo-Transparent-Trimmed.svg, unaltered)',
    },
    verdict: 'no',
    cloneAttempts: 1,
    // ISO date, set on publish day (drives the index card, JSON-LD and the
    // dateline). null = not published yet: the card says so instead of a date.
    publishedAt: null,
    ogImage: '/og/studies/can-you-vibecode-ahrefs.png',
    // Figures live here (public/studies/<assetDir>/…)
    assetDir: 'ahrefs',
  },
];

/* Launch-week homepage callout: shown while STUDIES_LIVE is on AND today is
   on or before this ISO date. Set on launch day to launch + 7; after that it
   disappears without a deploy. */
export const STUDIES_CALLOUT_UNTIL = '2026-09-30';

export function studiesCalloutActive(now = Date.now()) {
  return now <= Date.parse(`${STUDIES_CALLOUT_UNTIL}T23:59:59Z`);
}

export const studyBySlug = (slug) => STUDIES.find((s) => s.slug === slug) ?? null;

// Newest first; the featured one (homepage callout) is the newest.
export const studiesNewestFirst = () => [...STUDIES].sort((a, b) => b.number - a.number);
export const featuredStudy = () => studiesNewestFirst()[0] ?? null;


/* The OG card's bottom line. On the page itself the disclosure is the cover
   eyebrow ("moat study no. N · commissioned by <mark>") and the footer's
   plain "commissioned by" link; no separate label element. */
export const paidLabelShort = (s) => `paid partnership · commissioned by ${s.sponsor.name}`;

export const studyUrl = (s) => `https://canivibecodeit.com/studies/${s.slug}`;

export function studyDate(s) {
  if (!s.publishedAt) return null;
  return new Date(`${s.publishedAt}T00:00:00Z`).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

// "the weekend clone test" -> "The weekend clone test" (mockup casing).
export const sentenceCase = (s) => String(s).replace(/^\s*([a-z])/, (m) => m.toUpperCase());

/* Meta description and index-card line, derived from the article's
   standfirst: whole sentences while the total stays under 155 characters,
   at least the first sentence (cut at a word boundary if it alone is too
   long). Never a registry string, so the frozen article fixes it. */
export function studyDescription(standfirst, max = 155) {
  const sentences = String(standfirst ?? '').trim().match(/[^.!?]+[.!?]+(\s|$)/g) ?? [String(standfirst ?? '').trim()];
  let out = '';
  for (const sentence of sentences) {
    const next = out ? `${out} ${sentence.trim()}` : sentence.trim();
    if (next.length > max) break;
    out = next;
  }
  if (!out) {
    const first = sentences[0].trim();
    out = first.length <= max ? first : first.slice(0, max - 1).replace(/\s+\S*$/, '').trim() + '.';
  }
  return out;
}

/* Typographic quotes for frontmatter strings the page renders as text (the
   markdown body already gets them from the processor). An opening quote
   follows a start, whitespace or an opening bracket; everything else closes.
   Apostrophes become the closing single quote. */
export function curly(s) {
  return String(s ?? '')
    .replace(/(^|[\s([{])"/g, '$1\u201c')
    .replace(/"/g, '\u201d')
    .replace(/(^|[\s([{])'/g, '$1\u2018')
    .replace(/'/g, '\u2019');
}
