/* Data figures for studies: a small SVG bar chart driven by frontmatter.
   No library, no client script; colours come from the site's CSS variables
   so the same markup reads right in dark and light.

   Spec (frontmatter `charts[]`, placed in the body with a `[chart: <id>]`
   line, or passed to <StudyChart /> on a page):
     { id, title?, note?, unit?, max?, rows: [{ label, value, meta?, accent? }] }
   `value` is a number; `unit` is appended to the printed value ("%");
   `max` fixes the scale (default: the largest value); `meta` is a small
   secondary figure printed after the label (the "table-to-bars" case, e.g.
   "134 apps"); `accent: true` highlights a row.

   Layout (viewBox units = CSS px at 100% width): label column, bar track,
   value column. Rows are 22px bars on a 38px rhythm, like the page's own
   "which moats held" chart. */

const esc = (s) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

export function chartSvg(spec) {
  const rows = (spec.rows ?? []).filter((r) => r && r.label != null && Number.isFinite(Number(r.value)));
  if (rows.length === 0) return '';
  const unit = spec.unit ?? '';
  const max = Number(spec.max) > 0 ? Number(spec.max) : Math.max(...rows.map((r) => Number(r.value)), 1);
  const W = 760;
  const labelW = 190;
  const valueW = 64;
  const gap = 14;
  const trackW = W - labelW - valueW - gap * 2;
  const rowH = 38;
  const barH = 22;
  const H = rows.length * rowH;

  const fmt = (v) => `${Number(v).toLocaleString('en-US')}${unit}`;
  const body = rows
    .map((r, i) => {
      const y = i * rowH;
      const w = Math.max(2, Math.round((Number(r.value) / max) * trackW));
      const cls = r.accent ? ' accent' : '';
      const label = esc(r.label);
      const meta = r.meta != null ? `<tspan class="meta"> ${esc(r.meta)}</tspan>` : '';
      return (
        `<g class="row${cls}" transform="translate(0 ${y})">` +
        `<text class="label" x="${labelW}" y="${barH / 2}" text-anchor="end" dominant-baseline="central">${label}${meta}</text>` +
        `<rect class="track" x="${labelW + gap}" y="0" width="${trackW}" height="${barH}" />` +
        `<rect class="bar" x="${labelW + gap}" y="0" width="${w}" height="${barH}" />` +
        `<text class="value" x="${labelW + gap + trackW + gap}" y="${barH / 2}" dominant-baseline="central">${fmt(r.value)}</text>` +
        `</g>`
      );
    })
    .join('');

  const title = spec.title ? esc(spec.title) : '';
  const desc = rows.map((r) => `${r.label}: ${fmt(r.value)}`).join(', ');
  return (
    `<svg class="st-chart-svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img"` +
    ` aria-label="${title ? title + '. ' : ''}${esc(desc)}" xmlns="http://www.w3.org/2000/svg">` +
    `${title ? `<title>${title}</title>` : ''}${body}</svg>`
  );
}

/* Whole figure: title above, chart, optional note below. */
export function chartFigureHtml(spec) {
  const svg = chartSvg(spec);
  if (!svg) return '';
  return (
    `<figure class="study-chart" id="${esc(spec.id ? `chart-${spec.id}` : '')}">` +
    (spec.title ? `<figcaption class="study-chart-title">${esc(spec.title)}</figcaption>` : '') +
    `<div class="study-chart-scroll">${svg}</div>` +
    (spec.note ? `<p class="study-chart-note">${esc(spec.note)}</p>` : '') +
    `</figure>`
  );
}
