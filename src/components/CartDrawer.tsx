import React from 'react';
import { X, Trash2, ShieldCheck, ArrowRight } from 'lucide-react';
import { CartItem } from '../types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQty: (productId: string, size: string, delta: number) => void;
  onRemoveItem: (productId: string, size: string) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQty,
  onRemoveItem
}) => {
  if (!isOpen) return null;

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const freeShippingThreshold = 3000;
  const progressPercent = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between border-l border-zinc-200">
          {/* Header */}
          <div className="p-6 border-b border-zinc-150 flex items-center justify-between">
            <div>
              <h2 className="font-serif text-xl font-normal text-zinc-950">
                Your Fragrance Bag
              </h2>
              <p className="text-[11px] text-zinc-400 font-sans tracking-wider uppercase mt-0.5">
                {items.length} {items.length === 1 ? 'Decant' : 'Decants'} Selected
              </p>
            </div>
            <button
              onClick={onClose}
              aria-label="Close cart"
              className="p-2 text-zinc-500 hover:text-black transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free shipping progress */}
          <div className="px-6 py-3 bg-[#fafafa] border-b border-zinc-150">
            <div className="flex items-center justify-between text-xs text-zinc-700 font-sans mb-1.5">
              <span>
                {subtotal >= freeShippingThreshold ? (
                  <span className="text-emerald-700 font-medium">You qualify for Free Nationwide Shipping!</span>
                ) : (
                  <span>Add ৳ {freeShippingThreshold - subtotal} more for Free Shipping</span>
                )}
              </span>
              <span className="font-mono text-[11px] text-zinc-500">{progressPercent}%</span>
            </div>
            <div className="w-full h-1.5 bg-zinc-200 overflow-hidden">
              <div
                className="h-full bg-zinc-900 transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12 space-y-3">
                <p className="font-serif text-xl text-zinc-400 font-light">Your bag is empty.</p>
                <p className="text-xs text-zinc-500 font-sans max-w-xs">
                  Explore our curated decants and experience luxury fragrances by the milliliter.
                </p>
                <button
                  onClick={onClose}
                  className="mt-4 px-6 py-2.5 bg-zinc-950 text-white text-xs tracking-wider uppercase font-sans hover:bg-zinc-800 transition-colors"
                >
                  Explore Decants
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={`${item.product.id}-${item.selectedSize}`}
                  className="flex gap-4 pb-4 border-b border-zinc-100 last:border-b-0"
                >
                  <div className="w-20 h-20 bg-[#f9f9f9] border border-zinc-200 p-2 shrink-0 flex items-center justify-center">
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="max-h-full max-w-full object-contain"
                      referrerPolicy="no-referrer"
                    />
                  </div>

                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-[9px] font-sans tracking-widest text-zinc-400 uppercase">
                            {item.product.brand}
                          </p>
                          <h4 className="font-serif text-sm font-normal text-zinc-900">
                            {item.product.name}
                          </h4>
                          <span className="inline-block mt-0.5 text-[10px] font-sans font-medium bg-zinc-100 text-zinc-700 px-1.5 py-0.2">
                            {item.selectedSize} Atomizer
                          </span>
                        </div>
                        <button
                          onClick={() => onRemoveItem(item.product.id, item.selectedSize)}
                          aria-label="Remove item"
                          className="text-zinc-400 hover:text-red-600 transition-colors p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center border border-zinc-200 text-xs">
                        <button
                          onClick={() => onUpdateQty(item.product.id, item.selectedSize, -1)}
                          className="px-2 py-0.5 text-zinc-600 hover:bg-zinc-100"
                        >
                          -
                        </button>
                        <span className="px-2 py-0.5 font-mono text-[11px] min-w-[20px] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => onUpdateQty(item.product.id, item.selectedSize, 1)}
                          className="px-2 py-0.5 text-zinc-600 hover:bg-zinc-100"
                        >
                          +
                        </button>
                      </div>
                      <p className="font-sans text-xs font-semibold text-zinc-950 tabular-nums">
                        ৳ {item.price * item.quantity}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer & Checkout */}
          {items.length > 0 && (
            <div className="p-6 border-t border-zinc-150 bg-[#fafafa] space-y-4">
              <div className="space-y-1.5 text-xs font-sans">
                <div className="flex items-center justify-between text-zinc-600">
                  <span>Subtotal</span>
                  <span className="font-medium text-zinc-950 tabular-nums">৳ {subtotal}</span>
                </div>
                <div className="flex items-center justify-between text-zinc-600">
                  <span>Nationwide Shipping</span>
                  <span className="text-zinc-500">
                    {subtotal >= freeShippingThreshold ? 'FREE' : 'Calculated at checkout'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm font-semibold text-zinc-950 pt-2 border-t border-zinc-200">
                  <span>Estimated Total</span>
                  <span className="font-serif text-lg tabular-nums">৳ {subtotal}</span>
                </div>
              </div>

              <button
                onClick={() => {
                  alert(`Proceeding to SSLCommerz Secure Checkout for ৳ ${subtotal}. Supported: bKash, Nagad, Visa, Mastercard.`);
                }}
                className="w-full bg-zinc-950 hover:bg-zinc-800 text-white py-3 px-6 text-xs font-sans tracking-widest uppercase flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <span>PROCEED TO CHECKOUT</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[10px] text-zinc-500 font-sans">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Encrypted 256-bit checkout via SSLCommerz</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
