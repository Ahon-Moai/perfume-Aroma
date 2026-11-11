import React, { useState } from 'react';
import { FragranceProduct, DecantSize } from '../types';
import { ShoppingBag, Eye, ChevronDown, ArrowRight } from 'lucide-react';

interface CustomProductSectionsProps {
  homepageData?: any;
  allProducts: FragranceProduct[];
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

// Sub-component for individual custom product card with size dropdown
const CustomProductCard: React.FC<{
  product: FragranceProduct;
  onSelectProduct: (product: FragranceProduct) => void;
  onAddToCart: (product: FragranceProduct, size: string, price: number) => void;
}> = ({ product, onSelectProduct, onAddToCart }) => {
  const defaultSize = product.sizes?.[0] || { size: '5ml', price: product.startingPrice };
  const [selectedSize, setSelectedSize] = useState<DecantSize>(defaultSize);

  return (
    <div
      className="group p-4 sm:p-5 flex flex-col justify-between transition-all duration-300 shadow-xs hover:shadow-xl relative h-full rounded-xs border"
      style={{
        backgroundColor: 'var(--theme-surface-card)',
        borderColor: 'var(--theme-border-subtle)',
      }}
    >
      <div>
        {/* Image Area */}
        <div
          onClick={() => onSelectProduct(product)}
          className="aspect-square w-full flex items-center justify-center p-4 cursor-pointer overflow-hidden relative border"
          style={{
            backgroundColor: 'var(--theme-surface)',
            borderColor: 'var(--theme-border-subtle)',
          }}
        >
          <img
            src={product.image}
            alt={product.name}
            className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
            referrerPolicy="no-referrer"
          />

          <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <span
              className="text-[10px] font-sans tracking-widest uppercase px-3 py-2 flex items-center gap-1.5 shadow-lg"
              style={{
                backgroundColor: 'var(--theme-btn-bg)',
                color: 'var(--theme-btn-text)',
              }}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Quick View</span>
            </span>
          </div>
        </div>

        {/* Product Details */}
        <div className="mt-4 space-y-1.5 text-left">
          <div
            className="flex items-center justify-between text-[10px] font-sans uppercase tracking-widest font-bold"
            style={{ color: 'var(--theme-secondary)' }}
          >
            <span>{product.brand}</span>
            <span className="opacity-80">{product.concentration || 'Eau de Parfum'}</span>
          </div>

          <h3
            onClick={() => onSelectProduct(product)}
            className="font-serif text-sm sm:text-base font-normal transition-colors cursor-pointer truncate hover:opacity-80"
            style={{ color: 'var(--theme-primary)' }}
          >
            {product.name}
          </h3>

          <p className="text-xs font-serif font-medium tabular-nums">
            <span className="font-bold" style={{ color: 'var(--theme-primary)' }}>৳ {selectedSize.price}</span>
            <span className="text-[10px] font-sans font-normal ml-1 opacity-70" style={{ color: 'var(--theme-text-secondary)' }}>({selectedSize.size})</span>
          </p>

          {/* Size & Price Dropdown Selector */}
          <div className="pt-1.5" onClick={(e) => e.stopPropagation()}>
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

          {product.notes && product.notes.length > 0 && (
            <p className="text-[11px] font-sans line-clamp-1 pt-1 opacity-70" style={{ color: 'var(--theme-text-secondary)' }}>
              {product.notes.join(' · ')}
            </p>
          )}
        </div>
      </div>

      {/* Action Bar */}
      <div
        className="mt-4 pt-3 border-t flex items-center gap-2"
        style={{ borderColor: 'var(--theme-border-subtle)' }}
      >
        <button
          onClick={() => onSelectProduct(product)}
          className="flex-1 py-2 text-[11px] font-sans tracking-wider uppercase transition-colors text-center cursor-pointer border rounded-xs hover:opacity-85"
          style={{
            backgroundColor: 'var(--theme-surface)',
            color: 'var(--theme-text-primary)',
            borderColor: 'var(--theme-border-subtle)',
          }}
        >
          Details
        </button>

        <button
          onClick={() => onAddToCart(product, selectedSize.size, selectedSize.price)}
          className="p-2 transition-all cursor-pointer hover:opacity-85"
          style={{
            backgroundColor: 'var(--theme-btn-bg)',
            color: 'var(--theme-btn-text)',
          }}
          title={`Add ${selectedSize.size} to Bag`}
        >
          <ShoppingBag className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

// 4 products per row in desktop layout (xl:grid-cols-4)
// Initial: 1 row (4 items)
// 1 time show more adds 2 rows (+8 items -> 12 items total)
const INITIAL_ROW_COUNT = 4;
const EXPANDED_ROW_COUNT = 12;

export const CustomProductSections: React.FC<CustomProductSectionsProps> = ({
  homepageData,
  allProducts,
  onSelectProduct,
  onAddToCart,
  onNavigateToCollection
}) => {
  // Track expanded state per section key
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  const sectionKeys = ['custom_section_1', 'custom_section_2', 'custom_section_3', 'custom_section_4'];

  const activeSections = sectionKeys
    .map((key) => {
      const sec = homepageData?.sections?.[key];
      if (!sec) return null;

      const isEnabled = sec.content?.is_enabled ?? true;
      if (!isEnabled) return null;

      const productIds: string[] = sec.content?.product_ids || [];
      const sectionProducts = allProducts.filter((p) => productIds.includes(p.id));

      if (sectionProducts.length === 0) return null;

      return {
        key,
        title: sec.title || 'Curated Collection',
        subtitle: sec.subtitle || 'Exquisite Olfactory Portions',
        products: sectionProducts
      };
    })
    .filter(Boolean);

  if (activeSections.length === 0) return null;

  const handleShowMore = (secKey: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [secKey]: true
    }));
  };

