import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { FragranceProduct } from '../types';
import { categoryOf, type BrandCategory } from '../lib/brandCategory';

interface BrandItem {
  name: string;
  slug: string;
  image?: string;
  count?: number;
}

interface TrustSectionProps {
  storeSettings?: any;
  products?: FragranceProduct[];
  onNavigateToCollection?: (slug: string) => void;
}

// Fallback curated brand visuals mapping
const BRAND_FALLBACK_IMAGES: Record<string, string> = {
  'arrina': '/src/assets/images/element_pure_portions_bottle_1791911761812.jpg',
  'arrina-atelier': '/src/assets/images/element_pure_portions_bottle_1791911761812.jpg',
  'swiss-arabian': '/src/assets/images/perfume_rose01_1791908158391.jpg',
  'french-avenue': '/src/assets/images/perfume_genesis_leo_1791908160379.jpg',
  'asdaaf': '/src/assets/images/perfume_asdaaf_raneen_1791908163183.jpg',
  'lattafa': '/src/assets/images/season_dark_forest_1791908203381.jpg',
  'armaf': '/src/assets/images/season_dune_red_sun_1791908201156.jpg',
  'creed': '/src/assets/images/studio_social_gold_flacon_1791908204833.jpg',
  'chanel': '/src/assets/images/article_perfume_roses_water_1791908274460.jpg',
  'dior': '/src/assets/images/season_sculptural_roses_1791908202058.jpg',
  'giorgio-armani': '/src/assets/images/studio_social_amber_spray_1791908204588.jpg',
  'dolce-gabbana': '/src/assets/images/element_vanilla_neroli_1791911761343.jpg',
};

const slugify = (text: string) =>
  text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');


// Designer / niche houses get an elegant serif; Arabian houses a wide, light sans.
const SERIF_HOUSES = new Set([
  'CHANEL', 'DIOR', 'GUCCI', 'PRADA', 'YVES SAINT LAURENT', 'VALENTINO', 'VERSACE', 'BURBERRY', 'KENZO',
  'GIORGIO ARMANI', 'CAROLINA HERRERA', 'DOLCE & GABBANA', 'CHLOÉ', 'CALVIN KLEIN', 'JEAN PAUL GAULTIER',
  'CREED', 'XERJOFF', 'MANCERA', 'NARCISO RODRIGUEZ', 'VIKTOR & ROLF', 'ELIZABETH ARDEN', 'KAYALI',
  'ARIANA GRANDE', 'ESSENTIAL PARFUMS', 'TOM FORD', 'HERMÈS', 'HERMES', 'PARFUMS DE MARLY', 'MAISON MARGIELA',
]);
const brandStyle = (name: string) => (SERIF_HOUSES.has(name.trim().toUpperCase()) ? 'is-serif' : 'is-sans');


const CATEGORY_ORDER: BrandCategory[] = ['Designer', 'Niche', 'Arabian'];
const CATEGORY_NOTE: Record<BrandCategory, string> = {
  Designer: 'Fashion-house icons',
  Niche: 'Artisan & rare',
  Arabian: 'Middle-Eastern craft',
};

