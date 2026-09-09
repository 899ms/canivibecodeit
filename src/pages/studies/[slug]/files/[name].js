/* Per-study attachments, served as plain text: the clone's report and log
   that the methods note promises "published alongside, unedited". Files
   are dropped under public/studies/<assetDir>/ by the writer (sanitised:
   no hostnames, paths or secrets) and linked from the article as
   /studies/<slug>/files/<name>. The name is an allowlist pattern, the
   directory comes from the registry, so no request can reach outside the
   study's own asset folder. Gated by STUDIES_LIVE like the pages. */
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { studiesLive } from '../../../../lib/flags.js';
import { studyBySlug } from '../../../../lib/studies.js';

const NAME = /^[a-z0-9][a-z0-9-]{0,60}\.(md|txt)$/;

export async function GET({ params }) {
  if (!studiesLive()) return new Response(null, { status: 404 });
  const study = studyBySlug(params.slug);
  const name = String(params.name ?? '');
  if (!study || !NAME.test(name)) return new Response(null, { status: 404 });
  try {
    const body = await readFile(path.resolve('public/studies', study.assetDir, name));
    return new Response(body, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'public, max-age=3600',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch {
    return new Response(null, { status: 404 });
  }
}
