/* Private preview of a study: /studies/p/<token>/<slug>.

   A commissioned study has to be read and signed off by the sponsor before
   it is published, on the real domain, while STUDIES_LIVE is still off. The
   preview routes therefore ignore the flag and gate on a shared secret in
   the environment instead: STUDY_PREVIEW_TOKEN. Unset or empty = the whole
   preview surface is off, exactly like the flag being off.

   The token is an environment value and only ever that. Nothing in this repo
   holds it, refers to a value of it, or logs it; the routes it opens are
   never linked, never in the nav and never in the sitemap, and every preview
   response is served noindex and uncacheable. */
import { createHash, timingSafeEqual } from 'node:crypto';

/* Compare digests, not the strings: equal-length buffers for timingSafeEqual
   and the token's length stays out of the comparison entirely. */
const digest = (value) => createHash('sha256').update(String(value), 'utf8').digest();

export function previewTokenValid(token) {
  const expected = process.env.STUDY_PREVIEW_TOKEN ?? '';
  if (!expected || !token) return false;
  return timingSafeEqual(digest(token), digest(expected));
}

/* The study's URL prefix under a preview, for the attachment links. */
export const previewBase = (token, slug) => `/studies/p/${encodeURIComponent(token)}/${slug}`;

/* Out of every index, out of every cache: a preview URL that leaks is one
   thing, a preview URL a crawler or a shared proxy keeps is another. */
export const PREVIEW_HEADERS = {
  'X-Robots-Tag': 'noindex, nofollow',
  'Cache-Control': 'private, no-store',
};

export function setPreviewHeaders(headers) {
  for (const [name, value] of Object.entries(PREVIEW_HEADERS)) headers.set(name, value);
}
