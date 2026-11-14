import React, { useRef } from 'react';
import { FragranceProduct, SeasonsGalleryData } from '../types';
import { SeasonsGallery } from './SeasonsGallery';
import { LeafSprig, AtomizerFlourish } from './BrandOrnaments';

interface HeroProps {
  products?: FragranceProduct[];
  onSelectProduct?: (product: FragranceProduct) => void;
  onExploreClick?: () => void;
  onOrderProduct?: () => void;
  onNavigateToCollection?: (slug: string) => void;
  heroData?: any;
  seasonsData?: SeasonsGalleryData;
  onOpenTesters?: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  products = [],
  onExploreClick,
  onNavigateToCollection,
  seasonsData,
  onOpenTesters,
}) => {
  // 1.5ml tester announcement: how many perfumes come as testers, and the lowest tester price
  const testerPrices: number[] = [];
  for (const p of products) {
    const t = (p.sizes || []).find((s) => /^1\.5\s*ml/i.test(String(s.size).trim()));
    if (t) testerPrices.push(Number(t.price) || 0);
  }
  const testerCount = testerPrices.length;

  // Touch/hover the wordmark: the light band follows the finger and the glow brightens
  const markRef = useRef<HTMLSpanElement>(null);
  const subRef = useRef<HTMLSpanElement>(null);
  const followLight = (clientX: number) => {
    const el = markRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const fx = Math.min(Math.max(clientX - r.left, 0), r.width);
    // gradient is 300% wide with its highlight in the middle → keep the highlight under the finger
    const p = (0.75 - fx / (2 * r.width)) * 100;
    el.classList.remove('is-releasing');
    el.classList.add('is-touching');
    el.style.backgroundPosition = `${p}% 0`;
    const sub = subRef.current;
    if (sub) { sub.classList.add('is-touching'); sub.style.backgroundPosition = `${p}% 0`; }
  };
  const releaseLight = () => {
    const el = markRef.current;
    if (!el) return;
    el.classList.add('is-releasing');
    el.classList.remove('is-touching');
    el.style.backgroundPosition = '';
    if (subRef.current) { subRef.current.classList.remove('is-touching'); subRef.current.style.backgroundPosition = ''; }
  };
  const testerFrom = testerCount ? Math.min(...testerPrices.filter((n) => n > 0)) : 0;

  return (
    <section
      className="w-full pt-1 sm:pt-2 pb-12 sm:pb-20 select-none"
      style={{
        backgroundColor: 'var(--theme-surface)',
        color: 'var(--theme-primary)',
      }}
    >
      <div className="w-full px-5 sm:px-8 md:px-12">
        {/* Announcement: 1.5ml testers */}
        {onOpenTesters && (
          <div className="flex justify-center pt-3 sm:pt-5 pb-2 sm:pb-3">
            <button type="button" onClick={onOpenTesters} className="pp-announce" aria-label="See all 1.5ml testers">
              <span className="pp-announce__tag">New</span>
              <span className="pp-announce__text">
                Wear it before you own it <span className="pp-announce__dot">·</span> <strong>1.5ml testers</strong>
              </span>
              <span className="pp-announce__arrow" aria-hidden="true">→</span>
            </button>
          </div>
        )}

        {/* Massive Centered Pure Portions By Arrina Branding Header */}
        <div className="w-full overflow-x-clip select-none py-2 sm:py-4">
          <h1 className="w-full text-center select-none flex flex-col items-center justify-center py-2 sm:py-4" aria-label="Pure Portions by Arrina">
            <span className="relative inline-block px-[7vw] sm:px-[6vw]">
              <LeafSprig idSuffix="l" className="pp-sprig absolute left-0 top-1/2 -translate-y-[46%] h-[26vw] sm:h-[20vw] md:h-[16vw] lg:h-[13.5vw] w-auto -z-0" />
              <LeafSprig idSuffix="r" flip className="pp-sprig absolute right-0 top-1/2 -translate-y-[46%] h-[26vw] sm:h-[20vw] md:h-[16vw] lg:h-[13.5vw] w-auto -z-0" />
              <span
                ref={markRef}
                className="pp-wordmark pp-write pp-silver-text whitespace-nowrap text-[16.5vw] sm:text-[13vw] md:text-[11vw] lg:text-[9.5vw]"
                data-text="Pure Portions"
                onPointerDown={(e) => followLight(e.clientX)}
                onPointerMove={(e) => followLight(e.clientX)}
                onPointerUp={releaseLight}
                onPointerLeave={releaseLight}
                onPointerCancel={releaseLight}
                onTouchMove={(e) => e.touches[0] && followLight(e.touches[0].clientX)}
                onTouchEnd={releaseLight}
              >
                Pure Portions
              </span>
            </span>
            <span className="pp-sub pp-after-write flex items-center justify-center gap-3 sm:gap-5 -mt-[1.5vw] whitespace-nowrap text-[5vw] sm:text-[3.6vw] md:text-[2.8vw] lg:text-[2.4vw]">
              <span className="inline-block h-px w-[7vw] sm:w-[5vw] bg-current opacity-70" aria-hidden="true" />
              <span ref={subRef} className="pp-silver-text">By Arrina</span>
              <span className="inline-block h-px w-[7vw] sm:w-[5vw] bg-current opacity-70" aria-hidden="true" />
            </span>
            <AtomizerFlourish className="pp-flourish w-[62vw] max-w-[420px] h-auto mt-1 sm:mt-2" />
          </h1>
        </div>

        {/* Thick Solid Horizontal Divider */}
        <div
          className="w-full h-px mt-4 sm:mt-6 mb-6 sm:mb-8"
          style={{ backgroundImage: 'linear-gradient(90deg, transparent, #b8bbc3 20%, #e4e6ea 50%, #b8bbc3 80%, transparent)' }}
        />

        {/* One calm line instead of the old editorial block */}
        <p className="text-center text-[13px] sm:text-sm font-light leading-relaxed tracking-wide mx-auto max-w-md mb-8 sm:mb-12 opacity-70" style={{ color: 'var(--theme-text-secondary)' }}>
          Authentic designer &amp; niche fragrances, decanted fresh from the original bottle.
        </p>

        {/* Seasonal Boxes Grid - Reusing Seasons Component without Header */}
        <div className="w-full pt-1">
          <SeasonsGallery
            seasonsData={seasonsData}
            onExploreClick={onExploreClick}
            onNavigateToCollection={onNavigateToCollection}
            hideHeader={true}
          />
        </div>
      </div>
    </section>
  );
};
