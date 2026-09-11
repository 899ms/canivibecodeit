/* rehype transforms for study markdown (registered in astro.config.mjs).
   Five jobs, no dependencies:
   1. HTML comments never reach the built page: editorial notes in the
      article stay in the source file only (both `comment` nodes and the
      `raw` nodes markdown produces for inline HTML).
   2. A paragraph that holds only images becomes a <figure>: images get
      lazy loading, the first image's title becomes the <figcaption>, and
      two images in one paragraph make a side-by-side pair, each at its own
      aspect ratio, top-aligned (stacked on phones, or everywhere when both
      halves are very wide strips).
   3. Every <table> is wrapped in <div class="table-wrap"> so wide tables
      scroll sideways instead of breaking the page on phones.
   4. Links to the sponsor's domains get rel="sponsored noopener" and open in
      a new tab. Everything else keeps the site's normal outbound policy.
   5. Chapter headings ("## 3. where the moat isn't") are split into a
      number and a sentence-cased title so the page can set them like the
      mockup's contents rows; other h2s are sentence-cased in place.
   6. Every figure image is wrapped in a link to its full-size file (the
      @2x variant when one exists), which the page's lightbox script turns
      into an overlay; without JS it is just the image.
   7. A paragraph reading `[chart: <id>]` becomes the SVG bar chart declared
      under `charts` in the frontmatter (lib/study-chart.mjs).
   8. A paragraph reading `[pull: <sentence>]` becomes a pull line: the
      sentence set large between two hairlines; `[pull: <sentence> | <eyebrow>]`
      adds a small mono eyebrow above it. */

import { imageRatios, stackPair, zoomSrc } from './figures.js';
import { chartFigureHtml } from './study-chart.mjs';
import { curly } from './studies.js';

const SPONSORED_HOSTS = ['ahrefs.com'];

const isBlank = (n) => n.type === 'text' && !n.value.trim();
const el = (tagName, properties, children) => ({ type: 'element', tagName, properties, children });
const text = (value) => ({ type: 'text', value });

export const sentenceCase = (s) => s.replace(/^\s*([a-z])/, (m) => m.toUpperCase());

function sponsoredHost(href) {
  try {
    const host = new URL(href).hostname.replace(/^www\./, '');
    return SPONSORED_HOSTS.some((h) => host === h || host.endsWith(`.${h}`));
  } catch {
    return false;
  }
}

/* Drop comment nodes; strip comment markup out of raw HTML nodes and drop
   the node when nothing but whitespace is left. Returns null to remove. */
function withoutComments(node) {
  if (node.type === 'comment') return null;
  if (node.type === 'raw' && node.value.includes('<!--')) {
    const rest = node.value.replace(/<!--[\s\S]*?-->/g, '');
    if (!rest.trim()) return null;
    return { ...node, value: rest };
  }
  return node;
}

/* Pairs are collected here; once the walk is done the very wide ones (both
   halves at least 2.5:1) get the `stack` class and sit full width. */
const pairs = [];

function zoomLink(img, caption) {
  return el(
    'a',
    {
      className: ['fig-zoom'],
      href: zoomSrc(img.properties?.src),
      target: '_blank',
      rel: ['noopener'],
      dataZoom: '',
      ...(caption ? { dataCaption: caption } : {}),
    },
    [img]
  );
}

function toFigure(p) {
  const imgs = p.children.filter((c) => !isBlank(c));
  const caption = imgs[0].properties?.title;
  for (const img of imgs) {
    img.properties = { ...img.properties, loading: 'lazy', decoding: 'async' };
    delete img.properties.title;
  }
  const links = imgs.map((img) => zoomLink(img, caption ? String(caption) : ''));
  const pairEl = imgs.length > 1 ? el('div', { className: ['fig-pair'] }, links) : null;
  if (pairEl) pairs.push({ imgs, pairEl });
  const children = pairEl ? [pairEl] : links;
  if (caption) children.push(el('figcaption', {}, [text(String(caption))]));
  return el('figure', { className: ['study-fig', ...(imgs.length > 1 ? ['pair'] : [])] }, children);
}

