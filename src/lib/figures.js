/* Figure pair geometry. A pair shows two screenshots side by side (stacked
   on phones) at ONE shared height with no empty space: both halves get the
   aspect ratio of the WIDER image, and the taller image is cropped at the
   bottom (object-fit: cover, anchored top). The ratio is read from the
   files under public/ once and cached; unknown files fall back to 8:5. */
import path from 'node:path';
import sharp from 'sharp';

const FALLBACK = 8 / 5;
const cache = new Map();

async function ratioOf(src) {
  if (!src || !src.startsWith('/')) return null;
  if (cache.has(src)) return cache.get(src);
  let ratio = null;
  try {
    const { width, height } = await sharp(path.resolve('public', src.slice(1))).metadata();
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
