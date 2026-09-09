/* Figure geometry and sources.

   Pairs: two screenshots side by side (stacked on phones), each at its own
   natural aspect ratio, scaled to equal width and top-aligned; heights may
   differ and nothing is cropped or boxed. The only geometry read from the
   files (once, cached) decides whether a pair of very wide strips should
   stack full width instead (stackPair).

   Zoom: every figure links to its full-size file. Figures are dropped at
   1280 wide as <name>.webp; when the source was wider, a 2x variant sits
   next to it as <name>@2x.webp and the link (and so the overlay) uses it. */
import { existsSync } from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

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

/* Natural width/height ratio per source (null when unknown). */
export async function imageRatios(srcs) {
  return Promise.all(srcs.map(ratioOf));
}

/* A pair of very wide strips (both at least 2.5:1, e.g. the Brand Radar
   header rows) is unreadable at half width, so it stacks full width instead
   of sitting side by side. */
export const WIDE = 2.5;
export const stackPair = (ratios) => ratios.length > 0 && ratios.every((r) => r && r >= WIDE);

/* The full-size source for a figure: the @2x file when it exists, else the
   figure itself. Only site-relative paths are considered. */
export function zoomSrc(src) {
  if (!src || !src.startsWith('/')) return src;
  const twoX = src.replace(/(\.[a-z0-9]+)$/i, '@2x$1');
  return twoX !== src && existsSync(publicPath(twoX)) ? twoX : src;
}
