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
    ` aria-label="${esc(spec.alt ?? `${title ? title + '. ' : ''}${desc}`)}" xmlns="http://www.w3.org/2000/svg">` +
    `${title ? `<title>${title}</title>` : ''}${body}</svg>`
  );
}

/* Column chart ("what one person pays a month"): a few columns on a shared
   y axis. Per column: `bar` (one filled or outlined column to `value`; a
   value of 0 draws a flat baseline tick the width of a bar so it reads as
   zero, never as missing), `marks` (horizontal marks at `value`, outlined
   unless `accent`, or `above: true` for a no-height marker sitting on top
   of the column's bar). `prefix` goes before axis numbers ("$"); `max` and
   `step` set the axis.

     { id, type: 'columns', title?, note?, prefix?, max, step?,
       columns: [{ label, bar?: { value, label?, accent? },
                   marks?: [{ value, label?, accent?, above? }] }] } */
export function columnsSvg(spec) {
  const cols = (spec.columns ?? []).filter((c) => c && c.label != null);
  if (cols.length === 0) return '';
  const prefix = spec.prefix ?? '';
  const max = Number(spec.max) > 0 ? Number(spec.max) : 100;
  const step = Number(spec.step) > 0 ? Number(spec.step) : max / 5;
  const W = 760;
  const gutter = 64;
  const top = 28;
  const plotH = 300;
  const bottom = 56;
  const H = top + plotH + bottom;
  const slot = (W - gutter) / cols.length;
  const barW = Math.min(112, slot * 0.42);
  const y = (v) => top + plotH - (Math.min(Number(v), max) / max) * plotH;
  const fmtAxis = (v) => `${prefix}${Number(v).toLocaleString('en-US')}`;

  let axis = '';
  for (let v = 0; v <= max + 1e-9; v += step) {
    axis +=
      `<line class="col-grid" x1="${gutter}" x2="${W}" y1="${y(v)}" y2="${y(v)}" />` +
      `<text class="col-tick" x="${gutter - 10}" y="${y(v)}" text-anchor="end" dominant-baseline="central">${fmtAxis(v)}</text>`;
  }
  axis += `<line class="col-base" x1="${gutter}" x2="${W}" y1="${y(0)}" y2="${y(0)}" />`;

  const body = cols
    .map((c, i) => {
      const cx = gutter + slot * i + slot / 2;
      const x0 = cx - barW / 2;
      let out = `<g class="col">`;
      if (c.bar) {
        const v = Number(c.bar.value) || 0;
        const cls = c.bar.accent ? ' accent' : '';
        const barH = y(0) - y(v);
        // a marker perched on the bar takes the space above it, so the bar's
        // own label moves inside the bar when the bar is tall enough
        const hasAbove = (c.marks ?? []).some((m) => m.above);
        const inside = hasAbove && barH >= 30;
        if (v <= 0) {
          out += `<line class="col-zero${cls}" x1="${x0}" x2="${x0 + barW}" y1="${y(0)}" y2="${y(0)}" />`;
        } else {
          out += `<rect class="col-bar${cls}" x="${x0}" y="${y(v)}" width="${barW}" height="${barH}" />`;
        }
        if (c.bar.label != null) {
          out += `<text class="col-label${cls}${inside ? ' inside' : ''}" x="${cx}" y="${inside ? y(v) + 19 : y(v) - 8}" text-anchor="middle">${esc(c.bar.label)}</text>`;
        }
      }
      for (const m of c.marks ?? []) {
        const v = Number(m.value) || 0;
        const cls = m.accent ? ' accent' : '';
        if (m.above) {
          // a marker with no height, perched on the bar: an outlined box
          out += `<rect class="col-marker" x="${x0}" y="${y(v) - 14}" width="${barW}" height="10" />`;
          if (m.label != null) out += `<text class="col-label" x="${cx}" y="${y(v) - 22}" text-anchor="middle">${esc(m.label)}</text>`;
          continue;
        }
        out += `<line class="col-mark${cls}" x1="${x0}" x2="${x0 + barW}" y1="${y(v)}" y2="${y(v)}" />`;
        if (m.label != null) {
          out += `<text class="col-label${cls}" x="${x0 + barW + 10}" y="${y(v)}" dominant-baseline="central">${esc(m.label)}</text>`;
        }
      }
      out += `<text class="col-name" x="${cx}" y="${top + plotH + 26}" text-anchor="middle">${esc(c.label)}</text>`;
      return out + `</g>`;
    })
    .join('');

  const title = spec.title ? esc(spec.title) : '';
  const summary = cols
    .map((c) => {
      const parts = [];
      if (c.bar) parts.push(c.bar.label ?? fmtAxis(c.bar.value));
      for (const m of c.marks ?? []) parts.push(m.label ?? fmtAxis(m.value));
      return `${c.label}: ${parts.join(', ')}`;
    })
    .join('; ');
  return (
    `<svg class="st-chart-svg st-chart-columns" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img"` +
    ` aria-label="${esc(spec.alt ?? `${title ? title + '. ' : ''}${summary}`)}" xmlns="http://www.w3.org/2000/svg">` +
    `${title ? `<title>${title}</title>` : ''}${axis}${body}</svg>`
  );
}

/* Whole figure: title above, chart, optional note below. */
export function chartFigureHtml(spec) {
  const svg = spec.type === 'columns' ? columnsSvg(spec) : chartSvg(spec);
  if (!svg) return '';
  return (
    `<figure class="study-chart" id="${esc(spec.id ? `chart-${spec.id}` : '')}">` +
    (spec.title ? `<figcaption class="study-chart-title">${esc(spec.title)}</figcaption>` : '') +
    `<div class="study-chart-scroll">${svg}</div>` +
    (spec.note ? `<p class="study-chart-note">${esc(spec.note)}</p>` : '') +
    `</figure>`
  );
}
