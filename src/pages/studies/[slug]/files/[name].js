/* Per-study attachments, served as plain text from the study's own asset
   folder (lib/study-files.js): /studies/<slug>/files/<name>, linked from the
   article's methods note. Gated by STUDIES_LIVE like the pages. */
import { studiesLive } from '../../../../lib/flags.js';
import { studyFileResponse } from '../../../../lib/study-files.js';

export async function GET({ params }) {
  if (!studiesLive()) return new Response(null, { status: 404 });
  return studyFileResponse(params.slug, params.name);
}
