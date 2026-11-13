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
}

export const Hero: React.FC<HeroProps> = ({
  onExploreClick,
  onNavigateToCollection,
  seasonsData,
}) => {
  return (
    <section
      className="w-full pt-1 sm:pt-2 pb-12 sm:pb-20 select-none"
      style={{
        backgroundColor: 'var(--theme-surface)',
        color: 'var(--theme-primary)',
      }}
    >
      <div className="w-full px-5 sm:px-8 md:px-12">
        {/* Massive Centered Pure Portions By Arrina Branding Header */}
        <div className="w-full overflow-hidden select-none py-2 sm:py-4">
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

        {/* Editorial Information Section */}
        {/* Desktop Layout (4 columns matching reference screenshot) */}
        <div
          className="hidden md:grid md:grid-cols-12 gap-8 text-[15px] lg:text-[16px] xl:text-[17px] font-semibold leading-[1.3] mb-12 lg:mb-16"
          style={{ color: 'var(--theme-primary)' }}
        >
          {/* Column 1: Brand & Links */}
          <div className="md:col-span-3 flex flex-col justify-between">
            <span className="tracking-tight uppercase font-bold text-base lg:text-lg">PURE PORTIONS</span>
            <div className="space-y-2 mt-8 lg:mt-12 text-sm lg:text-[15px] font-bold tracking-tight">
              <div>
                <a
                  href="#about"
                  className="hover:opacity-75 transition-opacity inline-block uppercase"
                >
                  VISIT ++ WEBSITE
                </a>
              </div>
              <div>
                <button
                  onClick={() => {
                    const el = document.getElementById('faq') || document.getElementById('trust-section');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="hover:opacity-75 transition-opacity uppercase text-left cursor-pointer"
                >
                  SHIPPING & RETURNS
                </button>
              </div>
            </div>
          </div>

          {/* Column 2: WHY */}
          <div className="md:col-span-4 pr-4">
            <span className="tracking-tight uppercase font-bold text-base lg:text-lg block mb-3">
              WHY
            </span>
            <p className="font-semibold text-sm lg:text-[15px] leading-snug">
              Authentic designer & niche fragrances, decanted fresh from original bottles — so you can try a scent for weeks before committing to a full bottle.
            </p>
          </div>

          {/* Column 3: WHERE */}
          <div className="md:col-span-4 pr-4">
            <span className="tracking-tight uppercase font-bold text-base lg:text-lg block mb-3">
              WHERE
            </span>
            <p className="font-semibold text-sm lg:text-[15px] leading-snug">
              Order online right here, or message us on WhatsApp, Facebook or Instagram. Cash on delivery, nationwide across Bangladesh.
            </p>
          </div>

          {/* Column 4: Year */}
          <div className="md:col-span-1 text-right font-bold text-sm lg:text-[15px]">
            <span>© 2026</span>
          </div>
        </div>

        {/* Mobile Layout (exact stack from mobile screenshot) */}
        <div
          className="md:hidden flex flex-col space-y-6 font-semibold mb-8 text-[13px] sm:text-[14px]"
          style={{ color: 'var(--theme-primary)' }}
        >
          {/* Row 1: Brand (left) & WHY + Description (right) */}
          <div className="grid grid-cols-12 gap-3 sm:gap-4">
            <div className="col-span-4 sm:col-span-3">
              <span className="tracking-tight uppercase font-bold text-sm sm:text-base">
                PURE PORTIONS
              </span>
            </div>
            <div className="col-span-8 sm:col-span-9 space-y-2">
              <span className="tracking-tight uppercase font-bold text-sm sm:text-base block">
                WHY
              </span>
              <p className="font-semibold leading-snug text-xs sm:text-sm">
                Authentic designer & niche fragrances, decanted fresh from original bottles — so you can try a scent for weeks before committing to a full bottle.
              </p>
            </div>
          </div>

          {/* Row 2: VISIT ++ WEBSITE (left) & © 2026 (right) */}
          <div className="flex items-center justify-between font-bold text-xs sm:text-sm pt-2">
            <a
              href="#about"
              className="hover:opacity-75 transition-opacity uppercase tracking-tight"
            >
              VISIT ++ WEBSITE
            </a>
            <span className="text-right">© 2026</span>
          </div>

          {/* Row 3: SHIPPING & RETURNS (left) */}
          <div className="font-bold text-xs sm:text-sm">
            <button
              onClick={() => {
                const el = document.getElementById('faq') || document.getElementById('trust-section');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="hover:opacity-75 transition-opacity uppercase text-left cursor-pointer tracking-tight"
            >
              SHIPPING & RETURNS
            </button>
          </div>
        </div>

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