  const handleSeeAll = () => {
    if (onNavigateToCollection) {
      onNavigateToCollection('all');
    } else {
      window.location.href = '/collections/all';
    }
  };

  return (
    <div
      className="w-full space-y-16 py-12 border-b select-none"
      style={{
        backgroundColor: 'var(--theme-bg)',
        borderColor: 'var(--theme-border-subtle)',
      }}
    >
      {activeSections.map((sec) => {
        if (!sec) return null;

        const isExpanded = !!expandedSections[sec.key];
        const visibleLimit = isExpanded ? EXPANDED_ROW_COUNT : INITIAL_ROW_COUNT;
        const displayedProducts = sec.products.slice(0, visibleLimit);
        const canShowMore = !isExpanded && sec.products.length > INITIAL_ROW_COUNT;

        return (
          <section key={sec.key} className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
            {/* Section Header */}
            <div className="mb-8 sm:mb-10">
              <div className="flex items-center gap-3 sm:gap-4">
                <h2
                  className="font-sans font-black text-2xl sm:text-3xl md:text-4xl tracking-tight uppercase shrink-0 select-none"
                  style={{ color: 'var(--theme-primary)' }}
                >
                  {sec.title}
                </h2>
                <div
                  className="h-[3px] sm:h-[4px] flex-1 max-w-[120px] sm:max-w-[200px]"
                  style={{ backgroundColor: 'var(--theme-primary)' }}
                />
              </div>
              {sec.subtitle && (
                <p
                  className="text-xs sm:text-sm font-semibold tracking-wider uppercase mt-1.5 select-none opacity-80"
                  style={{ color: 'var(--theme-primary)' }}
                >
                  {sec.subtitle}
                </p>
              )}
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {displayedProducts.map((product) => (
                <CustomProductCard
                  key={product.id}
                  product={product}
                  onSelectProduct={onSelectProduct}
                  onAddToCart={onAddToCart}
                />
              ))}
            </div>

            {/* Pagination Action Bar */}
            <div className="flex justify-center mt-8 sm:mt-10">
              {canShowMore ? (
                <button
                  onClick={() => handleShowMore(sec.key)}
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
          </section>
        );
      })}
    </div>
  );
};
