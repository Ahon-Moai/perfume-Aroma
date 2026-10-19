import React from 'react';
import { FragranceProduct } from '../types';
import { ShoppingBag, Eye, Sparkles } from 'lucide-react';

interface CustomProductSectionsProps {
  homepageData?: any;
  allProducts: FragranceProduct[];
  onSelectProduct: (product: FragranceProduct) => void;
  onAddToCart: (product: FragranceProduct, size: string, price: number) => void;
}

export const CustomProductSections: React.FC<CustomProductSectionsProps> = ({
  homepageData,
  allProducts,
  onSelectProduct,
  onAddToCart
}) => {
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

  return (
    <div className="w-full bg-white space-y-16 py-12 border-b border-zinc-100">
      {activeSections.map((sec, idx) => {
        if (!sec) return null;

        return (
          <section key={sec.key} className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
            {/* Section Header */}
            <div className="flex flex-col items-center text-center mb-8 space-y-1">
              <div className="inline-flex items-center gap-1.5 text-[10px] font-mono tracking-widest text-amber-600 uppercase font-semibold">
                <Sparkles className="w-3 h-3 text-amber-500" />
                <span>CURATED SELECTION #{idx + 1}</span>
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl font-light tracking-[0.15em] text-zinc-950 uppercase">
                {sec.title}
              </h2>
              {sec.subtitle && (
                <p className="text-xs text-zinc-500 font-sans tracking-wide max-w-xl">
                  {sec.subtitle}
                </p>
              )}
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {sec.products.map((product) => {
                const primarySize = product.sizes?.[0] || { size: '5ml', price: product.startingPrice };

                return (
                  <div
                    key={product.id}
                    className="group bg-[#fcfcfc] border border-zinc-200/80 p-5 flex flex-col justify-between hover:border-zinc-950 transition-all duration-300 shadow-xs hover:shadow-xl relative"
                  >
                    {/* Image Area */}
                    <div
                      onClick={() => onSelectProduct(product)}
                      className="aspect-square w-full flex items-center justify-center p-4 cursor-pointer overflow-hidden relative bg-white border border-zinc-100"
                    >
                      <img
                        src={product.image}
                        alt={product.name}
                        className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                        referrerPolicy="no-referrer"
                      />

                      <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="bg-zinc-950 text-white text-[10px] font-sans tracking-widest uppercase px-3 py-2 flex items-center gap-1.5 shadow-lg">
                          <Eye className="w-3.5 h-3.5" />
                          <span>Quick View</span>
                        </span>
                      </div>
                    </div>

                    {/* Product Details */}
                    <div className="mt-4 space-y-1.5 text-left">
                      <div className="flex items-center justify-between text-[10px] font-sans text-zinc-400 uppercase tracking-widest">
                        <span>{product.brand}</span>
                        <span>{product.concentration || 'Eau de Parfum'}</span>
                      </div>

                      <h3
                        onClick={() => onSelectProduct(product)}
                        className="font-serif text-base text-zinc-950 font-normal hover:text-amber-600 transition-colors cursor-pointer truncate"
                      >
                        {product.name}
                      </h3>

                      <p className="text-xs font-serif font-medium text-zinc-900 tabular-nums">
                        ৳ {primarySize.price} <span className="text-[10px] font-sans font-normal text-zinc-500">({primarySize.size})</span>
                      </p>

                      {product.notes && product.notes.length > 0 && (
                        <p className="text-[11px] text-zinc-500 font-sans line-clamp-1">
                          {product.notes.join(' · ')}
                        </p>
                      )}
                    </div>

                    {/* Action Bar */}
                    <div className="mt-4 pt-3 border-t border-zinc-150 flex items-center gap-2">
                      <button
                        onClick={() => onSelectProduct(product)}
                        className="flex-1 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 py-2 text-[11px] font-sans tracking-wider uppercase transition-colors text-center cursor-pointer"
                      >
                        Details
                      </button>

                      <button
                        onClick={() => onAddToCart(product, primarySize.size, primarySize.price)}
                        className="bg-zinc-950 hover:bg-amber-400 hover:text-black text-white p-2 transition-all cursor-pointer"
                        title="Add to Bag"
                      >
                        <ShoppingBag className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
};
