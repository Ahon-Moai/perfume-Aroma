import React, { useState } from 'react';
import { Search, X, ArrowRight, Sparkles, TrendingUp } from 'lucide-react';
import { FragranceProduct } from '../types';
import { trackSearchSubmission } from '../services/searchTracker';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: FragranceProduct[];
  onSelectProduct: (product: FragranceProduct) => void;
}

const POPULAR_SEARCH_TAGS = [
  'Vanilla',
  'Woody & Oud',
  'Pure Portions',
  'For Him',
  'For Her',
  'Extrait',
  'Fresh Citrus'
];

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  products,
  onSelectProduct
}) => {
  const [query, setQuery] = useState('');

  if (!isOpen) return null;

  const cleanQuery = query.trim();
  const filtered = cleanQuery === ''
    ? []
    : products.filter(
        (p) =>
          p.name.toLowerCase().includes(cleanQuery.toLowerCase()) ||
          p.brand.toLowerCase().includes(cleanQuery.toLowerCase()) ||
          p.category.toLowerCase().includes(cleanQuery.toLowerCase()) ||
          p.notes?.some((n) => n.toLowerCase().includes(cleanQuery.toLowerCase()))
      );

  const featuredShowcase = products.slice(0, 4);

  const handleSelectPill = (tag: string) => {
    setQuery(tag);
    // Track submitted tag search
    const matching = products.filter(
      (p) =>
        p.name.toLowerCase().includes(tag.toLowerCase()) ||
        p.brand.toLowerCase().includes(tag.toLowerCase()) ||
        p.category.toLowerCase().includes(tag.toLowerCase()) ||
        p.notes?.some((n) => n.toLowerCase().includes(tag.toLowerCase()))
    );
    trackSearchSubmission({
      term: tag,
      productId: matching[0]?.id,
      resultCount: matching.length
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (cleanQuery.length >= 2) {
        trackSearchSubmission({
          term: cleanQuery,
          productId: filtered[0]?.id,
          resultCount: filtered.length
        });
      }
    }
  };

  const handleSelectProductItem = (item: FragranceProduct) => {
    if (cleanQuery.length >= 2) {
      trackSearchSubmission({
        term: cleanQuery,
        productId: item.id,
        resultCount: filtered.length
      });
    }
    onSelectProduct(item);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-4 sm:pt-16 p-3 sm:p-4 bg-black/70 backdrop-blur-md animate-fade-in">
      <div
        className="w-full max-w-2xl shadow-2xl border rounded-2xl overflow-hidden flex flex-col max-h-[85vh]"
        style={{
          backgroundColor: 'var(--theme-surface-card)',
          borderColor: 'var(--theme-border-subtle)',
        }}
      >
        {/* Top Header & Search Bar */}
        <div
          className="p-4 sm:p-5 border-b sticky top-0 z-10 space-y-3"
          style={{
            backgroundColor: 'var(--theme-surface-card)',
            borderColor: 'var(--theme-border-subtle)',
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" style={{ color: 'var(--theme-primary)' }} />
              <span
                className="text-xs font-semibold uppercase tracking-wider"
                style={{ color: 'var(--theme-primary)' }}
              >
                Fragrance Catalog Search
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:opacity-75 transition-opacity cursor-pointer"
              style={{ color: 'var(--theme-primary)' }}
              aria-label="Close search"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="relative flex items-center">
            <Search
              className="w-5 h-5 absolute left-3.5 pointer-events-none opacity-50"
              style={{ color: 'var(--theme-primary)' }}
            />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search by perfume, brand, or note (e.g. Vanilla, ARRINA, Oud)..."
              className="w-full border rounded-xl pl-10 pr-16 py-3 text-sm focus:outline-none transition-all font-sans"
              style={{
                backgroundColor: 'var(--theme-surface)',
                borderColor: 'var(--theme-border-subtle)',
                color: 'var(--theme-text-primary)',
              }}
              autoFocus
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-3 text-xs font-medium uppercase tracking-wider px-2 py-1 rounded cursor-pointer opacity-70 hover:opacity-100"
                style={{ color: 'var(--theme-primary)' }}
              >
                Clear
              </button>
            )}
          </div>

          {/* Quick Filter Search Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
            <TrendingUp className="w-3.5 h-3.5 shrink-0 mr-1 opacity-50" style={{ color: 'var(--theme-primary)' }} />
            {POPULAR_SEARCH_TAGS.map((tag) => (
              <button
                key={tag}
                onClick={() => handleSelectPill(tag)}
                className="text-[11px] font-medium px-2.5 py-1 rounded-full whitespace-nowrap transition-all cursor-pointer border"
                style={{
                  backgroundColor: query === tag ? 'var(--theme-btn-bg)' : 'var(--theme-surface)',
                  color: query === tag ? 'var(--theme-btn-text)' : 'var(--theme-text-primary)',
                  borderColor: 'var(--theme-border-subtle)',
                }}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable Results / Pre-search State */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 no-scrollbar">
          {query.trim() === '' ? (
            /* Initial State: Popular / Featured Catalog Showcase */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4
                  className="text-xs font-semibold uppercase tracking-wider font-sans"
                  style={{ color: 'var(--theme-text-secondary)' }}
                >
                  Featured & Trending Decants
                </h4>
                <span className="text-[10px] font-mono opacity-60" style={{ color: 'var(--theme-text-secondary)' }}>
                  {products.length} Products Available
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {featuredShowcase.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      onSelectProduct(item);
                      onClose();
                    }}
                    className="flex items-center gap-3 p-3 border rounded-xl transition-all cursor-pointer group hover:opacity-90"
                    style={{
                      backgroundColor: 'var(--theme-surface)',
                      borderColor: 'var(--theme-border-subtle)',
                    }}
                  >
                    <div
                      className="w-14 h-14 rounded-lg p-1 border flex items-center justify-center shrink-0"
                      style={{
                        backgroundColor: 'var(--theme-surface-card)',
                        borderColor: 'var(--theme-border-subtle)',
                      }}
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span
                        className="text-[9px] font-semibold tracking-widest uppercase block"
                        style={{ color: 'var(--theme-secondary)' }}
                      >
                        {item.brand}
                      </span>
                      <h5
                        className="font-serif text-sm font-normal truncate"
                        style={{ color: 'var(--theme-text-primary)' }}
                      >
                        {item.name}
                      </h5>
                      <p className="text-[11px] font-medium mt-0.5" style={{ color: 'var(--theme-primary)' }}>
                        ৳ {item.startingPrice} <span className="text-[10px] opacity-70 font-normal">/ decant</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : filtered.length === 0 ? (
            /* Empty Search State */
            <div className="py-12 text-center space-y-2">
              <p className="font-serif text-base" style={{ color: 'var(--theme-text-primary)' }}>
                No decants found for "{query}"
              </p>
              <p className="text-xs font-sans max-w-xs mx-auto opacity-75" style={{ color: 'var(--theme-text-secondary)' }}>
                Try searching for a different scent profile, family name, or brand.
              </p>
              <button
                onClick={() => setQuery('')}
                className="mt-3 text-xs font-semibold underline underline-offset-4 cursor-pointer"
                style={{ color: 'var(--theme-primary)' }}
              >
                Clear query and view all fragrances
              </button>
            </div>
          ) : (
            /* Active Search Results Grid */
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs" style={{ color: 'var(--theme-text-secondary)' }}>
                <span>Matching Decants</span>
                <span className="font-mono text-[11px]">{filtered.length} found</span>
              </div>

              <div className="space-y-2">
                {filtered.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleSelectProductItem(item)}
                    className="flex items-center justify-between p-3 border rounded-xl transition-colors cursor-pointer group hover:opacity-90"
                    style={{
                      backgroundColor: 'var(--theme-surface)',
                      borderColor: 'var(--theme-border-subtle)',
                    }}
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div
                        className="w-12 h-12 rounded-lg p-1 border flex items-center justify-center shrink-0"
                        style={{
                          backgroundColor: 'var(--theme-surface-card)',
                          borderColor: 'var(--theme-border-subtle)',
                        }}
                      >
                        <img
                          src={item.image}
                          alt={item.name}
                          className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-200"
                        />
                      </div>
                      <div className="min-w-0">
                        <span
                          className="text-[9px] font-semibold tracking-widest uppercase block"
                          style={{ color: 'var(--theme-secondary)' }}
                        >
                          {item.brand}
                        </span>
                        <h4
                          className="font-serif text-sm font-normal truncate"
                          style={{ color: 'var(--theme-text-primary)' }}
                        >
                          {item.name}
                        </h4>
                        <p className="text-[11px] opacity-80 mt-0.5" style={{ color: 'var(--theme-text-secondary)' }}>
                          {item.category} &bull;{' '}
                          <span className="font-semibold" style={{ color: 'var(--theme-primary)' }}>
                            ৳ {item.startingPrice}
                          </span>
                        </p>
                      </div>
                    </div>

                    <div
                      className="flex items-center gap-1.5 text-xs transition-colors shrink-0 pl-2"
                      style={{ color: 'var(--theme-primary)' }}
                    >
                      <span className="hidden sm:inline font-medium">Explore</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