export const TrustSection: React.FC<TrustSectionProps> = ({
  storeSettings,
  products = [],
  onNavigateToCollection
}) => {
  const [brandCat, setBrandCat] = useState<'All' | BrandCategory>('All');
  const feeDhaka = storeSettings?.shipping_fee_dhaka || '70';
  const feeOutside = storeSettings?.shipping_fee_outside_dhaka || '130';
  const freeThreshold = storeSettings?.free_shipping_threshold || '3000';

  // Derive dynamic brand items with images and perfume counts
  const brandsList: BrandItem[] = React.useMemo(() => {
    const brandMap = new Map<string, { count: number; image: string; name: string }>();

    products.forEach((p) => {
      if (!p.brand) return;
      const bName = p.brand.trim();
      const existing = brandMap.get(bName);
      if (existing) {
        existing.count += 1;
        if (!existing.image && p.image) {
          existing.image = p.image;
        }
      } else {
        brandMap.set(bName, {
          name: bName,
          count: 1,
          image: p.image || ''
        });
      }
    });

    // Curated catalog fallback brands if products list is minimal
    const defaults = [
      { name: 'SWISS ARABIAN', image: '/src/assets/images/perfume_rose01_1791908158391.jpg', count: 12 },
      { name: 'FRENCH AVENUE', image: '/src/assets/images/perfume_genesis_leo_1791908160379.jpg', count: 8 },
      { name: 'ARRINA ATELIER', image: '/src/assets/images/element_pure_portions_bottle_1791911761812.jpg', count: 6 },
      { name: 'ASDAAF', image: '/src/assets/images/perfume_asdaaf_raneen_1791908163183.jpg', count: 7 },
      { name: 'LATTAFA', image: '/src/assets/images/season_dark_forest_1791908203381.jpg', count: 14 },
      { name: 'ARMAF', image: '/src/assets/images/season_dune_red_sun_1791908201156.jpg', count: 9 },
    ];

    if (brandMap.size === 0) {
      return defaults.map((d) => ({
        name: d.name,
        slug: slugify(d.name),
        image: d.image,
        count: d.count
      }));
    }

    const result: BrandItem[] = [];
    brandMap.forEach((val, key) => {
      const slug = slugify(key);
      const img = val.image || BRAND_FALLBACK_IMAGES[slug] || '/src/assets/images/element_pure_portions_bottle_1791911761812.jpg';
      result.push({
        name: key,
        slug,
        image: img,
        count: val.count
      });
    });

    // Supplement with curated defaults if fewer than 5
    if (result.length < 5) {
      defaults.forEach((d) => {
        const slug = slugify(d.name);
        if (!result.some((r) => r.slug === slug)) {
          result.push({
            name: d.name,
            slug,
            image: d.image,
            count: d.count
          });
        }
      });
    }

    return result;
  }, [products]);

  const handleBrandClick = (slug: string) => {
    if (onNavigateToCollection) {
      onNavigateToCollection(slug);
    } else {
      window.location.href = `/collections/${slug}`;
    }
  };

  return (
    <section
      id="trust-section"
      className="w-full pt-12 pb-16 sm:pb-24 select-none"
      style={{
        backgroundColor: 'var(--theme-surface)',
        color: 'var(--theme-primary)',
      }}
    >
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section 2: Replaced Snapshot with SHOP BY BRANDS */}
        <div id="shop-by-brands" className="pt-4 sm:pt-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-2">
            <div>
              <span
                className="text-[11px] sm:text-xs tracking-[0.25em] uppercase font-bold"
                style={{ color: 'var(--theme-primary)' }}
              >
                THE HOUSES
              </span>
              <h3
                className="font-sans font-black text-2xl sm:text-3xl md:text-4xl uppercase tracking-tight mt-1"
                style={{ color: 'var(--theme-primary)' }}
              >
                Shop by brands
              </h3>
            </div>
            <p className="text-xs sm:text-sm font-semibold uppercase max-w-md opacity-80" style={{ color: 'var(--theme-primary)' }}>
              Select a fragrance house below to explore their dedicated collection and authentic decants.
            </p>
          </div>

          {/* Thick Solid Horizontal Divider */}
          <div
            className="w-full h-[3.5px] sm:h-[4.5px] md:h-[5px] mt-2 mb-8"
            style={{ backgroundColor: 'var(--theme-primary)' }}
          />

          {/* Category switch: All / Designer / Niche / Arabian */}
          <div className="pp-glass-group pp-brand-tabs mb-5" role="tablist" aria-label="Brand category">
            {(['All', ...CATEGORY_ORDER] as const).map((c) => (
              <button
                key={c}
                type="button"
                role="tab"
                aria-selected={brandCat === c}
                onClick={() => setBrandCat(c)}
                className={`pp-glass-pill${brandCat === c ? ' is-active' : ''}`}
              >
                <span className="pp-glass-pill__size">{c}</span>
              </button>
            ))}
          </div>

          {/* Brands grouped by category */}
          {CATEGORY_ORDER.filter((c) => brandCat === 'All' || brandCat === c).map((cat) => {
            const list = brandsList.filter((b) => categoryOf(b.name) === cat);
            if (!list.length) return null;
            return (
              <div key={cat} className="mb-7">
                <div className="flex items-baseline justify-between mb-2.5">
                  <span className="pp-brand-cat">{cat}</span>
                  <span className="pp-brand-cat-note">{CATEGORY_NOTE[cat]} · {list.length} houses</span>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2 sm:gap-3">
                  {list.map((brand) => (
                  <div
                    key={brand.slug}
                    onClick={() => handleBrandClick(brand.slug)}
                    className="group cursor-pointer flex flex-col transition-all duration-300"
                  >
                    <div className="pp-brand-tile">
                      <span className={`pp-brand-name ${brandStyle(brand.name)}`}>{brand.name}</span>
                      <span className="pp-brand-count">{brand.count}</span>
                    </div>
                  </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
