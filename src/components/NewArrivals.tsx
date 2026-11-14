import React, { useState } from 'react';
import { Plus, ChevronDown, ArrowRight } from 'lucide-react';
import { thumb } from '../lib/img';
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
      className="pp-card-min group flex flex-col justify-between cursor-pointer transition-all h-full p-2"
      style={{
        backgroundColor: 'var(--theme-surface-card)',
        borderColor: 'var(--theme-border-subtle)',
      }}
      onClick={() => onSelectProduct(product)}
    >
      <div>
        {/* Product Image Frame */}
        <div
          className="relative w-full aspect-square overflow-hidden flex items-center justify-center p-4 border transition-all duration-300"
          style={{
            backgroundColor: 'var(--theme-surface)',
            borderColor: 'var(--theme-border-subtle)',
          }}
        >
          <img
            src={thumb(product.image, 480)}
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
            className="absolute bottom-2 right-2 p-2 rounded-none opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-sm"
            style={{
              backgroundColor: 'var(--theme-btn-bg)',
              color: 'var(--theme-btn-text)',
            }}
            aria-label={`Quick add ${selectedSize.size} ${product.name}`}
            title={`Quick add ${selectedSize.size}`}
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Product Info */}
        <div className="pt-3.5 text-center flex flex-col items-center">
          <span
            className="text-[9px] sm:text-[10px] tracking-[0.22em] font-sans uppercase font-normal"
            style={{ color: 'var(--theme-secondary)' }}
          >
            {product.brand}
          </span>
          <h3
            className="font-serif text-xs sm:text-sm mt-1 font-normal transition-colors line-clamp-1"
            style={{ color: 'var(--theme-primary)' }}
          >
            {product.name}
          </h3>
          <p className="text-[12px] sm:text-xs font-sans mt-0.5 tabular-nums" style={{ color: 'var(--theme-text-secondary)' }}>
            From <span style={{ color: 'var(--theme-primary)' }}>৳ {Math.min(...(product.sizes && product.sizes.length ? product.sizes.map((x) => Number(x.price) || 0) : [product.startingPrice]))}</span>
          </p>
        </div>
      </div>

      {/* Size Dropdown Selector */}
      <div className="pp-min-hide mt-3 px-1" onClick={(e) => e.stopPropagation()}>
        <div className="relative">
          <select
            value={selectedSize.size}
            onChange={(e) => {
              const matched = product.sizes.find((s) => s.size === e.target.value);
              if (matched) setSelectedSize(matched);
            }}
            className="w-full appearance-none border text-[11px] sm:text-xs font-sans rounded-md py-1.5 pl-2.5 pr-7 focus:outline-none cursor-pointer transition-colors"
            style={{
              backgroundColor: 'var(--theme-surface)',
              borderColor: 'var(--theme-border-subtle)',
              color: 'var(--theme-text-primary)',
            }}
          >
            {product.sizes.map((sz, idx) => (
              <option key={sz.size || idx} value={sz.size}>
                {sz.size} ({getSprayEstimate(sz.size)}) — ৳{sz.price}
              </option>
            ))}
          </select>
          <ChevronDown
            className="w-3.5 h-3.5 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: 'var(--theme-secondary)' }}
          />
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
    <section
      id="new-arrivals"
      className="w-full pt-10 pb-14 sm:pt-14 sm:pb-20 border-b select-none"
      style={{
        backgroundColor: 'var(--theme-bg)',
        borderColor: 'var(--theme-border-subtle)',
      }}
    >
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-8 sm:mb-10">
          <div className="flex items-center gap-3 sm:gap-4">
            <h2
              className="font-sans font-black text-2xl sm:text-3xl md:text-4xl tracking-tight uppercase shrink-0 select-none"
              style={{ color: 'var(--theme-primary)' }}
            >
              NEW ARRIVALS
            </h2>
            <div
              className="h-[3px] sm:h-[4px] flex-1 max-w-[120px] sm:max-w-[200px]"
              style={{ backgroundColor: 'var(--theme-primary)' }}
            />
          </div>
          <p
            className="text-xs sm:text-sm font-semibold tracking-wider uppercase mt-1.5 select-none opacity-80"
            style={{ color: 'var(--theme-primary)' }}
          >
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
              className="inline-flex items-center gap-2 border-2 px-6 sm:px-8 py-2.5 sm:py-3 text-xs sm:text-sm font-bold tracking-widest uppercase transition-all duration-200 cursor-pointer shadow-xs active:scale-95 hover:opacity-85"
              style={{
                borderColor: 'var(--theme-border)',
                color: 'var(--theme-primary)',
                backgroundColor: 'var(--theme-surface-card)',
              }}
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
