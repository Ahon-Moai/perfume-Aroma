/**
 * Site-wide smooth motion (inspired by outfit.hellohello.is):
 *  - Lenis smooth scrolling on desktop wheel/trackpad (phones keep native touch scrolling)
 *  - Product cards rise into place with a staggered expo ease-out when they enter the screen
 *  - Cards inside horizontal swipe rows slide in from the side instead
 *  - Section headings fade up softly
 * Everything is skipped for visitors who ask their device for reduced motion.
 */
import Lenis from 'lenis';

const CARD_SELECTOR = 'main .group:has(img)';
const HEADING_SELECTOR = 'main h2';

let lenis: Lenis | null = null;
let io: IntersectionObserver | null = null;
let mo: MutationObserver | null = null;

const reducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function initSmoothScroll() {
  if (lenis || reducedMotion()) return;
  lenis = new Lenis({
    lerp: 0.1,
    smoothWheel: true,
    syncTouch: false, // phones: keep the natural touch scroll feel
    allowNestedScroll: true, // cart drawer, search, menus keep their own scrolling
  });
  const raf = (time: number) => {
    lenis?.raf(time);
    requestAnimationFrame(raf);
  };
  requestAnimationFrame(raf);
}

function inHorizontalScroller(el: Element): boolean {
  let p = el.parentElement;
  for (let i = 0; i < 6 && p && p.tagName !== 'MAIN'; i++) {
    const ox = getComputedStyle(p).overflowX;
    if ((ox === 'auto' || ox === 'scroll') && p.scrollWidth > p.clientWidth + 4) return true;
    p = p.parentElement;
  }
  return false;
}

function prepare(el: HTMLElement, kind: 'card' | 'heading') {
  if (el.dataset.ppMotion) return;
  el.dataset.ppMotion = '1';
  const r = el.getBoundingClientRect();
  // Already scrolled past (e.g. user jumped down) → just show it
  if (r.bottom < 0) return;
  const mobile = window.innerWidth < 768;
  if (kind === 'card' && inHorizontalScroller(el)) {
    el.style.setProperty('--pp-x', mobile ? '70px' : '120px');
    el.style.setProperty('--pp-y', '0px');
  } else if (kind === 'card') {
    el.style.setProperty('--pp-y', mobile ? '110px' : '220px');
  } else {
    el.style.setProperty('--pp-y', mobile ? '28px' : '40px');
  }
  el.classList.add('pp-rv');
  io?.observe(el);
}

function scan(root: ParentNode = document) {
  if (window.location.hash === '#admin' || window.location.pathname.startsWith('/admin')) return;
  try {
    root.querySelectorAll<HTMLElement>(CARD_SELECTOR).forEach((el) => prepare(el, 'card'));
    root.querySelectorAll<HTMLElement>(HEADING_SELECTOR).forEach((el) => prepare(el, 'heading'));
  } catch {
    // very old browsers without :has() — leave everything static
  }
}

let enabled = false;

/** Call on page load: hides cards/headings that will animate (under the intro overlay). */
export function prepareReveal() {
  if (enabled || reducedMotion() || !('IntersectionObserver' in window)) return;
  enabled = true;
  scan();

  // Products load from the server and pages change without reloading → watch for new cards
  let queued = false;
  mo = new MutationObserver(() => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      scan();
    });
  });
  mo.observe(document.body, { childList: true, subtree: true });
}

/** Call once the intro has finished: starts animating whatever is on screen, then the rest on scroll. */
export function startReveal() {
  if (!enabled || io) return;

  io = new IntersectionObserver(
    (entries) => {
      const entering = entries
        .filter((e) => e.isIntersecting)
        .map((e) => e.target as HTMLElement)
        .sort((a, b) => {
          const ra = a.getBoundingClientRect();
          const rb = b.getBoundingClientRect();
          return ra.top - rb.top || ra.left - rb.left;
        });
      entering.forEach((el, i) => {
        io?.unobserve(el);
        const delay = Math.min(i, 6) * 80;
        el.style.setProperty('--pp-d', `${delay}ms`);
        requestAnimationFrame(() => el.classList.add('pp-in'));
        // Hand the element back to its normal hover/transition styles afterwards
        window.setTimeout(() => {
          el.classList.remove('pp-rv', 'pp-in');
          el.style.removeProperty('--pp-d');
        }, 1300 + delay);
      });
    },
    { rootMargin: '0px 0px -6% 0px', threshold: 0.05 }
  );

  document.querySelectorAll<HTMLElement>('.pp-rv').forEach((el) => io!.observe(el));
}
