import React, { useState } from 'react';
import { X, Check, ShoppingBag, ShieldCheck, Share2, Copy, Sparkles, Layers } from 'lucide-react';
import { FragranceProduct } from '../types';

interface QuickViewModalProps {
  product: FragranceProduct | null;
  onClose: () => void;
  onAddToCart: (product: FragranceProduct, size: string, price: number, qty: number) => void;
}

export const QuickViewModal: React.FC<QuickViewModalProps> = ({
  product,
  onClose,
  onAddToCart
}) => {
  if (!product) return null;

  const [selectedSizeIndex, setSelectedSizeIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const currentSize = product.sizes[selectedSizeIndex] || product.sizes[0];

  const handleAdd = () => {
    onAddToCart(product, currentSize.size, currentSize.price, quantity);
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
      onClose();
    }, 900);
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}${window.location.pathname}?product=${encodeURIComponent(product.id)}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Attributes fallback
  const attributes = Array.isArray(product.attributes) && product.attributes.length > 0
    ? product.attributes.filter(a => a.enabled !== false)
    : [
        { id: 'longevity', name: 'Longevity', value: 85, enabled: true },
        { id: 'sillage', name: 'Sillage', value: 80, enabled: true },
        { id: 'projection', name: 'Projection', value: 75, enabled: true },
        { id: 'versatility', name: 'Versatility', value: 90, enabled: true }
      ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white shadow-2xl overflow-hidden border border-zinc-200 my-auto">
        {/* Top Share & Close Action Bar */}
        <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
          <button
            onClick={handleCopyLink}
            className="p-2 bg-zinc-100 hover:bg-zinc-950 hover:text-white text-zinc-700 transition-all rounded-full border border-zinc-200 shadow-sm flex items-center gap-1.5 px-3 text-[11px] font-sans uppercase tracking-wider cursor-pointer"
            title="Copy shareable link to this product"
          >
            {copiedLink ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-emerald-600 font-semibold">Copied Link</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5" />
                <span>Share Link</span>
              </>
            )}
          </button>

          <button
            onClick={onClose}
            aria-label="Close modal"
            className="p-2 text-zinc-500 hover:text-black hover:bg-zinc-100 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12">
          {/* Image Sidebar */}
          <div className="md:col-span-5 bg-[#fcfcfc] p-6 sm:p-8 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-zinc-150 relative">
            <img
              src={product.image}
              alt={product.name}
              className="max-h-[300px] w-auto object-contain drop-shadow-md"
              referrerPolicy="no-referrer"
            />
            <span className="mt-4 text-[9px] font-mono tracking-widest text-zinc-400 uppercase">
              100% AUTHENTIC ATOMIZER
            </span>
          </div>

          {/* Details & Attributes Main Content */}
          <div className="md:col-span-7 p-6 sm:p-8 flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] tracking-[0.2em] font-sans text-amber-700 font-semibold uppercase">
                  {product.brand} · {product.concentration || 'Eau de Parfum'}
                </span>
                <span className="text-[10px] font-mono text-zinc-400 uppercase">ID: {product.id}</span>
              </div>

              <h2 className="font-serif text-2xl sm:text-3xl text-zinc-950 font-normal">
                {product.name}
              </h2>

              <p className="font-serif text-xl text-zinc-900 font-medium tabular-nums">
                ৳ {currentSize.price * quantity}
              </p>

              {product.shortDescription && (
                <p className="text-xs text-zinc-600 font-sans leading-relaxed">
                  {product.shortDescription}
                </p>
              )}

              {/* Fragrance Notes Breakdown (Top, Heart, Base) */}
              <div className="bg-zinc-50 border border-zinc-200/80 p-3 space-y-2 rounded-xs">
                <div className="flex items-center gap-1.5 text-[10px] tracking-wider uppercase font-semibold text-zinc-800">
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  <span>Fragrance Notes Pyramid</span>
                </div>

                {product.topNotes && product.topNotes.length > 0 ? (
                  <div className="text-[11px] text-zinc-600 space-y-1 font-sans">
                    <p><strong className="text-zinc-900">Top Notes:</strong> {product.topNotes.join(' · ')}</p>
                    {product.heartNotes && product.heartNotes.length > 0 && (
                      <p><strong className="text-zinc-900">Heart Notes:</strong> {product.heartNotes.join(' · ')}</p>
                    )}
                    {product.baseNotes && product.baseNotes.length > 0 && (
                      <p><strong className="text-zinc-900">Base Notes:</strong> {product.baseNotes.join(' · ')}</p>
                    )}
                  </div>
                ) : (
                  <p className="text-[11px] text-zinc-600 font-sans">
                    <strong className="text-zinc-900">Accords:</strong> {product.notes?.join(' · ') || 'Neroli, Bourbon Vanilla, Amber'}
                  </p>
                )}
              </div>

              {/* Olfactory Attribute Sliders / Volume Bars */}
              {attributes.length > 0 && (
                <div className="space-y-2 pt-1">
                  <div className="flex items-center gap-1.5 text-[10px] tracking-wider uppercase font-semibold text-zinc-700">
                    <Layers className="w-3 h-3 text-zinc-500" />
                    <span>Scent Intensity & Attributes</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {attributes.map((attr) => (
                      <div key={attr.id || attr.name} className="space-y-1">
                        <div className="flex justify-between text-[10px] font-sans text-zinc-600">
                          <span>{attr.name}</span>
                          <span className="font-mono font-medium text-zinc-900">{attr.value}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-zinc-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-amber-500 to-zinc-900 rounded-full transition-all duration-500"
                            style={{ width: `${attr.value}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Decant Size Selector */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between text-xs text-zinc-600 font-sans">
                <span className="font-medium">Select Decant Volume:</span>
                <span className="text-zinc-400 text-[10px]">High-Pressure Atomizer</span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {product.sizes.map((s, idx) => (
                  <button
                    key={s.size}
                    onClick={() => setSelectedSizeIndex(idx)}
                    className={`py-2 text-xs font-sans tracking-wider uppercase border transition-all cursor-pointer ${
                      selectedSizeIndex === idx
                        ? 'border-zinc-950 bg-zinc-950 text-white shadow-md'
                        : 'border-zinc-200 bg-zinc-50 text-zinc-700 hover:border-zinc-400'
                    }`}
                  >
                    {s.size}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity and Add Button */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3">
                <div className="flex items-center border border-zinc-300">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-2 text-zinc-600 hover:bg-zinc-100 text-xs cursor-pointer"
                  >
                    -
                  </button>
                  <span className="px-3 py-2 text-xs font-medium font-mono min-w-[28px] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3 py-2 text-zinc-600 hover:bg-zinc-100 text-xs cursor-pointer"
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={handleAdd}
                  disabled={added}
                  className="flex-1 bg-zinc-950 hover:bg-zinc-800 text-white py-3 px-4 text-xs font-sans tracking-widest uppercase flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg"
                >
                  {added ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span>Added To Bag</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" />
                      <span>Add To Bag · ৳ {currentSize.price * quantity}</span>
                    </>
                  )}
                </button>
              </div>

              <div className="flex items-center justify-between text-[10px] text-zinc-500 font-sans pt-1 border-t border-zinc-150">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>100% Genuine decant filled in transit-safe sealed glass tube.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
