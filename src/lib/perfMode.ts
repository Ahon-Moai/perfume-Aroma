/**
 * Keeps the site smooth on every phone:
 * 1. Weaker phones get "lite" mode (no live blur, calmer effects) — looks almost the same.
 * 2. Endless animations only run while their section is on screen.
 * Strong phones and computers keep the full design.
 */
export function initPerfMode() {
  const root = document.documentElement;
  const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
  const mem = nav.deviceMemory;
  const cores = nav.hardwareConcurrency || 8;
  const saveData = !!nav.connection?.saveData;
  const forced = new URLSearchParams(location.search).get('lite');
  const lite = forced === '1' || (forced !== '0' && ((mem !== undefined && mem <= 3) || cores <= 4 || saveData));
  if (lite) root.classList.add('pp-lite');

  if (!('IntersectionObserver' in window)) return;
  const io = new IntersectionObserver(
    (entries) => entries.forEach((e) => e.target.classList.toggle('pp-offscreen', !e.isIntersecting)),
    { rootMargin: '120px 0px' },
  );
  const watched = new WeakSet<Element>();
  const scan = () => {
    document.querySelectorAll('.pp-sotw, .pp-niche, .pp-hero-anim, section').forEach((el) => {
      if (!watched.has(el)) { watched.add(el); io.observe(el); }
    });
  };
  scan();
  new MutationObserver(() => scan()).observe(document.body, { childList: true, subtree: true });
}
