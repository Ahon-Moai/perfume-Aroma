import React, { useState } from 'react';
import { Plus, ChevronDown, ArrowRight } from 'lucide-react';
import { FragranceProduct, DecantSize } from '../types';

interface NewArrivalsProps {
  products: FragranceProduct[];
  onSelectProduct: (product: FragranceProduct) => void;
  onAddToCart: (product: FragranceProduct, size: string, price: number) => void;
  onNavigateToCollection?: (slug: string) => void;
}

const getSprayEstimate = (sizeStr: string): string => {
  const match = sizeStr.match(/(\d+(\.\d+)?)/);
  if (match) {
    const ml = parseFloat(match[1]);
    const sprays = Math.round(ml * 15);
    return `${sprays}+ sprays`;
  }
  return 'approx. 45+ sprays';
};

// Sub-component for individual product card with size dropdown
const NewArrivalProductCard: React.FC<{
  product: FragranceProduct;
  onSelectProduct: (product: FragranceProduct) => void;
  onAddToCart: (product: FragranceProduct, size: string, price: number) => void;
}> = ({ product, onSelectProduct, onAddToCart }) => {
  const defaultSize = product.sizes?.[0] || { size: '3ml', price: product.startingPrice };
  const [selectedSize, setSelectedSize] = useState<DecantSize>(defaultSize);

  return (
    <div
      className="group flex flex-col justify-between cursor-pointer bg-white transition-all h-full"
      onClick={() => onSelectProduct(product)}
    >
      <div>
        {/* Product Image Frame */}
        <div className="relative w-full aspect-square bg-[#fafafa] overflow-hidden flex items-center justify-center p-4 border border-zinc-100 group-hover:border-zinc-300 transition-all duration-300">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-contain object-center group-hover:scale-105 transition-transform duration-500"
            referrerPolicy="no-referrer"
            loading="lazy"
          />

          {/* Subtle Hover Quick Action */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart(product, selectedSize.size, selectedSize.price);
            }}
            className="absolute bottom-2 right-2 bg-black/90 hover:bg-[#FF1801] text-white p-2 rounded-none opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-sm"
            aria-label={`Quick add ${selectedSize.size} ${product.name}`}
            title={`Quick add ${selectedSize.size}`}
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Product Info */}
        <div className="pt-3.5 text-center flex flex-col items-center">
          <span className="text-[9px] sm:text-[10px] tracking-[0.2em] font-sans text-zinc-400 uppercase">
            {product.brand}
          </span>
          <h3 className="font-serif text-xs sm:text-sm text-zinc-900 mt-1 font-normal group-hover:text-[#FF1801] transition-colors line-clamp-1">
            {product.name}
          </h3>
          <p className="text-[12px] sm:text-xs text-zinc-900 font-sans mt-0.5 tabular-nums">
            <span className="font-bold text-zinc-950">৳ {selectedSize.price}</span>
            <span className="text-zinc-500 text-[10px] sm:text-[11px] ml-1">({selectedSize.size})</span>
          </p>
        </div>
      </div>

      {/* Size Dropdown Selector */}
      <div className="mt-3 px-1" onClick={(e) => e.stopPropagation()}>
        <div className="relative">
          <select
            value={selectedSize.size}
            onChange={(e) => {
              const matched = product.sizes.find((s) => s.size === e.target.value);
              if (matched) setSelectedSize(matched);
            }}
            className="w-full appearance-none bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 text-zinc-800 text-[11px] sm:text-xs font-sans rounded-md py-1.5 pl-2.5 pr-7 focus:outline-none focus:border-zinc-400 cursor-pointer transition-colors"
          >
            {product.sizes.map((sz, idx) => (
              <option key={sz.size || idx} value={sz.size}>
                {sz.size} ({getSprayEstimate(sz.size)}) — ৳{sz.price}
              </option>
            ))}
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-zinc-500 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>
    </div>
  );
};

// Desktop row size is 5 products. Initial: 1 row (5 items).
// 1 time show more adds 2 rows (+10 items -> 15 items total).
const INITIAL_ROW_COUNT = 5;
const EXPANDED_ROW_COUNT = 15;

export const NewArrivals: React.FC<NewArrivalsProps> = ({
  products,
  onSelectProduct,
  onAddToCart,
  onNavigateToCollection
}) => {
  const [hasExpandedOnce, setHasExpandedOnce] = useState(false);

  // If not expanded, show 1 row (5 items). Once clicked, show 2 more rows (+10 items = 15 items).
  const visibleLimit = hasExpandedOnce ? EXPANDED_ROW_COUNT : INITIAL_ROW_COUNT;
  const displayedProducts = products.slice(0, visibleLimit);

  // Can show more only if hasn't expanded yet and there are more products than initial row
  const canShowMore = !hasExpandedOnce && products.length > INITIAL_ROW_COUNT;

  const handleShowMore = () => {
    setHasExpandedOnce(true);
  };

  const handleSeeAll = () => {
    if (onNavigateToCollection) {
      onNavigateToCollection('all');
    } else {
      window.location.href = '/collections/all';
    }
  };

  return (
    <section id="new-arrivals" className="w-full bg-white pt-10 pb-14 sm:pt-14 sm:pb-20 border-b border-zinc-100">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-8 sm:mb-10">
          <div className="flex items-center gap-3 sm:gap-4">
            <h2 className="font-sans font-black text-2xl sm:text-3xl md:text-4xl tracking-tight text-[#FF1801] uppercase shrink-0 select-none">
              NEW ARRIVALS
            </h2>
            <div className="h-[3px] sm:h-[4px] bg-[#FF1801] flex-1 max-w-[120px] sm:max-w-[200px]" />
          </div>
          <p className="text-xs sm:text-sm font-semibold tracking-wider text-[#FF1801]/80 uppercase mt-1.5 select-none">
            OUR LATEST BOTTLES
          </p>
        </div>

        {/* Product Grid: Column-wise layout across rows */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
          {displayedProducts.map((product) => (
            <NewArrivalProductCard
              key={product.id}
              product={product}
              onSelectProduct={onSelectProduct}
              onAddToCart={onAddToCart}
            />
          ))}
        </div>

        {/* Pagination Action Bar */}
        <div className="flex justify-center mt-10 sm:mt-12">
          {canShowMore ? (
            <button
              onClick={handleShowMore}
              className="inline-flex items-center gap-2 border-2 border-[#FF1801] text-[#FF1801] hover:bg-[#FF1801] hover:text-white px-6 sm:px-8 py-2.5 sm:py-3 text-xs sm:text-sm font-bold tracking-widest uppercase transition-all duration-200 cursor-pointer shadow-xs active:scale-95"
            >
              <span>Show More Products</span>
              <ChevronDown className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSeeAll}
              className="inline-flex items-center gap-2 border-2 px-6 sm:px-8 py-2.5 sm:py-3 text-xs sm:text-sm font-bold tracking-widest uppercase transition-all duration-200 cursor-pointer shadow-xs active:scale-95 hover:opacity-85"
              style={{
                backgroundColor: 'var(--theme-btn-bg)',
                borderColor: 'var(--theme-border)',
                color: 'var(--theme-btn-text)',
              }}
            >
              <span>See all products</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </section>
  );
};
