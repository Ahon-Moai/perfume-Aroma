import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { FragranceProduct } from '../types';

interface NewArrivalsProps {
  products: FragranceProduct[];
  onSelectProduct: (product: FragranceProduct) => void;
  onAddToCart: (product: FragranceProduct, size: string, price: number) => void;
}

export const NewArrivals: React.FC<NewArrivalsProps> = ({
  products,
  onSelectProduct,
  onAddToCart
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -320, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 320, behavior: 'smooth' });
    }
  };

  return (
    <section id="new-arrivals" className="w-full bg-white pt-10 pb-12 sm:pt-14 sm:pb-16 border-b border-zinc-100">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-6">
          <div className="flex items-center gap-4">
            <h2 className="font-serif text-lg sm:text-xl font-normal tracking-[0.16em] text-zinc-950 uppercase shrink-0">
              NEW ARRIVALS
            </h2>
            <div className="h-[1px] bg-zinc-300 w-24 sm:w-36" />
          </div>
          <p className="text-[10px] sm:text-[11px] font-sans tracking-[0.2em] text-zinc-400 uppercase mt-1">
            OUR LATEST BOTTLES
          </p>
        </div>

        {/* 5 Product Tiles Container */}
        <div
          ref={scrollContainerRef}
          className="flex items-start gap-4 sm:gap-6 overflow-x-auto no-scrollbar scroll-smooth pb-4 pt-2 -mx-4 px-4 sm:mx-0 sm:px-0"
        >
          {products.map((product) => (
            <div
              key={product.id}
              className="flex-shrink-0 w-[190px] sm:w-[220px] lg:w-[calc(20%-1.25rem)] group flex flex-col cursor-pointer"
              onClick={() => onSelectProduct(product)}
            >
              {/* Product Image Frame */}
              <div className="relative w-full aspect-square bg-[#fafafa] overflow-hidden flex items-center justify-center p-4 border border-transparent group-hover:border-zinc-200 transition-all duration-300">
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
                    const defaultSize = product.sizes[0];
                    onAddToCart(product, defaultSize.size, defaultSize.price);
                  }}
                  className="absolute bottom-2 right-2 bg-black/90 hover:bg-black text-white p-2 rounded-none opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-sm"
                  aria-label={`Quick add 3ml ${product.name}`}
                  title="Quick add 3ml"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Product Info - Exact hierarchy from screenshot */}
              <div className="pt-3.5 text-center flex flex-col items-center">
                <span className="text-[9px] sm:text-[10px] tracking-[0.2em] font-sans text-zinc-400 uppercase">
                  {product.brand}
                </span>
                <h3 className="font-serif text-xs sm:text-sm text-zinc-900 mt-1 font-normal group-hover:text-red-700 transition-colors line-clamp-1">
                  {product.name}
                </h3>
                <p className="text-[11px] sm:text-xs text-zinc-500 font-sans mt-0.5 tabular-nums">
                  From <span className="font-medium text-zinc-900">৳ {product.startingPrice}</span>
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Carousel Navigation Arrows - Aligned to the right as in screenshot */}
        <div className="flex justify-end items-center gap-1.5 mt-2">
          <button
            onClick={scrollLeft}
            aria-label="Previous products"
            className="w-7 h-7 sm:w-8 sm:h-8 bg-zinc-950 text-white hover:bg-zinc-800 flex items-center justify-center transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={scrollRight}
            aria-label="Next products"
            className="w-7 h-7 sm:w-8 sm:h-8 bg-zinc-950 text-white hover:bg-zinc-800 flex items-center justify-center transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
};
