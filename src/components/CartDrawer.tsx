import React, { useState } from 'react';
import { X, Trash2, ShieldCheck, ArrowRight, CheckCircle2, PackageCheck } from 'lucide-react';
import { CartItem } from '../types';
import { submitOrder } from '../services/api';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQty: (productId: string, size: string, delta: number) => void;
  onRemoveItem: (productId: string, size: string) => void;
  onClearCart?: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQty,
  onRemoveItem,
  onClearCart
}) => {
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [cityZone, setCityZone] = useState<'inside_dhaka' | 'outside_dhaka'>('inside_dhaka');
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [submitting, setSubmitting] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const freeShippingThreshold = 3000;
  const progressPercent = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));

  const shippingFee = subtotal >= freeShippingThreshold ? 0 : (cityZone === 'outside_dhaka' ? 130 : 70);
  const estimatedTotal = subtotal + shippingFee;

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg(null);

    const orderPayload = {
      customer_name: customerName,
      customer_phone: customerPhone,
      customer_email: customerEmail,
      shipping_address: shippingAddress,
      city_zone: cityZone,
      payment_method: paymentMethod,
      items: items.map((it) => ({
        product_id: it.product.id,
        selected_size: it.selectedSize,
        quantity: it.quantity
      }))
    };

    try {
      const result = await submitOrder(orderPayload);
      if (result.success && result.data) {
        setCompletedOrder(result.data);
        if (onClearCart) onClearCart();
      } else {
        setErrorMsg(result.error || 'Failed to place order. Please try again.');
      }
    } catch (err: any) {
      setErrorMsg('Connection error during checkout. Please check server connection.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm animate-fade-in font-sans">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between border-l border-zinc-200">

          {/* Main Cart Drawer Header */}
          <div className="p-6 border-b border-zinc-150 flex items-center justify-between bg-zinc-950 text-white">
            <div>
              <h2 className="font-serif text-xl font-normal">
                Your Fragrance Bag
              </h2>
              <p className="text-[11px] text-zinc-400 font-sans tracking-wider uppercase mt-0.5">
                {items.length} {items.length === 1 ? 'Decant' : 'Decants'} Selected
              </p>
            </div>
            <button
              onClick={onClose}
              aria-label="Close cart"
              className="p-2 text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress */}
          {!completedOrder && (
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
          )}

          {/* Completed Order Confirmation View */}
          {completedOrder ? (
            <div className="flex-1 p-8 text-center space-y-6 overflow-y-auto flex flex-col justify-center items-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
                <PackageCheck className="w-10 h-10" />
              </div>

              <div>
                <span className="text-[10px] font-mono tracking-widest text-emerald-700 uppercase font-semibold">
                  Order Successfully Placed
                </span>
                <h3 className="font-serif text-2xl text-zinc-950 font-normal mt-1">
                  {completedOrder.order_number}
                </h3>
                <p className="text-xs text-zinc-600 mt-2">
                  Thank you, <span className="font-semibold text-zinc-900">{completedOrder.customer_name}</span>. Your order has been recorded in our Atelier system.
                </p>
              </div>

              <div className="w-full bg-zinc-50 border border-zinc-200 p-4 text-xs text-left space-y-2 font-sans">
                <div className="flex justify-between text-zinc-600">
                  <span>Order Total:</span>
                  <span className="font-mono font-bold text-zinc-950">৳ {completedOrder.total_amount}</span>
                </div>
                <div className="flex justify-between text-zinc-600">
                  <span>Payment Method:</span>
                  <span className="uppercase font-medium text-zinc-950">{completedOrder.payment_method} (COD)</span>
                </div>
                <div className="flex justify-between text-zinc-600">
                  <span>Status:</span>
                  <span className="text-emerald-700 font-semibold uppercase">{completedOrder.status}</span>
                </div>
              </div>

              <p className="text-[11px] text-zinc-500 leading-relaxed">
                Our decant artisan team will confirm your order via phone call before dispatch.
              </p>

              <button
                onClick={() => {
                  setCompletedOrder(null);
                  setIsCheckoutOpen(false);
                  onClose();
                }}
                className="w-full py-3 bg-zinc-950 hover:bg-zinc-800 text-white text-xs uppercase tracking-widest font-semibold transition-colors cursor-pointer"
              >
                Continue Shopping
              </button>
            </div>
          ) : isCheckoutOpen ? (
            /* Checkout Form Overlay View */
            <div className="flex-1 overflow-y-auto p-6 space-y-5 no-scrollbar">
              <div className="flex items-center justify-between border-b pb-3 border-zinc-200">
                <h3 className="font-serif text-lg font-normal text-zinc-950">
                  Delivery Details
                </h3>
                <button
                  type="button"
                  onClick={() => setIsCheckoutOpen(false)}
                  className="text-xs text-amber-700 font-medium hover:underline"
                >
                  ← Back to Bag
                </button>
              </div>

              {errorMsg && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs">
                  {errorMsg}
                </div>
              )}

              <form id="checkout-form" onSubmit={handleCheckoutSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-zinc-500 font-semibold mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Tanvir Ahmed"
                    className="w-full bg-zinc-50 border border-zinc-300 px-3 py-2 text-zinc-900 focus:outline-none focus:border-zinc-950"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-zinc-500 font-semibold mb-1">
                    Phone Number (Required for confirmation) *
                  </label>
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="01700000000"
                    className="w-full bg-zinc-50 border border-zinc-300 px-3 py-2 text-zinc-900 font-mono focus:outline-none focus:border-zinc-950"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-zinc-500 font-semibold mb-1">
                    Email Address (Optional)
                  </label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="tanvir@example.com"
                    className="w-full bg-zinc-50 border border-zinc-300 px-3 py-2 text-zinc-900 focus:outline-none focus:border-zinc-950"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-zinc-500 font-semibold mb-1">
                    Delivery Zone *
                  </label>
                  <select
                    value={cityZone}
                    onChange={(e) => setCityZone(e.target.value as any)}
                    className="w-full bg-zinc-50 border border-zinc-300 px-3 py-2 text-zinc-900 focus:outline-none focus:border-zinc-950"
                  >
                    <option value="inside_dhaka">Inside Dhaka (৳ 70)</option>
                    <option value="outside_dhaka">Outside Dhaka (৳ 130)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-zinc-500 font-semibold mb-1">
                    Full Delivery Address *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    placeholder="House/Apartment #, Road #, Area, District"
                    className="w-full bg-zinc-50 border border-zinc-300 px-3 py-2 text-zinc-900 focus:outline-none focus:border-zinc-950"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-zinc-500 font-semibold mb-1">
                    Payment Option
                  </label>
                  <div className="p-3 bg-zinc-50 border border-zinc-300 text-zinc-800 flex items-center justify-between">
                    <span className="font-medium">Cash / bKash / Nagad on Delivery</span>
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  </div>
                </div>
              </form>
            </div>
          ) : (
            /* Items List View */
            <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-12 space-y-3">
                  <p className="font-serif text-xl text-zinc-400 font-light">Your bag is empty.</p>
                  <p className="text-xs text-zinc-500 font-sans max-w-xs">
                    Explore our curated decants and experience luxury fragrances by the milliliter.
                  </p>
                  <button
                    onClick={onClose}
                    className="mt-4 px-6 py-2.5 bg-zinc-950 text-white text-xs tracking-wider uppercase font-sans hover:bg-zinc-800 transition-colors cursor-pointer"
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
                            className="text-zinc-400 hover:text-red-600 transition-colors p-1 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center border border-zinc-200 text-xs">
                          <button
                            onClick={() => onUpdateQty(item.product.id, item.selectedSize, -1)}
                            className="px-2 py-0.5 text-zinc-600 hover:bg-zinc-100 cursor-pointer"
                          >
                            -
                          </button>
                          <span className="px-2 py-0.5 font-mono text-[11px] min-w-[20px] text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => onUpdateQty(item.product.id, item.selectedSize, 1)}
                            className="px-2 py-0.5 text-zinc-600 hover:bg-zinc-100 cursor-pointer"
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
          )}

          {/* Footer & Action Buttons */}
          {items.length > 0 && !completedOrder && (
            <div className="p-6 border-t border-zinc-150 bg-[#fafafa] space-y-4">
              <div className="space-y-1.5 text-xs font-sans">
                <div className="flex items-center justify-between text-zinc-600">
                  <span>Subtotal</span>
                  <span className="font-medium text-zinc-950 tabular-nums">৳ {subtotal}</span>
                </div>
                <div className="flex items-center justify-between text-zinc-600">
                  <span>Nationwide Shipping</span>
                  <span className="text-zinc-500 font-mono">
                    {subtotal >= freeShippingThreshold ? 'FREE' : `৳ ${shippingFee}`}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm font-semibold text-zinc-950 pt-2 border-t border-zinc-200">
                  <span>Estimated Total</span>
                  <span className="font-serif text-lg tabular-nums">৳ {estimatedTotal}</span>
                </div>
              </div>

              {isCheckoutOpen ? (
                <button
                  type="submit"
                  form="checkout-form"
                  disabled={submitting}
                  className="w-full bg-amber-400 hover:bg-amber-300 text-black py-3.5 px-6 text-xs font-sans tracking-widest uppercase flex items-center justify-center gap-2 font-semibold transition-colors cursor-pointer"
                >
                  <span>{submitting ? 'CONFIRMING ORDER...' : `CONFIRM ORDER · ৳ ${estimatedTotal}`}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={() => setIsCheckoutOpen(true)}
                  className="w-full bg-zinc-950 hover:bg-zinc-800 text-white py-3.5 px-6 text-xs font-sans tracking-widest uppercase flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <span>PROCEED TO CHECKOUT</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}

              <div className="flex items-center justify-center gap-1.5 text-[10px] text-zinc-500 font-sans">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Verified SSL Order Protection & Hand Decanted Guarantee</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
