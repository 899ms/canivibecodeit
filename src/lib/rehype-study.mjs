/* rehype transforms for study markdown (registered in astro.config.mjs).
   Four jobs, no dependencies:
   1. A paragraph that holds only images becomes a <figure>: images get
      lazy loading, the first image's title becomes the <figcaption>, and
      two images in one paragraph make a side-by-side pair (stacked on
      phones by CSS).
   2. Every <table> is wrapped in <div class="table-wrap"> so wide tables
      scroll sideways instead of breaking the page on phones.
   3. Links to the sponsor's domains get rel="sponsored noopener" and open in
      a new tab. Everything else keeps the site's normal outbound policy.
   4. Chapter headings ("## 3. where the moat isn't") are split into a
      number and a sentence-cased title so the page can set them like the
      mockup's contents rows; other h2s are sentence-cased in place. */

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

function toFigure(p) {
  const imgs = p.children.filter((c) => !isBlank(c));
  const caption = imgs[0].properties?.title;
  for (const img of imgs) {
    img.properties = { ...img.properties, loading: 'lazy', decoding: 'async' };
    delete img.properties.title;
  }
  const children = imgs.length > 1 ? [el('div', { className: ['fig-pair'] }, imgs)] : imgs;
  if (caption) children.push(el('figcaption', {}, [text(String(caption))]));
  return el('figure', { className: ['study-fig', ...(imgs.length > 1 ? ['pair'] : [])] }, children);
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

function transform(node) {
  if (!node.children) return;
  node.children = node.children.map((child) => {
    if (child.type !== 'element') return child;
    if (child.tagName === 'p') {
      const kids = child.children.filter((c) => !isBlank(c));
      if (kids.length > 0 && kids.every((c) => c.type === 'element' && c.tagName === 'img')) {
        return toFigure(child);
      }
    }
    if (child.tagName === 'table') {
      transform(child);
      return el('div', { className: ['table-wrap'] }, [child]);
    }
    if (child.tagName === 'a' && sponsoredHost(child.properties?.href)) {
      child.properties = { ...child.properties, rel: ['sponsored', 'noopener'], target: '_blank' };
    }
    if (child.tagName === 'h2') chapterHeading(child);
    transform(child);
    return child;
  });
}

export default function rehypeStudy() {
  return (tree) => transform(tree);
}
