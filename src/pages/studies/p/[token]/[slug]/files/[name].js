/* The preview twin of /studies/<slug>/files/<name>: the same attachments,
   the same allowlist, gated by the preview token instead of STUDIES_LIVE so
   the methods note's links work inside a preview. */
import { studyFileResponse } from '../../../../../../lib/study-files.js';
import { PREVIEW_HEADERS, previewTokenValid } from '../../../../../../lib/study-preview.js';

export async function GET({ params }) {
  if (!previewTokenValid(params.token)) return new Response(null, { status: 404 });
  return studyFileResponse(params.slug, params.name, PREVIEW_HEADERS);
}
