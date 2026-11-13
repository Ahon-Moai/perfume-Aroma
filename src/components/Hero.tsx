import React from 'react';
import { FragranceProduct, SeasonsGalleryData } from '../types';
import { SeasonsGallery } from './SeasonsGallery';

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
                <strong>1.5ml testers</strong>
                <span className="pp-announce__price"> · try any scent{testerFrom > 0 ? ` from ৳${testerFrom}` : ''}</span>
              </span>
              <span className="pp-announce__arrow" aria-hidden="true">→</span>
            </button>
          </div>
        )}

        {/* Massive Centered Pure Portions By Arrina Branding Header */}
        <div className="w-full overflow-x-clip select-none py-2 sm:py-4">
          <h1 className="w-full text-center select-none flex flex-col items-center justify-center py-2 sm:py-4" aria-label="Pure Portions by Arrina">
            <span
              className="pp-wordmark pp-silver-text whitespace-nowrap text-[19vw] sm:text-[15vw] md:text-[12.5vw] lg:text-[11vw]"
              data-text="Pure Portions"
            >
              Pure Portions
            </span>
            <span className="pp-sub flex items-center justify-center gap-3 sm:gap-5 -mt-[1.5vw] whitespace-nowrap text-[5vw] sm:text-[3.6vw] md:text-[2.8vw] lg:text-[2.4vw]">
              <span className="inline-block h-px w-[7vw] sm:w-[5vw] bg-current opacity-70" aria-hidden="true" />
              <span className="pp-silver-text">By Arrina</span>
              <span className="inline-block h-px w-[7vw] sm:w-[5vw] bg-current opacity-70" aria-hidden="true" />
            </span>
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