/* `[chart: id]` on its own line -> the frontmatter chart with that id. */
const CHART_RE = /^\[chart:\s*([a-z0-9-]+)\s*\]$/i;
function chartFor(p, charts) {
  const kids = p.children.filter((c) => !isBlank(c));
  if (kids.length !== 1 || kids[0].type !== 'text') return null;
  const m = kids[0].value.trim().match(CHART_RE);
  if (!m) return null;
  const spec = (charts ?? []).find((c) => c.id === m[1]);
  const html = spec ? chartFigureHtml(spec) : '';
  return html ? { type: 'raw', value: html } : { type: 'text', value: '' };
}

/* `[pull: sentence]` or `[pull: sentence | eyebrow]` on its own line -> a
   pull line (one sentence set large, hairlines above and below). */
const PULL_RE = /^\[pull:\s*([\s\S]+?)\s*\]$/i;
function pullFor(p) {
  const kids = p.children.filter((c) => !isBlank(c));
  if (kids.length !== 1 || kids[0].type !== 'text') return null;
  const m = kids[0].value.trim().match(PULL_RE);
  if (!m) return null;
  const [sentence, eyebrow] = m[1].split('|').map((t) => t.trim());
  if (!sentence) return null;
  const children = [];
  if (eyebrow) children.push(el('p', { className: ['pull-eyebrow'] }, [text(curly(eyebrow))]));
  children.push(el('p', { className: ['pull-line'] }, [text(curly(sentence))]));
  return el('aside', { className: ['study-pull'] }, children);
}

/* Only plain-text headings are restructured; anything with inline markup
   is left alone (the casing rule still applies to its first text node). */
function chapterHeading(h2) {
  const plain = h2.children.length === 1 && h2.children[0].type === 'text' ? h2.children[0].value : null;
  if (plain == null) {
    const first = h2.children.find((c) => c.type === 'text');
    if (first) first.value = sentenceCase(first.value);
    return;
  }
  const m = plain.match(/^(\d+)\.\s+(.*)$/);
  if (!m) {
    h2.children = [text(sentenceCase(plain))];
    return;
  }
  h2.properties = { ...h2.properties, className: ['ch'] };
  h2.children = [
    el('span', { className: ['ch-num'] }, [text(m[1].padStart(2, '0'))]),
    el('span', { className: ['ch-title'] }, [text(sentenceCase(m[2]))]),
  ];
}

function transform(node, charts) {
  if (!node.children) return;
  node.children = node.children.map(withoutComments).filter(Boolean);
  // A paragraph that held only a comment is now empty: drop it too.
  node.children = node.children.filter(
    (c) => !(c.type === 'element' && c.tagName === 'p' && c.children.every((k) => isBlank(k) || withoutComments(k) === null))
  );
  node.children = node.children.map((child) => {
    if (child.type !== 'element') return child;
    if (child.tagName === 'p') {
      const kids = child.children.map(withoutComments).filter(Boolean).filter((c) => !isBlank(c));
      if (kids.length > 0 && kids.every((c) => c.type === 'element' && c.tagName === 'img')) {
        child.children = kids;
        return toFigure(child);
      }
      const chart = chartFor(child, charts);
      if (chart) return chart;
      const pull = pullFor(child);
      if (pull) return pull;
    }
    if (child.tagName === 'table') {
      transform(child, charts);
      return el('div', { className: ['table-wrap'] }, [child]);
    }
    if (child.tagName === 'a' && sponsoredHost(child.properties?.href)) {
      child.properties = { ...child.properties, rel: ['sponsored', 'noopener'], target: '_blank' };
    }
    if (child.tagName === 'h2') chapterHeading(child);
    transform(child, charts);
    return child;
  });
}

export default function rehypeStudy() {
  return async (tree, file) => {
    pairs.length = 0;
    // Astro exposes the entry's frontmatter on the vfile.
    const charts = file?.data?.astro?.frontmatter?.charts;
    transform(tree, charts);
    for (const { imgs, pairEl } of pairs) {
      const ratios = await imageRatios(imgs.map((i) => i.properties?.src));
      if (stackPair(ratios)) pairEl.properties.className.push('stack');
    }
  };
}
