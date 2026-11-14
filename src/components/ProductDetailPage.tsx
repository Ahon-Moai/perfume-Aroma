import { scrollToTop } from '../lib/motion';
import React, { useState, useEffect } from 'react';
import {
  ChevronRight,
  ShoppingBag,
  ShieldCheck,
  Share2,
  Check,
  Sparkles,
  Layers,
  ArrowLeft,
  Info,
  Clock,
  Droplets,
  PackageCheck,
  Flame
} from 'lucide-react';
import { FragranceProduct, DecantSize, MainAccord } from '../types';
import { categoryOf } from '../lib/brandCategory';

const HOUSE_LABEL: Record<string, string> = { Arabian: 'Arabian', Designer: 'Designer', Niche: 'Niche' };
const shortConc = (c?: string) => {
  const t = (c || '').toLowerCase();
  if (t.includes('extrait')) return 'Extrait';
  if (t.includes('toilette') || t === 'edt') return 'EDT';
  if (t.includes('cologne')) return 'Cologne';
  if (t === 'parfum') return 'Parfum';
  return 'EDP';
};
// [match, label, light, deep] — soft glow gradient per scent family
const FAMILY_SIMPLE: [string, string, string, string][] = [
  ['fresh', 'Fresh', '#e2f4ff', '#93d0f5'], ['citrus', 'Fresh', '#e2f4ff', '#93d0f5'], ['aquatic', 'Fresh', '#e2f4ff', '#93d0f5'],
  ['gourmand', 'Sweet', '#ffe6ee', '#ffaac4'], ['sweet', 'Sweet', '#ffe6ee', '#ffaac4'], ['vanilla', 'Sweet', '#ffe6ee', '#ffaac4'],
  ['floral', 'Floral', '#ffe1ef', '#f6a8cc'], ['fruity', 'Fruity', '#ffeadb', '#ffb58a'], ['wood', 'Woody', '#f3e8dc', '#cfae8c'],
  ['amber', 'Warm', '#fbe9d2', '#e9b27a'], ['oriental', 'Warm', '#fbe9d2', '#e9b27a'], ['spic', 'Warm', '#fbe9d2', '#e9b27a'], ['oud', 'Warm', '#fbe9d2', '#e9b27a'],
  ['musk', 'Musky', '#efe9fb', '#c6b4ef'], ['powder', 'Musky', '#efe9fb', '#c6b4ef'], ['aromatic', 'Aromatic', '#e5f4ea', '#9fd1b0'], ['herbal', 'Aromatic', '#e5f4ea', '#9fd1b0'],
  ['leather', 'Leather', '#efe4dc', '#b98d6c'],
];
const famMatch = (f: string) => FAMILY_SIMPLE.find(([k]) => f.toLowerCase().includes(k));
const familyLabel = (f: string) => famMatch(f)?.[1] || f.replace(/\b\w/g, (c) => c.toUpperCase());
const familyGlow = (f: string) => { const m = famMatch(f); return { '--c1': m?.[2] || '#f1f1f2', '--c2': m?.[3] || '#cfcfd4' } as React.CSSProperties; };

