import React from 'react';
import { ShieldCheck, ArrowRight } from 'lucide-react';
import { FragranceProduct } from '../types';

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

export const TrustSection: React.FC<TrustSectionProps> = ({
  storeSettings,
  products = [],
  onNavigateToCollection
}) => {
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
                ++ THE ATELIER HOUSES
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

          {/* Perfume Brands Image Boxes Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6">
            {brandsList.map((brand) => (
              <div
                key={brand.slug}
                onClick={() => handleBrandClick(brand.slug)}
                className="group cursor-pointer border-2 p-3 sm:p-4 flex flex-col justify-between transition-all duration-300 shadow-sm hover:opacity-90"
                style={{
                  backgroundColor: 'var(--theme-surface-card)',
                  borderColor: 'var(--theme-border)',
                }}
              >
                {/* Brand Perfume Image Box */}
                <div
                  className="relative w-full aspect-square border overflow-hidden flex items-center justify-center p-3 mb-3"
                  style={{
                    backgroundColor: 'var(--theme-surface)',
                    borderColor: 'var(--theme-border-subtle)',
                  }}
                >
                  <img
                    src={brand.image}
                    alt={brand.name}
                    className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div
                    className="absolute top-2 right-2 text-[9px] font-mono font-bold px-1.5 py-0.5 uppercase transition-colors"
                    style={{
                      backgroundColor: 'var(--theme-btn-bg)',
                      color: 'var(--theme-btn-text)',
                    }}
                  >
                    {brand.count} {brand.count === 1 ? 'Ed.' : 'Eds.'}
                  </div>
                </div>

                {/* Brand Name & Action */}
                <div className="pt-1 text-center">
                  <h4
                    className="font-sans font-black text-xs sm:text-sm uppercase tracking-wider truncate transition-colors"
                    style={{ color: 'var(--theme-primary)' }}
                  >
                    {brand.name}
                  </h4>
                  <div
                    className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-bold uppercase tracking-widest mt-1.5 transition-colors"
                    style={{ color: 'var(--theme-secondary)' }}
                  >
                    <span>EXPLORE</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payments Verification Strip Styled with Accent */}
        <div
          className="mt-12 border-2 p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
          style={{
            backgroundColor: 'var(--theme-surface-card)',
            borderColor: 'var(--theme-border)',
          }}
        >
          <div className="space-y-1">
            <p className="text-[9px] tracking-[0.2em] uppercase font-bold" style={{ color: 'var(--theme-primary)' }}>
              ++ SECURE TRANSACTIONS
            </p>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" style={{ color: 'var(--theme-primary)' }} />
              <h4 className="font-sans text-sm font-black uppercase tracking-wider" style={{ color: 'var(--theme-primary)' }}>
                Verified by SSLCommerz Bangladesh
              </h4>
            </div>
            <p className="text-[11px] opacity-80 font-medium" style={{ color: 'var(--theme-text-secondary)' }}>
              Visa · Mastercard · Amex · UnionPay · bKash · Nagad · Rocket · Upay + more
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono">
            <span className="px-2.5 py-1 bg-white border font-bold text-[#1a1f71]" style={{ borderColor: 'var(--theme-border-subtle)' }}>VISA</span>
            <span className="px-2.5 py-1 bg-white border font-bold text-[#eb001b]" style={{ borderColor: 'var(--theme-border-subtle)' }}>Mastercard</span>
            <span className="px-2.5 py-1 bg-white border font-bold text-[#006fcf]" style={{ borderColor: 'var(--theme-border-subtle)' }}>AMEX</span>
            <span className="px-2.5 py-1 bg-[#e2136e] text-white font-bold">bKash</span>
            <span className="px-2.5 py-1 bg-[#f7931e] text-white font-bold">Nagad</span>
            <span className="px-2.5 py-1 bg-[#8c3494] text-white font-bold">Rocket</span>
            <span className="px-2.5 py-1 font-bold border" style={{ backgroundColor: 'var(--theme-surface)', borderColor: 'var(--theme-border)', color: 'var(--theme-primary)' }}>256-BIT SSL ENCRYPTION</span>
          </div>
        </div>

      </div>
    </section>
  );
};
