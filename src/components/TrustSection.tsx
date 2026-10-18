import React from 'react';
import { ShieldCheck, CheckCircle2 } from 'lucide-react';

interface TrustSectionProps {
  storeSettings?: any;
}

export const TrustSection: React.FC<TrustSectionProps> = ({ storeSettings }) => {
  const feeDhaka = storeSettings?.shipping_fee_dhaka || '70';
  const feeOutside = storeSettings?.shipping_fee_outside_dhaka || '130';
  const freeThreshold = storeSettings?.free_shipping_threshold || '3000';

  return (
    <section className="w-full bg-white pt-12 pb-16 border-b border-zinc-100">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <p className="text-[10px] tracking-[0.22em] font-sans text-zinc-400 uppercase font-medium">
            COMMUNITY
          </p>
          <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-normal text-zinc-950 mt-1 tracking-tight">
            Trusted, stocked, moving fast
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500 font-sans mt-1.5 font-light">
            A quick snapshot of what's live in the catalog right now.
          </p>
        </div>

        {/* Dense Grid matching screenshot structure */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Column 1 */}
          <div className="space-y-3">
            {/* Card 1 */}
            <div className="bg-[#fbfbfb] border border-zinc-150 p-4 rounded-xs min-h-[120px] flex flex-col justify-between">
              <p className="text-[9px] tracking-[0.16em] uppercase text-zinc-400 font-sans">
                LARGEST DECANT COLLECTION IN BD
              </p>
              <p className="font-serif text-2xl sm:text-3xl text-zinc-950 font-normal my-1 tabular-nums">
                1,000+
              </p>
              <p className="text-[10px] text-zinc-500 font-sans">
                Current Open Bottles Count
              </p>
            </div>

            {/* Card 6 */}
            <div className="bg-[#fbfbfb] border border-zinc-150 p-4 rounded-xs min-h-[120px] flex flex-col justify-between">
              <p className="text-[9px] tracking-[0.16em] uppercase text-zinc-400 font-sans">
                BRANDS WE OFFER
              </p>
              <p className="font-serif text-2xl sm:text-3xl text-zinc-950 font-normal my-1 tabular-nums">
                160+
              </p>
              <p className="text-[10px] text-zinc-500 font-sans">
                Unique Brands In Our Collection
              </p>
            </div>

            {/* Card 11 */}
            <div className="bg-[#fbfbfb] border border-zinc-150 p-4 rounded-xs min-h-[120px] flex flex-col justify-between">
              <p className="text-[9px] tracking-[0.16em] uppercase text-zinc-400 font-sans">
                TOTAL SOLD
              </p>
              <p className="font-serif text-2xl sm:text-3xl text-zinc-950 font-normal my-1 tabular-nums">
                89,000+
              </p>
              <p className="text-[10px] text-zinc-500 font-sans">
                Decant Count | Till Date
              </p>
            </div>
          </div>

          {/* Column 2 */}
          <div className="space-y-3">
            {/* Card 2 */}
            <div className="bg-[#fbfbfb] border border-zinc-150 p-4 rounded-xs min-h-[120px] flex flex-col justify-between">
              <p className="text-[9px] tracking-[0.16em] uppercase text-zinc-400 font-sans">
                CUSTOMERS
              </p>
              <p className="font-serif text-2xl sm:text-3xl text-zinc-950 font-normal my-1 tabular-nums">
                29,000+
              </p>
              <p className="text-[10px] text-zinc-500 font-sans">
                Fragheads We Served
              </p>
            </div>

            {/* Card 7 */}
            <div className="bg-[#fbfbfb] border border-zinc-150 p-4 rounded-xs min-h-[120px] flex flex-col justify-between">
              <p className="text-[9px] tracking-[0.16em] uppercase text-zinc-400 font-sans">
                AUTHENTIC | UNALTERED
              </p>
              <p className="font-sans text-xs sm:text-sm font-semibold text-zinc-900 my-1 leading-snug">
                100% Authenticity Guaranteed
              </p>
              <p className="text-[10px] text-zinc-500 font-sans">
                Decanted straight from originals
              </p>
            </div>

            {/* Card 12 */}
            <div className="bg-[#fbfbfb] border border-zinc-150 p-4 rounded-xs min-h-[120px] flex flex-col justify-between">
              <p className="text-[9px] tracking-[0.16em] uppercase text-zinc-400 font-sans">
                REGISTERED
              </p>
              <p className="font-mono text-xs sm:text-sm font-bold text-zinc-900 my-1">
                TL NO : 8024484
              </p>
              <p className="text-[10px] text-zinc-500 font-sans">
                + Labeling license pending
              </p>
            </div>
          </div>

          {/* Column 3 */}
          <div className="space-y-3">
            {/* Card 3 */}
            <div className="bg-[#fbfbfb] border border-zinc-150 p-4 rounded-xs min-h-[120px] flex flex-col justify-between">
              <p className="text-[9px] tracking-[0.16em] uppercase text-zinc-400 font-sans">
                DELIVERY (Dhaka ৳{feeDhaka} / Outside ৳{feeOutside})
              </p>
              <p className="font-sans text-xs sm:text-sm font-semibold text-zinc-900 my-1 leading-snug">
                Free Over ৳{freeThreshold}
              </p>
              <p className="text-[10px] text-zinc-500 font-sans">
                Nationwide | Door to door
              </p>
            </div>

            {/* Card 8 */}
            <div className="bg-[#fbfbfb] border border-zinc-150 p-4 rounded-xs min-h-[120px] flex flex-col justify-between">
              <p className="text-[9px] tracking-[0.16em] uppercase text-zinc-400 font-sans">
                COD
              </p>
              <p className="font-sans text-xs sm:text-sm font-semibold text-zinc-900 my-1 leading-snug">
                Cash on Delivery Nationwide
              </p>
              <p className="text-[10px] text-zinc-500 font-sans">
                Advance only on orders over BDT 5000
              </p>
            </div>

            {/* Card 13 */}
            <div className="bg-[#fbfbfb] border border-zinc-150 p-4 rounded-xs min-h-[120px] flex flex-col justify-between">
              <p className="text-[9px] tracking-[0.16em] uppercase text-zinc-400 font-sans">
                LEAK POLICY
              </p>
              <p className="font-sans text-xs sm:text-sm font-semibold text-zinc-900 my-1 leading-snug">
                Leak Protected During Shipping
              </p>
              <p className="text-[10px] text-zinc-500 font-sans">
                Immediate Exchange If Leaks | Breaks
              </p>
            </div>
          </div>

          {/* Column 4 */}
          <div className="space-y-3">
            {/* Card 4 */}
            <div className="bg-[#fbfbfb] border border-zinc-150 p-4 rounded-xs min-h-[120px] flex flex-col justify-between">
              <p className="text-[9px] tracking-[0.16em] uppercase text-zinc-400 font-sans">
                SUPPORT
              </p>
              <p className="font-sans text-xs sm:text-sm font-semibold text-zinc-900 my-1 leading-snug">
                WhatsApp | Insta DMs | Messenger
              </p>
              <p className="text-[10px] text-zinc-500 font-sans">
                18 Hours X 7 Days
              </p>
            </div>

            {/* Card 9 */}
            <div className="bg-[#fbfbfb] border border-zinc-150 p-4 rounded-xs min-h-[120px] flex flex-col justify-between">
              <p className="text-[9px] tracking-[0.16em] uppercase text-zinc-400 font-sans">
                DECANT SIZES
              </p>
              <p className="font-sans text-xs sm:text-sm font-semibold text-zinc-900 my-1">
                3ml · 5ml · 9ml · 15ml
              </p>
              <p className="text-[10px] text-zinc-500 font-sans">
                Flat Margins | Premium Sprayers
              </p>
            </div>

            {/* Card 14 */}
            <div className="bg-[#fbfbfb] border border-zinc-150 p-4 rounded-xs min-h-[120px] flex flex-col justify-between">
              <p className="text-[9px] tracking-[0.16em] uppercase text-zinc-400 font-sans">
                CURATED FOR BANGLADESH
              </p>
              <p className="font-sans text-xs sm:text-sm font-semibold text-zinc-900 my-1 leading-snug">
                For Dusty Air & Humidity
              </p>
              <p className="text-[10px] text-zinc-500 font-sans">
                Formal | Casual | Signature scents
              </p>
            </div>
          </div>

          {/* Column 5 - Multi-row detailed cards matching screenshot right column */}
          <div className="space-y-3 sm:col-span-2 lg:col-span-1">
            <div className="bg-[#fbfbfb] border border-zinc-150 p-4 rounded-xs flex flex-col justify-between space-y-3">
              <div>
                <p className="font-sans text-xs font-semibold text-zinc-900">
                  Fast Order Updates
                </p>
                <p className="text-[10px] text-zinc-500 font-sans">
                  Quick Issue Resolution
                </p>
              </div>

              <div>
                <p className="text-[9px] tracking-[0.16em] uppercase text-zinc-400 font-sans">
                  PACKAGING
                </p>
                <p className="font-sans text-xs font-semibold text-zinc-900">
                  Transit-safe packing
                </p>
                <p className="text-[10px] text-zinc-500 font-sans">
                  Complimentary Gift Boxes
                </p>
              </div>

              <div>
                <p className="text-[9px] tracking-[0.16em] uppercase text-zinc-400 font-sans">
                  100% MONEYBACK GUARANTEE
                </p>
                <p className="font-sans text-xs font-semibold text-zinc-900">
                  If Proven Unauthentic
                </p>
                <p className="text-[10px] text-zinc-500 font-sans">
                  Only True Decants
                </p>
              </div>

              <div>
                <p className="text-[9px] tracking-[0.16em] uppercase text-zinc-400 font-sans">
                  RESTOCKS | NEW STOCKS
                </p>
                <p className="font-sans text-xs font-semibold text-zinc-900">
                  Every Week
                </p>
                <p className="text-[10px] text-zinc-500 font-sans">
                  Runs Out Quick
                </p>
              </div>
            </div>

            <div className="bg-[#fbfbfb] border border-zinc-150 p-4 rounded-xs space-y-2">
              <div>
                <p className="text-[9px] tracking-[0.16em] uppercase text-zinc-400 font-sans">
                  QC'D ALWAYS
                </p>
                <p className="font-sans text-xs font-semibold text-zinc-900">
                  Freshly Decanted Only After Ordered
                </p>
                <p className="text-[10px] text-zinc-500 font-sans">
                  Labeled | Glass Bottles
                </p>
              </div>

              <div className="pt-2 border-t border-zinc-200">
                <p className="text-[9px] tracking-[0.16em] uppercase text-zinc-400 font-sans">
                  EMI
                </p>
                <p className="font-sans text-xs font-semibold text-zinc-900">
                  Buy Decants In Installments
                </p>
                <p className="text-[10px] text-zinc-500 font-sans">
                  Use Credit Cards, Pick SSLCOMMERZ On Checkout
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Payments Verification Strip */}
        <div className="mt-8 bg-[#fbfbfb] border border-zinc-150 p-4 sm:p-5 rounded-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="text-[9px] tracking-[0.2em] uppercase text-zinc-400 font-sans">
              PAYMENTS
            </p>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <h4 className="font-sans text-sm font-semibold text-zinc-900">
                Verified by SSLCommerz
              </h4>
            </div>
            <p className="text-[11px] text-zinc-500 font-sans">
              Visa · Mastercard · Amex · UnionPay · bKash · Nagad · Rocket · Upay + more
            </p>
          </div>

          {/* Payment Gateways Badges */}
          <div className="flex flex-wrap items-center gap-2 text-[10px] text-zinc-600 font-mono">
            <span className="px-2 py-1 bg-white border border-zinc-200 font-bold text-[#1a1f71]">VISA</span>
            <span className="px-2 py-1 bg-white border border-zinc-200 font-bold text-[#eb001b]">Mastercard</span>
            <span className="px-2 py-1 bg-white border border-zinc-200 font-bold text-[#006fcf]">AMEX</span>
            <span className="px-2 py-1 bg-[#e2136e] text-white font-bold">bKash</span>
            <span className="px-2 py-1 bg-[#f7931e] text-white font-bold">Nagad</span>
            <span className="px-2 py-1 bg-[#8c3494] text-white font-bold">Rocket</span>
            <span className="px-2 py-1 bg-white border border-zinc-200 font-semibold text-zinc-700">SSLCommerz 256-bit SSL</span>
          </div>
        </div>
      </div>
    </section>
  );
};
