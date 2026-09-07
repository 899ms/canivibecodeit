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
    title: 'can you vibecode ahrefs?',
    // Under 155 chars; the social description and the index card line.
    description:
      'I gave an AI agent six hours to rebuild Ahrefs from public data. It built all three tools in 45 minutes. Here is where every one of them hit the wall.',
    sponsor: { name: 'Ahrefs', url: 'https://ahrefs.com', logo: null },
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

export const studyEyebrow = (s) => `moat study no. ${s.number} · commissioned by ${s.sponsor.name}`;

/* The paid-partnership label, exact wording. Long form twice on the study
   page, short form on the index card. No colour: colour means verdict. */
export const paidLabel = (s) =>
  `paid partnership. ${s.sponsor.name} commissioned this study and got a fact-check pass. The verdicts and every word are ours.`;
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
