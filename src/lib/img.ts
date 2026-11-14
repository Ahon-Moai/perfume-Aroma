/** Smaller, faster product photos via /api/img.php (falls back to the original). */
export function thumb(src: string | undefined | null, w: 160 | 320 | 480 | 720 = 480): string {
  if (!src) return '';
  let path = src;
  try {
    if (/^https?:\/\//.test(src)) {
      const u = new URL(src);
      if (u.host !== window.location.host) return src;
      path = u.pathname;
    }
  } catch {
    return src;
  }
  if (!/^\/uploads\/[A-Za-z0-9_-]+\.(png|jpe?g|webp)$/i.test(path)) return src;
  return `/api/img.php?src=${encodeURIComponent(path)}&w=${w}`;
}
