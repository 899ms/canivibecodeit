/* Figure geometry and sources.

   Pairs: two screenshots side by side (stacked on phones) at ONE shared
   height with no empty space: both halves get the aspect ratio of the WIDER
   image, and the taller image is cropped at the bottom (object-fit: cover,
   anchored top). The ratio is read from the files under public/ once and
   cached; unknown files fall back to 8:5.

   Zoom: every figure links to its full-size file. Figures are dropped at
   1280 wide as <name>.webp; when the source was wider, a 2x variant sits
   next to it as <name>@2x.webp and the link (and so the overlay) uses it. */
import { existsSync } from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const FALLBACK = 8 / 5;
const cache = new Map();

const publicPath = (src) => path.resolve('public', src.replace(/^\//, ''));

async function ratioOf(src) {
  if (!src || !src.startsWith('/')) return null;
  if (cache.has(src)) return cache.get(src);
  let ratio = null;
  try {
    const { width, height } = await sharp(publicPath(src)).metadata();
    if (width && height) ratio = width / height;
  } catch {
    ratio = null;
  }
  cache.set(src, ratio);
  return ratio;
}

/* CSS aspect-ratio value for a pair: the widest of the given sources. */
export async function pairRatio(srcs) {
  const ratios = (await Promise.all(srcs.map(ratioOf))).filter((r) => r && Number.isFinite(r));
  const r = ratios.length ? Math.max(...ratios) : FALLBACK;
  return `${Math.round(r * 1000)} / 1000`;
}

/* The full-size source for a figure: the @2x file when it exists, else the
   figure itself. Only site-relative paths are considered. */
export function zoomSrc(src) {
  if (!src || !src.startsWith('/')) return src;
  const twoX = src.replace(/(\.[a-z0-9]+)$/i, '@2x$1');
  return twoX !== src && existsSync(publicPath(twoX)) ? twoX : src;
}
