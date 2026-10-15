import React, { useState } from 'react';
import { X, Check, ShoppingBag, ShieldCheck } from 'lucide-react';
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

  const currentSize = product.sizes[selectedSizeIndex] || product.sizes[0];

  const handleAdd = () => {
    onAddToCart(product, currentSize.size, currentSize.price, quantity);
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
      onClose();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl bg-white shadow-2xl overflow-hidden border border-zinc-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-4 right-4 z-10 p-2 text-zinc-500 hover:text-black transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 sm:grid-cols-2">
          {/* Image */}
          <div className="bg-[#fcfcfc] p-6 sm:p-8 flex items-center justify-center border-b sm:border-b-0 sm:border-r border-zinc-150">
            <img
              src={product.image}
              alt={product.name}
              className="max-h-[280px] w-auto object-contain"
              referrerPolicy="no-referrer"
            />
          </div>

          {/* Details */}
          <div className="p-6 sm:p-8 flex flex-col justify-between space-y-6">
            <div className="space-y-2">
              <span className="text-[10px] tracking-[0.2em] font-sans text-zinc-400 uppercase">
                {product.brand} · {product.concentration || 'Eau de Parfum'}
              </span>
              <h2 className="font-serif text-2xl text-zinc-950 font-normal">
                {product.name}
              </h2>
              <p className="font-serif text-lg text-zinc-900 font-medium tabular-nums">
                ৳ {currentSize.price * quantity}
              </p>
              {product.notes && (
                <p className="text-xs text-zinc-500 font-sans pt-1">
                  <span className="font-medium text-zinc-700">Notes:</span> {product.notes.join(' · ')}
                </p>
              )}
            </div>

            {/* Decant Size Selector */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-zinc-600 font-sans">
                <span>Select Decant Volume:</span>
                <span className="text-zinc-400">Glass Atomizer</span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {product.sizes.map((s, idx) => (
                  <button
                    key={s.size}
                    onClick={() => setSelectedSizeIndex(idx)}
                    className={`py-2 text-xs font-sans tracking-wider uppercase border transition-colors cursor-pointer ${
                      selectedSizeIndex === idx
                        ? 'border-black bg-black text-white'
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
                    className="px-3 py-2 text-zinc-600 hover:bg-zinc-100 text-xs"
                  >
                    -
                  </button>
                  <span className="px-3 py-2 text-xs font-medium font-mono min-w-[28px] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3 py-2 text-zinc-600 hover:bg-zinc-100 text-xs"
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={handleAdd}
                  disabled={added}
                  className="flex-1 bg-zinc-950 hover:bg-zinc-800 text-white py-2.5 px-4 text-xs font-sans tracking-widest uppercase flex items-center justify-center gap-2 transition-colors cursor-pointer"
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

              <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 font-sans pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>100% Genuine decant filled in transit-safe sealed glass tube.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
