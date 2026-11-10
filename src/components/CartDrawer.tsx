import React, { useState } from 'react';
import { X, Trash2, ShieldCheck, ArrowRight, PackageCheck } from 'lucide-react';
import { CartItem } from '../types';
import { submitOrder, getErrorMessage } from '../services/api';

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
        setErrorMsg(getErrorMessage(result?.error || result, 'Failed to place order. Please try again.'));
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
        <div
          className="w-screen max-w-md shadow-2xl flex flex-col justify-between border-l"
          style={{
            backgroundColor: 'var(--theme-surface-card)',
            borderColor: 'var(--theme-border-subtle)',
          }}
        >
          {/* Main Cart Drawer Header */}
          <div
            className="p-6 border-b flex items-center justify-between"
            style={{
              backgroundColor: 'var(--theme-primary)',
              color: 'var(--theme-btn-text)',
              borderColor: 'var(--theme-border-subtle)',
            }}
          >
            <div>
              <h2 className="font-serif text-xl font-normal">
                Your Fragrance Bag
              </h2>
              <p className="text-[11px] opacity-80 font-sans tracking-wider uppercase mt-0.5">
                {items.length} {items.length === 1 ? 'Decant' : 'Decants'} Selected
              </p>
            </div>
            <button
              onClick={onClose}
              aria-label="Close cart"
              className="p-2 opacity-80 hover:opacity-100 transition-opacity cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress */}
          {!completedOrder && (
            <div
              className="px-6 py-3 border-b"
              style={{
                backgroundColor: 'var(--theme-surface)',
                borderColor: 'var(--theme-border-subtle)',
              }}
            >
              <div className="flex items-center justify-between text-xs font-sans mb-1.5" style={{ color: 'var(--theme-text-primary)' }}>
                <span>
                  {subtotal >= freeShippingThreshold ? (
                    <span className="font-semibold" style={{ color: 'var(--theme-primary)' }}>You qualify for Free Nationwide Shipping!</span>
                  ) : (
                    <span>Add ৳ {freeShippingThreshold - subtotal} more for Free Shipping</span>
                  )}
                </span>
                <span className="font-mono text-[11px] opacity-75">{progressPercent}%</span>
              </div>
              <div className="w-full h-1.5 bg-black/10 overflow-hidden rounded-full">
                <div
                  className="h-full transition-all duration-300"
                  style={{
                    width: `${progressPercent}%`,
                    backgroundColor: 'var(--theme-primary)',
                  }}
                />
              </div>
            </div>
          )}

          {/* Completed Order Confirmation View */}
          {completedOrder ? (
            <div className="flex-1 p-8 text-center space-y-6 overflow-y-auto flex flex-col justify-center items-center">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center border"
                style={{
                  backgroundColor: 'var(--theme-surface)',
                  color: 'var(--theme-primary)',
                  borderColor: 'var(--theme-border-subtle)',
                }}
              >
                <PackageCheck className="w-10 h-10" />
              </div>

              <div>
                <span
                  className="text-[10px] font-mono tracking-widest uppercase font-semibold"
                  style={{ color: 'var(--theme-primary)' }}
                >
                  Order Successfully Placed
                </span>
                <h3 className="font-serif text-2xl font-normal mt-1" style={{ color: 'var(--theme-text-primary)' }}>
                  {completedOrder.order_number}
                </h3>
                <p className="text-xs opacity-80 mt-2" style={{ color: 'var(--theme-text-primary)' }}>
                  Thank you, <span className="font-semibold">{completedOrder.customer_name}</span>. Your order has been recorded in our Atelier system.
                </p>
              </div>

              <div
                className="w-full border p-4 text-xs text-left space-y-2 font-sans"
                style={{
                  backgroundColor: 'var(--theme-surface)',
                  borderColor: 'var(--theme-border-subtle)',
                }}
              >
                <div className="flex justify-between" style={{ color: 'var(--theme-text-secondary)' }}>
                  <span>Order Total:</span>
                  <span className="font-mono font-bold" style={{ color: 'var(--theme-primary)' }}>৳ {completedOrder.total_amount}</span>
                </div>
                <div className="flex justify-between" style={{ color: 'var(--theme-text-secondary)' }}>
                  <span>Payment Method:</span>
                  <span className="uppercase font-medium" style={{ color: 'var(--theme-primary)' }}>{completedOrder.payment_method} (COD)</span>
                </div>
                <div className="flex justify-between" style={{ color: 'var(--theme-text-secondary)' }}>
                  <span>Status:</span>
                  <span className="font-semibold uppercase" style={{ color: 'var(--theme-primary)' }}>{completedOrder.status}</span>
                </div>
              </div>

              <p className="text-[11px] opacity-75 leading-relaxed" style={{ color: 'var(--theme-text-secondary)' }}>
                Our decant artisan team will confirm your order via phone call before dispatch.
              </p>

              <button
                onClick={() => {
                  setCompletedOrder(null);
                  setIsCheckoutOpen(false);
                  onClose();
                }}
                className="w-full py-3 text-xs uppercase tracking-widest font-semibold transition-opacity cursor-pointer"
                style={{
                  backgroundColor: 'var(--theme-btn-bg)',
                  color: 'var(--theme-btn-text)',
                }}
              >
                Continue Shopping
              </button>
            </div>
          ) : isCheckoutOpen ? (
            /* Checkout Form Overlay View */
            <div className="flex-1 overflow-y-auto p-6 space-y-5 no-scrollbar">
              <div
                className="flex items-center justify-between border-b pb-3"
                style={{ borderColor: 'var(--theme-border-subtle)' }}
              >
                <h3 className="font-serif text-lg font-normal" style={{ color: 'var(--theme-text-primary)' }}>
                  Delivery Details
                </h3>
                <button
                  type="button"
                  onClick={() => setIsCheckoutOpen(false)}
                  className="text-xs font-medium hover:underline cursor-pointer"
                  style={{ color: 'var(--theme-primary)' }}
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
                  <label className="block text-[10px] uppercase tracking-wider font-semibold mb-1" style={{ color: 'var(--theme-text-secondary)' }}>
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Tanvir Ahmed"
                    className="w-full border px-3 py-2 focus:outline-none"
                    style={{
                      backgroundColor: 'var(--theme-surface)',
                      borderColor: 'var(--theme-border-subtle)',
                      color: 'var(--theme-text-primary)',
                    }}
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-wider font-semibold mb-1" style={{ color: 'var(--theme-text-secondary)' }}>
                    Phone Number (Required for confirmation) *
                  </label>
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="01700000000"
                    className="w-full border px-3 py-2 font-mono focus:outline-none"
                    style={{
                      backgroundColor: 'var(--theme-surface)',
                      borderColor: 'var(--theme-border-subtle)',
                      color: 'var(--theme-text-primary)',
                    }}
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-wider font-semibold mb-1" style={{ color: 'var(--theme-text-secondary)' }}>
                    Email Address (Optional)
                  </label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="tanvir@example.com"
                    className="w-full border px-3 py-2 focus:outline-none"
                    style={{
                      backgroundColor: 'var(--theme-surface)',
                      borderColor: 'var(--theme-border-subtle)',
                      color: 'var(--theme-text-primary)',
                    }}
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-wider font-semibold mb-1" style={{ color: 'var(--theme-text-secondary)' }}>
                    Delivery Zone *
                  </label>
                  <select
                    value={cityZone}
                    onChange={(e) => setCityZone(e.target.value as any)}
                    className="w-full border px-3 py-2 focus:outline-none cursor-pointer"
                    style={{
                      backgroundColor: 'var(--theme-surface)',
                      borderColor: 'var(--theme-border-subtle)',
                      color: 'var(--theme-text-primary)',
                    }}
                  >
                    <option value="inside_dhaka">Inside Dhaka (৳ 70)</option>
                    <option value="outside_dhaka">Outside Dhaka (৳ 130)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-wider font-semibold mb-1" style={{ color: 'var(--theme-text-secondary)' }}>
                    Full Delivery Address *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    placeholder="House/Apartment #, Road #, Area, District"
                    className="w-full border px-3 py-2 focus:outline-none"
                    style={{
                      backgroundColor: 'var(--theme-surface)',
                      borderColor: 'var(--theme-border-subtle)',
                      color: 'var(--theme-text-primary)',
                    }}
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-wider font-semibold mb-1" style={{ color: 'var(--theme-text-secondary)' }}>
                    Payment Option
                  </label>
                  <div
                    className="p-3 border flex items-center justify-between"
                    style={{
                      backgroundColor: 'var(--theme-surface)',
                      borderColor: 'var(--theme-border-subtle)',
                      color: 'var(--theme-text-primary)',
                    }}
                  >
                    <span className="font-medium">Cash / bKash / Nagad on Delivery</span>
                    <ShieldCheck className="w-4 h-4" style={{ color: 'var(--theme-primary)' }} />
                  </div>
                </div>
              </form>
            </div>
          ) : (
            /* Items List View */
            <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-12 space-y-3">
                  <p className="font-serif text-xl opacity-60 font-light" style={{ color: 'var(--theme-text-primary)' }}>Your bag is empty.</p>
                  <p className="text-xs opacity-70 font-sans max-w-xs" style={{ color: 'var(--theme-text-secondary)' }}>
                    Explore our curated decants and experience luxury fragrances by the milliliter.
                  </p>
                  <button
                    onClick={onClose}
                    className="mt-4 px-6 py-2.5 text-xs tracking-wider uppercase font-sans hover:opacity-90 transition-opacity cursor-pointer"
                    style={{
                      backgroundColor: 'var(--theme-btn-bg)',
                      color: 'var(--theme-btn-text)',
                    }}
                  >
                    Explore Decants
                  </button>
                </div>
              ) : (
                items.map((item) => (
                  <div
                    key={`${item.product.id}-${item.selectedSize}`}
                    className="flex gap-4 pb-4 border-b last:border-b-0"
                    style={{ borderColor: 'var(--theme-border-subtle)' }}
                  >
                    <div
                      className="w-20 h-20 border p-2 shrink-0 flex items-center justify-center"
                      style={{
                        backgroundColor: 'var(--theme-surface)',
                        borderColor: 'var(--theme-border-subtle)',
                      }}
                    >
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
                            <p
                              className="text-[9px] font-sans tracking-widest uppercase font-bold"
                              style={{ color: 'var(--theme-secondary)' }}
                            >
                              {item.product.brand}
                            </p>
                            <h4
                              className="font-serif text-sm font-normal"
                              style={{ color: 'var(--theme-text-primary)' }}
                            >
                              {item.product.name}
                            </h4>
                            <span
                              className="inline-block mt-0.5 text-[10px] font-sans font-medium px-1.5 py-0.2 border"
                              style={{
                                backgroundColor: 'var(--theme-surface)',
                                borderColor: 'var(--theme-border-subtle)',
                                color: 'var(--theme-text-primary)',
                              }}
                            >
                              {item.selectedSize} Atomizer
                            </span>
                          </div>
                          <button
                            onClick={() => onRemoveItem(item.product.id, item.selectedSize)}
                            aria-label="Remove item"
                            className="opacity-60 hover:opacity-100 transition-opacity p-1 cursor-pointer"
                            style={{ color: 'var(--theme-primary)' }}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <div
                          className="flex items-center border text-xs"
                          style={{ borderColor: 'var(--theme-border-subtle)' }}
                        >
                          <button
                            onClick={() => onUpdateQty(item.product.id, item.selectedSize, -1)}
                            className="px-2 py-0.5 hover:opacity-70 cursor-pointer"
                            style={{ color: 'var(--theme-text-primary)' }}
                          >
                            -
                          </button>
                          <span
                            className="px-2 py-0.5 font-mono text-[11px] min-w-[20px] text-center"
                            style={{ color: 'var(--theme-text-primary)' }}
                          >
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => onUpdateQty(item.product.id, item.selectedSize, 1)}
                            className="px-2 py-0.5 hover:opacity-70 cursor-pointer"
                            style={{ color: 'var(--theme-text-primary)' }}
                          >
                            +
                          </button>
                        </div>
                        <p
                          className="font-sans text-xs font-semibold tabular-nums"
                          style={{ color: 'var(--theme-primary)' }}
                        >
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
            <div
              className="p-6 border-t space-y-4"
              style={{
                backgroundColor: 'var(--theme-surface)',
                borderColor: 'var(--theme-border-subtle)',
              }}
            >
              <div className="space-y-1.5 text-xs font-sans">
                <div className="flex items-center justify-between" style={{ color: 'var(--theme-text-secondary)' }}>
                  <span>Subtotal</span>
                  <span className="font-medium tabular-nums" style={{ color: 'var(--theme-text-primary)' }}>৳ {subtotal}</span>
                </div>
                <div className="flex items-center justify-between" style={{ color: 'var(--theme-text-secondary)' }}>
                  <span>Nationwide Shipping</span>
                  <span className="font-mono" style={{ color: 'var(--theme-text-primary)' }}>
                    {subtotal >= freeShippingThreshold ? 'FREE' : `৳ ${shippingFee}`}
                  </span>
                </div>
                <div
                  className="flex items-center justify-between text-sm font-semibold pt-2 border-t"
                  style={{
                    borderColor: 'var(--theme-border-subtle)',
                    color: 'var(--theme-text-primary)',
                  }}
                >
                  <span>Estimated Total</span>
                  <span className="font-serif text-lg tabular-nums" style={{ color: 'var(--theme-primary)' }}>৳ {estimatedTotal}</span>
                </div>
              </div>

              {isCheckoutOpen ? (
                <button
                  type="submit"
                  form="checkout-form"
                  disabled={submitting}
                  className="w-full py-3.5 px-6 text-xs font-sans tracking-widest uppercase flex items-center justify-center gap-2 font-semibold transition-opacity cursor-pointer shadow-md"
                  style={{
                    backgroundColor: 'var(--theme-btn-bg)',
                    color: 'var(--theme-btn-text)',
                  }}
                >
                  <span>{submitting ? 'CONFIRMING ORDER...' : `CONFIRM ORDER · ৳ ${estimatedTotal}`}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={() => setIsCheckoutOpen(true)}
                  className="w-full py-3.5 px-6 text-xs font-sans tracking-widest uppercase flex items-center justify-center gap-2 transition-opacity cursor-pointer shadow-md"
                  style={{
                    backgroundColor: 'var(--theme-btn-bg)',
                    color: 'var(--theme-btn-text)',
                  }}
                >
                  <span>PROCEED TO CHECKOUT</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}

              <div
                className="flex items-center justify-center gap-1.5 text-[10px] font-sans opacity-70"
                style={{ color: 'var(--theme-text-secondary)' }}
              >
                <ShieldCheck className="w-3.5 h-3.5" style={{ color: 'var(--theme-primary)' }} />
                <span>Verified SSL Order Protection & Hand Decanted Guarantee</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
