import React from 'react';
import { FragranceProduct } from '../types';

interface HeroProps {
  products?: FragranceProduct[];
  onSelectProduct?: (product: FragranceProduct) => void;
  onExploreClick?: () => void;
  onOrderProduct?: () => void;
  onNavigateToCollection?: (slug: string) => void;
  heroData?: any;
}

export const Hero: React.FC<HeroProps> = ({
  products = [],
  onSelectProduct,
  onNavigateToCollection,
}) => {
  // Use first 4 dynamic products or fallback to default sample products
  const displayProducts = products.length >= 4
    ? products.slice(0, 4)
    : products.length > 0
    ? products
    : [
        {
          id: 'prod-1',
          name: 'Off by Design Tee',
          brand: 'OUTFIT',
          startingPrice: 65,
          image: '/src/assets/images/season_dark_forest_1791908203381.jpg',
          category: 'Apparel',
          gender: 'Unisex',
          sizes: [{ size: 'M', price: 65 }]
        },
        {
          id: 'prod-2',
          name: 'Kerned Confidence Cap',
          brand: 'OUTFIT',
          startingPrice: 45,
          image: '/src/assets/images/campaign_for_him_1791908163466.jpg',
          category: 'Accessories',
          gender: 'Unisex',
          sizes: [{ size: 'One Size', price: 45 }]
        },
        {
          id: 'prod-3',
          name: 'Code & Canvas Oversized Hoodie',
          brand: 'OUTFIT',
          startingPrice: 110,
          image: '/src/assets/images/season_monochrome_street_1791908200992.jpg',
          category: 'Apparel',
          gender: 'Unisex',
          sizes: [{ size: 'L', price: 110 }]
        },
        {
          id: 'prod-4',
          name: 'Vector State Heavyweight Longsleeve',
          brand: 'OUTFIT',
          startingPrice: 75,
          image: '/src/assets/images/season_dune_red_sun_1791908201156.jpg',
          category: 'Apparel',
          gender: 'Unisex',
          sizes: [{ size: 'L', price: 75 }]
        }
      ] as FragranceProduct[];

  return (
    <section className="w-full bg-[#ECE8E1] text-[#FF1801] pt-1 sm:pt-2 pb-12 sm:pb-20 select-none">
      <div className="w-full px-5 sm:px-8 md:px-12">
        {/* Massive Centered Pure Portions By Arrina Branding Header */}
        <div className="w-full overflow-hidden select-none py-2 sm:py-4">
          <h1 className="w-full text-center text-[#FF1801] font-black tracking-tight uppercase leading-[0.88] select-none flex flex-col items-center justify-center">
            {/* Line 1: Pure Portions */}
            <span className="block text-[11.5vw] sm:text-[11vw] md:text-[10vw] lg:text-[9.5vw] tracking-[-0.035em] whitespace-nowrap">
              Pure Portions
            </span>
            {/* Line 2: By Arrina with trademark */}
            <span className="relative inline-flex items-center justify-center text-[10vw] sm:text-[9.5vw] md:text-[8.5vw] lg:text-[8vw] tracking-[-0.03em] whitespace-nowrap mt-1 sm:mt-2">
              <span>By Arrina</span>
              <span className="text-[3vw] sm:text-[2.5vw] md:text-[2vw] font-bold align-top -mt-3 sm:-mt-5 md:-mt-6 ml-1 sm:ml-1.5 inline-block">
                ®
              </span>
            </span>
          </h1>
        </div>

        {/* Thick Solid Red Horizontal Divider */}
        <div className="w-full h-[3.5px] sm:h-[4.5px] md:h-[5.5px] bg-[#FF1801] mt-2 sm:mt-3 mb-6 sm:mb-8" />

        {/* Editorial Information Section */}
        {/* Desktop Layout (4 columns matching reference screenshot) */}
        <div className="hidden md:grid md:grid-cols-12 gap-8 text-[15px] lg:text-[16px] xl:text-[17px] font-semibold leading-[1.3] text-[#FF1801] mb-12 lg:mb-16">
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
              Created by the ++hellohello team, this store and signature collection celebrates our collective creativity and passion for apparel. Carefully designed.
            </p>
          </div>

          {/* Column 3: WHERE */}
          <div className="md:col-span-4 pr-4">
            <span className="tracking-tight uppercase font-bold text-base lg:text-lg block mb-3">
              WHERE
            </span>
            <p className="font-semibold text-sm lg:text-[15px] leading-snug">
              Shop the collection here, or drop by our studio at 100 Main St. to say hello and try on pieces in person.
            </p>
          </div>

          {/* Column 4: Year */}
          <div className="md:col-span-1 text-right font-bold text-sm lg:text-[15px]">
            <span>© 2026</span>
          </div>
        </div>

        {/* Mobile Layout (exact stack from mobile screenshot) */}
        <div className="md:hidden flex flex-col space-y-6 text-[#FF1801] font-semibold mb-8 text-[13px] sm:text-[14px]">
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
                Created by the ++hellohello team, this store and signature collection celebrates our collective creativity and passion for apparel. Carefully designed.
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

        {/* Dynamic Product Grid Matching Screenshot */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-3 sm:gap-x-4 md:gap-x-5 lg:gap-x-6 gap-y-6 sm:gap-y-8 pt-1">
          {displayProducts.map((product) => (
            <div
              key={product.id}
              onClick={() => onSelectProduct && onSelectProduct(product)}
              className="group cursor-pointer flex flex-col"
            >
              {/* Product Image Frame */}
              <div className="relative aspect-[3/4] sm:aspect-[4/5] w-full bg-[#D6D2CB] overflow-hidden">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover object-center group-hover:scale-[1.03] transition-transform duration-500 ease-out"
                  loading="lazy"
                />
              </div>

              {/* Product Title Underneath */}
              <div className="pt-2 sm:pt-3">
                <h3 className="text-[#FF1801] font-semibold text-xs sm:text-sm md:text-[15px] leading-tight truncate group-hover:opacity-80 transition-opacity">
                  {product.name}
                </h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
