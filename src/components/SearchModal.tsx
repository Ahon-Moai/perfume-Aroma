import React, { useState } from 'react';
import { Search, X, ArrowRight, Sparkles, TrendingUp } from 'lucide-react';
import { FragranceProduct } from '../types';

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

  const filtered = query.trim() === ''
    ? []
    : products.filter(
        (p) =>
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.brand.toLowerCase().includes(query.toLowerCase()) ||
          p.category.toLowerCase().includes(query.toLowerCase()) ||
          p.notes?.some((n) => n.toLowerCase().includes(query.toLowerCase()))
      );

  const featuredShowcase = products.slice(0, 4);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-4 sm:pt-16 p-3 sm:p-4 bg-black/70 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-2xl bg-white shadow-2xl border border-zinc-200 rounded-2xl overflow-hidden flex flex-col max-h-[85vh]">

        {/* Top Header & Search Bar */}
        <div className="p-4 sm:p-5 border-b border-zinc-150 bg-white sticky top-0 z-10 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-zinc-900" />
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-900">
                Fragrance Catalog Search
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-zinc-100 text-zinc-500 hover:text-zinc-950 transition-colors cursor-pointer"
              aria-label="Close search"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="relative flex items-center">
            <Search className="w-5 h-5 absolute left-3.5 text-zinc-400 pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by perfume, brand, or note (e.g. Vanilla, ARRINA, Oud)..."
              className="w-full bg-zinc-50 border border-zinc-200/80 rounded-xl pl-10 pr-16 py-3 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:bg-white focus:border-zinc-900 transition-all font-sans"
              autoFocus
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-3 text-xs font-medium text-zinc-400 hover:text-zinc-900 uppercase tracking-wider px-2 py-1 rounded cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>

          {/* Quick Filter Search Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
            <TrendingUp className="w-3.5 h-3.5 text-zinc-400 shrink-0 mr-1" />
            {POPULAR_SEARCH_TAGS.map((tag) => (
              <button
                key={tag}
                onClick={() => setQuery(tag)}
                className={`text-[11px] font-medium px-2.5 py-1 rounded-full whitespace-nowrap transition-all cursor-pointer ${
                  query === tag
                    ? 'bg-zinc-950 text-white'
                    : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 hover:text-zinc-900'
                }`}
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
                <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 font-sans">
                  Featured & Trending Decants
                </h4>
                <span className="text-[10px] font-mono text-zinc-400">
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
                    className="flex items-center gap-3 p-3 bg-zinc-50/70 hover:bg-zinc-100/90 border border-zinc-200/60 rounded-xl transition-all cursor-pointer group"
                  >
                    <div className="w-14 h-14 bg-white rounded-lg p-1 border border-zinc-200/60 flex items-center justify-center shrink-0">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-[9px] font-semibold tracking-widest text-zinc-400 uppercase block">
                        {item.brand}
                      </span>
                      <h5 className="font-serif text-sm text-zinc-900 font-normal truncate">
                        {item.name}
                      </h5>
                      <p className="text-[11px] font-medium text-zinc-600 mt-0.5">
                        ৳ {item.startingPrice} <span className="text-[10px] text-zinc-400 font-normal">/ decant</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : filtered.length === 0 ? (
            /* Empty Search State */
            <div className="py-12 text-center space-y-2">
              <p className="font-serif text-base text-zinc-800">No decants found for "{query}"</p>
              <p className="text-xs text-zinc-500 font-sans max-w-xs mx-auto">
                Try searching for a different scent profile, family name, or brand.
              </p>
              <button
                onClick={() => setQuery('')}
                className="mt-3 text-xs font-semibold text-zinc-900 underline underline-offset-4 cursor-pointer"
              >
                Clear query and view all fragrances
              </button>
            </div>
          ) : (
            /* Active Search Results Grid */
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-zinc-500">
                <span>Matching Decants</span>
                <span className="font-mono text-[11px]">{filtered.length} found</span>
              </div>

              <div className="space-y-2">
                {filtered.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      onSelectProduct(item);
                      onClose();
                    }}
                    className="flex items-center justify-between p-3 bg-zinc-50/50 hover:bg-zinc-100 border border-zinc-200/60 rounded-xl transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-12 h-12 bg-white rounded-lg p-1 border border-zinc-200/60 flex items-center justify-center shrink-0">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-200"
                        />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[9px] font-semibold tracking-widest text-zinc-400 uppercase block">
                          {item.brand}
                        </span>
                        <h4 className="font-serif text-sm font-normal text-zinc-900 truncate">
                          {item.name}
                        </h4>
                        <p className="text-[11px] text-zinc-500 mt-0.5">
                          {item.category} &bull; <span className="font-semibold text-zinc-900">৳ {item.startingPrice}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-zinc-400 group-hover:text-zinc-950 transition-colors shrink-0 pl-2">
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