interface ProductDetailPageProps {
  product: FragranceProduct | null;
  allProducts: FragranceProduct[];
  onNavigateHome: () => void;
  onNavigateToProduct: (product: FragranceProduct) => void;
  onAddToCart: (product: FragranceProduct, size: string, price: number, qty: number) => void;
  onBuyNow: (product: FragranceProduct, size: string, price: number, qty: number) => void;
  showToast: (msg: string) => void;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({
  product,
  allProducts,
  onNavigateHome,
  onNavigateToProduct,
  onAddToCart,
  onBuyNow,
  showToast
}) => {
  // If product not found
  if (!product) {
    return (
      <div
        className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-20 text-center select-none"
        style={{
          backgroundColor: 'var(--theme-bg)',
          color: 'var(--theme-text-primary)',
        }}
      >
        <div className="max-w-md space-y-4">
          <span
            className="text-xs font-mono tracking-widest uppercase font-bold"
            style={{ color: 'var(--theme-secondary)' }}
          >
            PURE PORTIONS CATALOGUE
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl" style={{ color: 'var(--theme-primary)' }}>
            Fragrance Not Found
          </h1>
          <p className="text-sm font-sans leading-relaxed opacity-80" style={{ color: 'var(--theme-text-secondary)' }}>
            The decant edition you are looking for may have been archived or is currently out of stock.
          </p>
          <div className="pt-4">
            <button
              onClick={onNavigateHome}
              className="inline-flex items-center gap-2 px-6 py-3 text-xs font-sans uppercase tracking-widest transition-all shadow-md cursor-pointer rounded-xs hover:opacity-90"
              style={{
                backgroundColor: 'var(--theme-btn-bg)',
                color: 'var(--theme-btn-text)',
              }}
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Return To Boutique</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Product Images Array setup
  const galleryImages = Array.from(
    new Set(
      [
        product.image,
        ...(product.images || []),
        ...(product.additionalImages || [])
      ].filter(Boolean)
    )
  );

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedSizeIndex, setSelectedSizeIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [activeTab, setActiveTab] = useState<'notes' | 'specs' | 'care'>('notes');

  // Reset image and size selection when product changes
  useEffect(() => {
    setSelectedImageIndex(0);
    const firstOpen = product.sizes.findIndex((s) => !s.soldOut);
    setSelectedSizeIndex(firstOpen >= 0 ? firstOpen : 0);
    setQuantity(1);
    setAdded(false);
    scrollToTop();
  }, [product.id]);

  const activeImage = galleryImages[selectedImageIndex] || product.image;
  const currentSize: DecantSize = product.sizes[selectedSizeIndex] || product.sizes[0] || { size: '5ml', price: product.startingPrice };
  const totalPrice = currentSize.price * quantity;
  const isSoldOut = !!currentSize.soldOut;

  // A decant atomizer gives roughly 15 sprays per ml
  const sprayInfo = (() => {
    const ml = parseFloat(String(currentSize.size).replace(/[^\d.]/g, ''));
    if (!ml) return null;
    const sprays = ml < 5 ? Math.round(ml * 15) : Math.round((ml * 15) / 5) * 5;
    const d = Math.round(sprays / 6);
    const days = d >= 60 ? `${Math.round(d / 30)} months` : d >= 14 ? `${Math.round(d / 7)} weeks` : `${d} days`;
    return { sprays, days };
  })();

  // Simple facts for the minimal layout
  const spx: any = product.scentProfile || product.scent_profile || {};
  const description = (product.shortDescription || spx.scentDescription || product.description || '').trim();
  const families = Array.from(
    new Map(((spx.fragranceFamilies || []) as string[]).map((f) => [familyLabel(f), f])).values()
  ).slice(0, 4);
  const noteList: string[] = (product.notes && product.notes.length
    ? product.notes
    : [...(product.topNotes || spx.topNotes || []), ...(product.heartNotes || spx.heartNotes || []), ...(product.baseNotes || spx.baseNotes || [])]
  ).filter(Boolean);
  const cap = (t: string) => t.replace(/\b\w/g, (c) => c.toUpperCase());
  const seasons: string[] = (spx.seasons || []).map((x: string) => (x === 'All Seasons' ? 'All year' : x));
  const dn: string[] = spx.daytimeNighttime || [];
  const bestFor = dn.length === 0 ? '' : dn.length > 1 ? 'Day & night' : /night/i.test(dn[0]) ? 'Night' : 'Day';
  const lasts = (() => {
    const l = String(spx.longevity || '').toLowerCase();
    if (!l) return '';
    if (/light|2|soft/.test(l) && !/8|12|long|eternal/.test(l)) return 'Light';
    if (/moderate|4|6/.test(l) && !/8|12|long|eternal/.test(l)) return 'Moderate';
    return 'Long-lasting';
  })();
  const facts: [string, string][] = ([
    ['Notes', Array.from(new Set(noteList.map(cap))).slice(0, 6).join(', ')],
    ['Season', seasons.join(' · ')],
    ['Best for', bestFor],
    ['Lasts', lasts],
  ] as [string, string][]).filter(([, v]) => !!v);

  const handleAddToCartClick = () => {
    if (isSoldOut) return;
    onAddToCart(product, currentSize.size, currentSize.price, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const handleBuyNowClick = () => {
    if (isSoldOut) return;
    onBuyNow(product, currentSize.size, currentSize.price, quantity);
  };

  const handleCopyShareLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    showToast('Product link copied to clipboard');
    setTimeout(() => setCopiedLink(false), 2400);
  };

  // Attributes / Performance meters fallback
  const attributes = Array.isArray(product.attributes) && product.attributes.length > 0
    ? product.attributes.filter((a) => a.enabled !== false)
    : [
        { id: 'longevity', name: 'Longevity', value: 88, enabled: true },
        { id: 'sillage', name: 'Sillage', value: 82, enabled: true },
        { id: 'projection', name: 'Projection', value: 78, enabled: true },
        { id: 'versatility', name: 'Versatility', value: 92, enabled: true }
      ];

  const sp = product.scentProfile || product.scent_profile || {};
  const accordsList: MainAccord[] = Array.isArray(sp.accords) && sp.accords.length > 0
    ? sp.accords
    : (Array.isArray(product.accords) && product.accords.length > 0 ? product.accords : []);

  // Related products (exclude current product)
  const relatedProducts = allProducts
    .filter((p) => p.id !== product.id)
    .slice(0, 4);

  return (
    <div
      className="min-h-screen select-none transition-colors duration-250"
      style={{
        backgroundColor: 'var(--theme-bg)',
        color: 'var(--theme-text-primary)',
      }}
    >
      {/* 1. Top Breadcrumb & Navigation Bar */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-4">
        <div
          className="flex items-center justify-between border-b pb-3 text-xs font-sans"
          style={{ borderColor: 'var(--theme-border-subtle)', color: 'var(--theme-text-secondary)' }}
        >
          <div className="flex items-center gap-2 truncate">
            <button
              onClick={onNavigateHome}
              className="transition-colors uppercase tracking-wider text-[11px] font-bold hover:opacity-80 cursor-pointer"
              style={{ color: 'var(--theme-primary)' }}
            >
              Home
            </button>
            <ChevronRight className="w-3 h-3 shrink-0 opacity-50" />
            <span className="uppercase tracking-wider text-[11px] shrink-0 opacity-70">
              {product.brand}
            </span>
            <ChevronRight className="w-3 h-3 shrink-0 opacity-50" />
            <span className="font-bold truncate text-[11px]" style={{ color: 'var(--theme-primary)' }}>
              {product.name}
            </span>
          </div>

          <button
            onClick={onNavigateHome}
            className="hidden sm:flex items-center gap-1.5 transition-colors text-[11px] uppercase tracking-wider shrink-0 cursor-pointer font-bold hover:opacity-80"
            style={{ color: 'var(--theme-primary)' }}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Catalogue</span>
          </button>
        </div>
      </div>

      {/* 2. Main Product Hero (Gallery + Product Info Two-Column Grid) */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-start">

          {/* A. PRODUCT GALLERY (Columns 1 to 7 on desktop) */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            {/* Main Image Stage */}
            <div
              className="pp-noborder relative w-full aspect-square sm:aspect-[4/3] lg:aspect-square border shadow-xs flex items-center justify-center p-6 sm:p-10 overflow-hidden group rounded-xs"
              style={{
                backgroundColor: 'var(--theme-surface-card)',
                borderColor: 'var(--theme-border-subtle)',
              }}
            >
              <img
                src={activeImage}
                alt={product.name}
                className="max-h-[82%] max-w-[82%] object-contain drop-shadow-xl transition-transform duration-500 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />


              {/* Share Floating Action */}
              <button
                onClick={handleCopyShareLink}
                className="absolute top-4 right-4 p-2.5 border shadow-sm rounded-full cursor-pointer z-10 hover:opacity-80 transition-all"
                style={{
                  backgroundColor: 'var(--theme-surface)',
                  borderColor: 'var(--theme-border-subtle)',
                  color: 'var(--theme-primary)',
                }}
                title="Share product link"
              >
                {copiedLink ? (
                  <Check className="w-4 h-4 text-emerald-500" />
                ) : (
                  <Share2 className="w-4 h-4" />
                )}
              </button>

            </div>

            {/* Thumbnail Navigation Row */}
            {galleryImages.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-1">
                {galleryImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    className="relative w-20 h-20 sm:w-24 sm:h-24 border transition-all cursor-pointer p-2 shrink-0 flex items-center justify-center rounded-xs"
                    style={{
                      backgroundColor: 'var(--theme-surface-card)',
                      borderColor: selectedImageIndex === idx ? 'var(--theme-primary)' : 'var(--theme-border-subtle)',
                      boxShadow: selectedImageIndex === idx ? '0 0 0 1.5px var(--theme-primary)' : 'none',
                    }}
                  >
                    <img
                      src={img}
                      alt={`${product.name} angle ${idx + 1}`}
                      className="max-h-full max-w-full object-contain"
                      referrerPolicy="no-referrer"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* B. PRODUCT INFORMATION (Columns 8 to 12 on desktop) */}
          <div
            className="pp-noborder lg:col-span-5 flex flex-col justify-between space-y-6 p-6 sm:p-8 border shadow-xs rounded-xs"
            style={{
              backgroundColor: 'var(--theme-surface-card)',
              borderColor: 'var(--theme-border-subtle)',
            }}
          >
            <div className="space-y-4">
              {/* Minimal premium header: brand · house, name, type · for */}
              <div>
                <span className="text-[10px] font-sans tracking-[0.3em] uppercase" style={{ color: 'var(--theme-text-secondary)' }}>
                  {product.brand} · {HOUSE_LABEL[categoryOf(product.brand, product.category)]}
                </span>
                <h1 className="pp-pd-name mt-2" style={{ color: 'var(--theme-primary)' }}>{product.name}</h1>
                <p className="text-[11px] font-sans tracking-[0.08em] uppercase mt-1.5" style={{ color: 'var(--theme-text-secondary)' }}>
                  {shortConc(product.concentration)}{product.gender ? ` · For ${product.gender}` : ''}
                </p>
              </div>

              {description && (
                <p className="text-sm font-sans leading-relaxed" style={{ color: 'var(--theme-text-secondary)' }}>
                  {description}
                </p>
              )}

              {families.length > 0 && (
                <div className="pp-scent-row">
                  {families.map((f) => (
                    <span key={f} className="pp-scent-chip" style={familyGlow(f)}>{familyLabel(f)}</span>
                  ))}
                </div>
              )}

              {facts.length > 0 && (
                <div className="pp-pd-facts">
                  {facts.map(([k, v]) => (
                    <div key={k}>
                      <span>{k}</span>
                      {k === 'Notes' ? (
                        <b className="pp-notes">
                          {v.split(', ').map((n, i) => (
                            <React.Fragment key={n}>{i > 0 && <em aria-hidden="true">✦</em>}{n}</React.Fragment>
                          ))}
                        </b>
                      ) : <b>{v}</b>}
                    </div>
                  ))}
                </div>
              )}

              {/* Size selector — compact Apple-style liquid glass pills */}
              <div className="space-y-2.5 pt-1">
                <span className="text-[11px] font-sans tracking-[0.2em] uppercase opacity-70" style={{ color: 'var(--theme-text-secondary)' }}>
                  Size
                </span>
                <div className="pp-glass-group" role="radiogroup" aria-label="Choose size">
                  {product.sizes.map((s, idx) => {
                    const isSelected = selectedSizeIndex === idx;
                    return (
                      <button
                        key={s.size || idx}
                        type="button"
                        role="radio"
                        aria-checked={isSelected}
                        aria-disabled={s.soldOut || undefined}
                        disabled={!!s.soldOut}
                        data-size={s.size}
                        onClick={() => {
                          if (s.soldOut) return;
                          setSelectedSizeIndex(idx);
                          // Hook for the upcoming 3D bottle: listen for 'pp:size-select' to animate on size change
                          window.dispatchEvent(new CustomEvent('pp:size-select', { detail: { size: s.size, index: idx, price: s.price } }));
                        }}
                        className={`pp-glass-pill${isSelected ? ' is-active' : ''}${s.soldOut ? ' is-soldout' : ''}`}
                      >
                        <span className="pp-glass-pill__size">{s.size}</span>
                        <span className="pp-glass-pill__price">{s.soldOut ? 'Sold out' : `৳${s.price}`}</span>
                      </button>
                    );
                  })}
                </div>
                {sprayInfo && (
                  <p className="pp-sprays" key={currentSize.size}>
                    <span className="pp-sprays__mist" aria-hidden="true" />
                    <b>≈ {sprayInfo.sprays} sprays</b>
                    <span>· about {sprayInfo.days} at 6 sprays a day</span>
                  </p>
                )}
              </div>

              {/* Quantity Selector & Action CTAs */}
              <div className="space-y-3 pt-3">
                <div className="flex flex-col sm:flex-row items-stretch gap-3">
                  {/* Quantity Control */}
                  <div
                    className="flex items-center border shrink-0 justify-between sm:justify-start rounded-xs"
                    style={{
                      backgroundColor: 'var(--theme-surface)',
                      borderColor: 'var(--theme-border-subtle)',
                    }}
                  >
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-4 py-3 transition-colors font-mono cursor-pointer hover:opacity-75"
                      style={{ color: 'var(--theme-text-primary)' }}
                      aria-label="Decrease quantity"
                    >
                      -
                    </button>
                    <span
                      className="px-4 py-3 text-xs font-semibold font-mono min-w-[36px] text-center"
                      style={{ color: 'var(--theme-primary)' }}
                    >
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="px-4 py-3 transition-colors font-mono cursor-pointer hover:opacity-75"
                      style={{ color: 'var(--theme-text-primary)' }}
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>

                  {/* Add to Bag Button */}
                  <button
                    onClick={handleAddToCartClick}
                    disabled={added || isSoldOut}
                    className="flex-1 py-3.5 px-6 text-xs font-sans tracking-widest uppercase flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md hover:opacity-90 rounded-xs"
                    style={{
                      backgroundColor: 'var(--theme-btn-bg)',
                      color: 'var(--theme-btn-text)',
                    }}
                  >
                    {added ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-400" />
                        <span>Added To Bag</span>
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="w-4 h-4" />
                        <span>{isSoldOut ? 'Sold Out' : `Add To Bag · ৳ ${totalPrice.toLocaleString()}`}</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Buy Now Direct Button */}
                <button
                  onClick={handleBuyNowClick}
                  disabled={isSoldOut}
                  className="w-full disabled:opacity-40 disabled:cursor-not-allowed py-3.5 px-6 text-xs font-sans tracking-widest uppercase flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md font-semibold rounded-xs hover:opacity-90"
                  style={{
                    backgroundColor: 'var(--theme-secondary)',
                    color: '#FFFFFF',
                  }}
                >
                  <span>Buy Now · ৳ {totalPrice.toLocaleString()}</span>
                </button>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* 4. Related Products Grid */}
      {relatedProducts.length > 0 && (
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-10 border-t border-zinc-200/80">
          <div className="mb-6">
            <h2 className="font-serif text-xl sm:text-2xl text-zinc-950 uppercase tracking-widest font-normal">
              YOU MAY ALSO LIKE
            </h2>
            <p className="text-[10px] sm:text-xs font-sans tracking-widest text-zinc-400 uppercase mt-1">
              CURATED COMPLEMENTARY DECANTS
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {relatedProducts.map((relProd) => (
              <div
                key={relProd.id}
                onClick={() => onNavigateToProduct(relProd)}
                className="bg-white border border-zinc-200/90 p-4 flex flex-col items-center text-center cursor-pointer group hover:border-zinc-400 transition-all shadow-xs"
              >
                <div className="w-full aspect-square bg-[#fafafa] p-3 flex items-center justify-center overflow-hidden mb-3">
                  <img
                    src={relProd.image}
                    alt={relProd.name}
                    className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <span className="text-[9px] font-sans tracking-widest text-zinc-400 uppercase">
                  {relProd.brand}
                </span>
                <h4 className="font-serif text-xs sm:text-sm font-normal text-zinc-900 mt-0.5 line-clamp-1 group-hover:text-amber-800 transition-colors">
                  {relProd.name}
                </h4>
                <p className="text-[11px] text-zinc-600 font-sans mt-1 tabular-nums">
                  From <span className="font-semibold text-zinc-900">৳ {relProd.startingPrice}</span>
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
