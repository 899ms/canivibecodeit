/* A study's attachments: the clone report and log the methods note promises
   "published alongside, unedited". The writer drops them under
   public/studies/<assetDir>/ (sanitised: no hostnames, paths or secrets) and
   the article links them under the study's own base.

   Both the public route and the token-gated preview twin serve them through
   here, so one allowlist governs both: the name must match NAME and the
   directory comes from the registry, which leaves no request a way out of the
   study's own asset folder. */
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { studyBySlug } from './studies.js';

const NAME = /^[a-z0-9][a-z0-9-]{0,60}\.(md|txt)$/;

/* Rewrites the article's attachment links onto `base`, the URL prefix the
   study is being served from. The public base is a no-op; the preview base
   keeps the links inside the preview. */
export function rebaseStudyFiles(html, slug, base) {
  const live = `/studies/${slug}/files/`;
  if (!base || base === `/studies/${slug}`) return html;
  return String(html).split(live).join(`${base}/files/`);
}

export async function studyFileResponse(slug, name, headers = {}) {
  const study = studyBySlug(slug);
  const file = String(name ?? '');
  if (!study || !NAME.test(file)) return new Response(null, { status: 404 });
  try {
    const body = await readFile(path.resolve('public/studies', study.assetDir, file));
    return new Response(body, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'public, max-age=3600',
        'X-Content-Type-Options': 'nosniff',
        ...headers,
      },
    });
  } catch {
    return new Response(null, { status: 404 });
  }
}
