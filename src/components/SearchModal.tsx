import React, { useState } from 'react';
import { Search, X, ArrowRight } from 'lucide-react';
import { FragranceProduct } from '../types';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: FragranceProduct[];
  onSelectProduct: (product: FragranceProduct) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  products,
  onSelectProduct
}) => {
  const [query, setQuery] = useState('');

  if (!isOpen) return null;

  const filtered = query.trim() === ''
    ? products
    : products.filter(
        (p) =>
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.brand.toLowerCase().includes(query.toLowerCase()) ||
          p.category.toLowerCase().includes(query.toLowerCase()) ||
          p.notes?.some((n) => n.toLowerCase().includes(query.toLowerCase()))
      );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-xl bg-white shadow-2xl border border-zinc-200 overflow-hidden">
        {/* Search Input Bar */}
        <div className="p-4 border-b border-zinc-200 flex items-center gap-3">
          <Search className="w-5 h-5 text-zinc-400 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by perfume name, brand, notes (e.g. Rose, Vanilla, French Avenue)..."
            className="w-full text-sm font-sans focus:outline-none placeholder-zinc-400 text-zinc-900"
            autoFocus
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-xs text-zinc-400 hover:text-black uppercase tracking-wider"
            >
              Clear
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1 text-zinc-400 hover:text-black transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-[380px] overflow-y-auto p-4 space-y-2 no-scrollbar">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-xs text-zinc-500 font-sans">
              No decants found matching "{query}".
            </div>
          ) : (
            filtered.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  onSelectProduct(item);
                  onClose();
                }}
                className="flex items-center justify-between p-3 hover:bg-zinc-50 border border-transparent hover:border-zinc-200 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-[#fafafa] p-1 border border-zinc-150 flex items-center justify-center shrink-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                  <div>
                    <span className="text-[9px] font-sans tracking-widest text-zinc-400 uppercase">
                      {item.brand}
                    </span>
                    <h4 className="font-serif text-sm font-normal text-zinc-900">
                      {item.name}
                    </h4>
                    <p className="text-[11px] text-zinc-500">
                      Starting from <span className="font-medium text-zinc-900">৳ {item.startingPrice}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-xs text-zinc-400 hover:text-black">
                  <span>View</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
