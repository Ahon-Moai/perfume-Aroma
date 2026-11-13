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
    setSelectedSizeIndex(0);
    setQuantity(1);
    setAdded(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [product.id]);

  const activeImage = galleryImages[selectedImageIndex] || product.image;
  const currentSize: DecantSize = product.sizes[selectedSizeIndex] || product.sizes[0] || { size: '5ml', price: product.startingPrice };
  const totalPrice = currentSize.price * quantity;

  const handleAddToCartClick = () => {
    onAddToCart(product, currentSize.size, currentSize.price, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const handleBuyNowClick = () => {
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
              {/* Brand & Concentration Header */}
              <div
                className="flex items-center justify-between border-b pb-3"
                style={{ borderColor: 'var(--theme-border-subtle)' }}
              >
                <span
                  className="text-xs font-sans tracking-[0.2em] uppercase font-bold"
                  style={{ color: 'var(--theme-secondary)' }}
                >
                  {product.brand} · {product.concentration || 'Eau de Parfum'}
                </span>
              </div>

              {/* Title & Category */}
              <div>
                <h1
                  className="font-serif text-2xl sm:text-3xl lg:text-4xl font-normal leading-tight"
                  style={{ color: 'var(--theme-primary)' }}
                >
                  {product.name}
                </h1>
                <p className="text-xs font-sans tracking-widest uppercase mt-1 opacity-70" style={{ color: 'var(--theme-text-secondary)' }}>
                  Olfactory Family: <span className="font-semibold" style={{ color: 'var(--theme-primary)' }}>{product.category}</span>
                </p>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-2">
                <span className="font-serif text-2xl sm:text-3xl font-bold tabular-nums" style={{ color: 'var(--theme-primary)' }}>
                  ৳ {totalPrice.toLocaleString()}
                </span>
                <span className="text-xs font-sans opacity-60" style={{ color: 'var(--theme-text-secondary)' }}>
                  {currentSize.size}{quantity > 1 ? ` × ${quantity}` : ''}
                </span>
              </div>

              {/* Short Description */}
              {product.shortDescription && (
                <p className="text-xs sm:text-sm font-sans leading-relaxed pt-1 opacity-85" style={{ color: 'var(--theme-text-secondary)' }}>
                  {product.shortDescription}
                </p>
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
                        data-size={s.size}
                        onClick={() => {
                          setSelectedSizeIndex(idx);
                          // Hook for the upcoming 3D bottle: listen for 'pp:size-select' to animate on size change
                          window.dispatchEvent(new CustomEvent('pp:size-select', { detail: { size: s.size, index: idx, price: s.price } }));
                        }}
                        className={`pp-glass-pill${isSelected ? ' is-active' : ''}`}
                      >
                        <span className="pp-glass-pill__size">{s.size}</span>
                        <span className="pp-glass-pill__price">৳{s.price}</span>
                      </button>
                    );
                  })}
                </div>
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
                    disabled={added}
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
                        <span>Add To Bag</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Buy Now Direct Button */}
                <button
                  onClick={handleBuyNowClick}
                  className="w-full py-3.5 px-6 text-xs font-sans tracking-widest uppercase flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md font-semibold rounded-xs hover:opacity-90"
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

      {/* 3. Detailed Additional Product Information Section (Notes, Specs, Maceration Guide) */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        <div
          className="pp-noborder border shadow-xs p-6 sm:p-10 lg:p-12 space-y-10 rounded-xs"
          style={{
            backgroundColor: 'var(--theme-surface-card)',
            borderColor: 'var(--theme-border-subtle)',
          }}
        >

          {/* Section Navigation Tabs */}
          <div
            className="flex items-center gap-6 border-b overflow-x-auto no-scrollbar pb-3"
            style={{ borderColor: 'var(--theme-border-subtle)' }}
          >
            <button
              onClick={() => setActiveTab('notes')}
              className="text-xs sm:text-sm font-sans tracking-[0.16em] uppercase font-semibold transition-colors pb-1 cursor-pointer whitespace-nowrap"
              style={{
                borderBottom: activeTab === 'notes' ? '2px solid var(--theme-primary)' : '2px solid transparent',
                color: activeTab === 'notes' ? 'var(--theme-primary)' : 'var(--theme-text-secondary)',
              }}
            >
              Fragrance Notes & Profile
            </button>
            <button
              onClick={() => setActiveTab('specs')}
              className="text-xs sm:text-sm font-sans tracking-[0.16em] uppercase font-semibold transition-colors pb-1 cursor-pointer whitespace-nowrap"
              style={{
                borderBottom: activeTab === 'specs' ? '2px solid var(--theme-primary)' : '2px solid transparent',
                color: activeTab === 'specs' ? 'var(--theme-primary)' : 'var(--theme-text-secondary)',
              }}
            >
              Details & Specifications
            </button>
            <button
              onClick={() => setActiveTab('care')}
              className="text-xs sm:text-sm font-sans tracking-[0.16em] uppercase font-semibold transition-colors pb-1 cursor-pointer whitespace-nowrap"
              style={{
                borderBottom: activeTab === 'care' ? '2px solid var(--theme-primary)' : '2px solid transparent',
                color: activeTab === 'care' ? 'var(--theme-primary)' : 'var(--theme-text-secondary)',
              }}
            >
              Decant Care & Maceration
            </button>
          </div>

          {/* TAB 1: Fragrance Notes Pyramid & Attributes */}
          {activeTab === 'notes' && (
            <div className="space-y-10 animate-fade-in">
              {/* Detailed Description */}
              <div className="max-w-3xl space-y-3">
                <h3 className="font-serif text-xl sm:text-2xl text-zinc-950">
                  The Olfactory Story
                </h3>
                <p className="text-xs sm:text-sm text-zinc-700 leading-relaxed font-sans">
                  {sp.scentDescription || product.description || product.shortDescription || 'Crafted with rare essences sourced directly from master perfumers. Every spray radiates pure elegance and uncompromised sillage.'}
                </p>

                {sp.recommendationExplanation && (
                  <div className="bg-amber-50/80 border border-amber-200/90 p-4 rounded-none space-y-1 mt-3">
                    <span className="text-[10px] font-mono tracking-widest text-amber-900 uppercase font-bold block flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                      Find Your Scent Recommendation Note
                    </span>
                    <p className="text-xs text-amber-950 font-sans leading-relaxed">
                      {sp.recommendationExplanation}
                    </p>
                  </div>
                )}
              </div>

              {/* Structured Scent Profile Badge Tags */}
              {((sp.fragranceFamilies && sp.fragranceFamilies.length > 0) || (sp.seasons && sp.seasons.length > 0) || (sp.occasions && sp.occasions.length > 0) || (sp.moods && sp.moods.length > 0)) && (
                <div className="pp-noborder bg-[#fcfbf9] border border-zinc-200 p-5 space-y-4">
                  <h4 className="text-xs font-sans tracking-widest uppercase font-bold text-zinc-900 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    <span>Curated Scent Recommendation Attributes</span>
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                    {sp.fragranceFamilies && sp.fragranceFamilies.length > 0 && (
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-mono uppercase text-zinc-400 block">FRAGRANCE FAMILIES</span>
                        <div className="flex flex-wrap gap-1">
                          {sp.fragranceFamilies.map((fam, idx) => (
                            <span key={idx} className="bg-amber-100 text-amber-900 px-2 py-0.5 text-[11px] font-medium border border-amber-200">
                              {fam}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {sp.seasons && sp.seasons.length > 0 && (
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-mono uppercase text-zinc-400 block">SUITABLE SEASONS</span>
                        <div className="flex flex-wrap gap-1">
                          {sp.seasons.map((s, idx) => (
                            <span key={idx} className="bg-zinc-100 text-zinc-800 px-2 py-0.5 text-[11px] font-medium border border-zinc-200">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {sp.occasions && sp.occasions.length > 0 && (
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-mono uppercase text-zinc-400 block">SUITABLE OCCASIONS</span>
                        <div className="flex flex-wrap gap-1">
                          {sp.occasions.map((o, idx) => (
                            <span key={idx} className="bg-zinc-100 text-zinc-800 px-2 py-0.5 text-[11px] font-medium border border-zinc-200">
                              {o}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {sp.moods && sp.moods.length > 0 && (
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-mono uppercase text-zinc-400 block">DESIRED MOOD / IMPRESSION</span>
                        <div className="flex flex-wrap gap-1">
                          {sp.moods.map((m, idx) => (
                            <span key={idx} className="bg-zinc-100 text-zinc-800 px-2 py-0.5 text-[11px] font-medium border border-zinc-200">
                              {m}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Fragrantica-style Main Accords Stack */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between border-b border-zinc-200 pb-2">
                  <h4 className="text-xs font-sans tracking-widest uppercase font-bold text-zinc-900 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-amber-700" />
                    <span>Main Accords</span>
                  </h4>
                  <span className="text-[10px] font-mono text-zinc-400 uppercase">
                    Scent Progression & Intensity
                  </span>
                </div>

                {accordsList.length > 0 ? (
                  <div className="space-y-1.5 max-w-lg pt-1">
                    {accordsList.map((acc, idx) => (
                      <div
                        key={acc.id || idx}
                        style={{
                          width: `${Math.max(15, Math.min(100, acc.intensity))}%`,
                          backgroundColor: acc.color || '#a288e3'
                        }}
                        className="h-8 rounded-r-md flex items-center justify-start px-3 text-xs font-sans font-medium text-black shadow-xs transition-all duration-300 hover:opacity-95"
                      >
                        <span className="truncate drop-shadow-xs tracking-wide">
                          {acc.name}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-zinc-500 italic py-2">
                    No main accords specified for this fragrance.
                  </p>
                )}

                {/* Olfactory Pyramid Notes (If configured by admin) */}
                {((sp.topNotes && sp.topNotes.length > 0) || (sp.heartNotes && sp.heartNotes.length > 0) || (sp.baseNotes && sp.baseNotes.length > 0)) && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-zinc-150">
                    {/* Top Notes */}
                    {sp.topNotes && sp.topNotes.length > 0 && (
                      <div className="bg-[#fafaf8] border border-zinc-200 p-5 space-y-2">
                        <div className="flex items-center gap-2 text-xs font-sans tracking-widest text-amber-800 uppercase font-bold">
                          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                          <span>Top Notes</span>
                        </div>
                        <div className="text-xs text-zinc-800 font-sans space-y-1 pt-1">
                          {sp.topNotes.map((note, i) => (
                            <div key={i} className="flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                              <span>{note}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Heart Notes */}
                    {sp.heartNotes && sp.heartNotes.length > 0 && (
                      <div className="bg-[#fafaf8] border border-zinc-200 p-5 space-y-2">
                        <div className="flex items-center gap-2 text-xs font-sans tracking-widest text-amber-800 uppercase font-bold">
                          <Droplets className="w-3.5 h-3.5 text-amber-600" />
                          <span>Heart Notes</span>
                        </div>
                        <div className="text-xs text-zinc-800 font-sans space-y-1 pt-1">
                          {sp.heartNotes.map((note, i) => (
                            <div key={i} className="flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
                              <span>{note}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Base Notes */}
                    {sp.baseNotes && sp.baseNotes.length > 0 && (
                      <div className="bg-[#fafaf8] border border-zinc-200 p-5 space-y-2">
                        <div className="flex items-center gap-2 text-xs font-sans tracking-widest text-amber-800 uppercase font-bold">
                          <Flame className="w-3.5 h-3.5 text-amber-600" />
                          <span>Base Notes</span>
                        </div>
                        <div className="text-xs text-zinc-800 font-sans space-y-1 pt-1">
                          {sp.baseNotes.map((note, i) => (
                            <div key={i} className="flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-zinc-900" />
                              <span>{note}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Intensity & Performance Attribute Cards */}
              <div className="space-y-6 pt-6 border-t border-zinc-150">
                <div className="flex items-center gap-2 text-xs font-sans tracking-widest text-zinc-900 uppercase font-bold">
                  <Layers className="w-4 h-4 text-amber-700" />
                  <span>Scent Intensity & Performance Profile</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {attributes.map((attr) => {
                    const score = ((attr.value / 100) * 10).toFixed(1);
                    return (
                      <div
                        key={attr.id || attr.name}
                        className="bg-[#fcfbfb] border border-zinc-200/90 rounded-[24px] p-5 flex flex-col justify-between space-y-3 shadow-2xs hover:border-zinc-300 transition-all"
                      >
                        <span className="text-[11px] font-sans tracking-widest text-zinc-500 uppercase font-semibold">
                          {attr.name}
                        </span>

                        <div className="flex items-baseline gap-0.5">
                          <span className="text-2xl font-sans text-zinc-950 font-medium tracking-tight">
                            {score}
                          </span>
                          <span className="text-sm font-sans text-zinc-400 font-normal">
                            /10
                          </span>
                        </div>

                        <div className="w-full h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-zinc-950 rounded-full transition-all duration-500"
                            style={{ width: `${attr.value}%` }}
                          />
                        </div>

                        <span className="text-[10px] font-sans font-bold tracking-widest text-zinc-400 uppercase pt-0.5">
                          1 VOTE
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => showToast('Performance vote submitted!')}
                    className="w-full border py-3.5 px-6 rounded-full text-xs font-sans font-bold tracking-widest uppercase transition-all shadow-2xs cursor-pointer text-center hover:opacity-90"
                    style={{
                      backgroundColor: 'var(--theme-surface)',
                      borderColor: 'var(--theme-border)',
                      color: 'var(--theme-primary)',
                    }}
                  >
                    VOTE FOR PERFORMANCE
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Details & Specifications */}
          {activeTab === 'specs' && (
            <div className="space-y-6 animate-fade-in max-w-4xl">
              <h3 className="font-serif text-xl sm:text-2xl" style={{ color: 'var(--theme-primary)' }}>
                Decant Technical Specifications
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans">
                <div
                  className="border p-4 space-y-1 rounded-xs"
                  style={{
                    backgroundColor: 'var(--theme-surface)',
                    borderColor: 'var(--theme-border-subtle)',
                  }}
                >
                  <span className="text-[10px] font-mono uppercase block opacity-70" style={{ color: 'var(--theme-secondary)' }}>BRAND HOUSE</span>
                  <span className="font-semibold" style={{ color: 'var(--theme-primary)' }}>{product.brand}</span>
                </div>

                <div
                  className="border p-4 space-y-1 rounded-xs"
                  style={{
                    backgroundColor: 'var(--theme-surface)',
                    borderColor: 'var(--theme-border-subtle)',
                  }}
                >
                  <span className="text-[10px] font-mono uppercase block opacity-70" style={{ color: 'var(--theme-secondary)' }}>CONCENTRATION</span>
                  <span className="font-semibold" style={{ color: 'var(--theme-primary)' }}>{product.concentration || 'Eau de Parfum'}</span>
                </div>

                <div
                  className="border p-4 space-y-1 rounded-xs"
                  style={{
                    backgroundColor: 'var(--theme-surface)',
                    borderColor: 'var(--theme-border-subtle)',
                  }}
                >
                  <span className="text-[10px] font-mono uppercase block opacity-70" style={{ color: 'var(--theme-secondary)' }}>FRAGRANCE FAMILY</span>
                  <span className="font-semibold" style={{ color: 'var(--theme-primary)' }}>
                    {sp.fragranceFamilies && sp.fragranceFamilies.length > 0 ? sp.fragranceFamilies.join(', ') : product.category}
                  </span>
                </div>

                <div
                  className="border p-4 space-y-1 rounded-xs"
                  style={{
                    backgroundColor: 'var(--theme-surface)',
                    borderColor: 'var(--theme-border-subtle)',
                  }}
                >
                  <span className="text-[10px] font-mono uppercase block opacity-70" style={{ color: 'var(--theme-secondary)' }}>SUITABLE GENDER</span>
                  <span className="font-semibold" style={{ color: 'var(--theme-primary)' }}>{sp.genderPositioning || product.gender || 'Unisex'}</span>
                </div>

                <div
                  className="border p-4 space-y-1 rounded-xs"
                  style={{
                    backgroundColor: 'var(--theme-surface)',
                    borderColor: 'var(--theme-border-subtle)',
                  }}
                >
                  <span className="text-[10px] font-mono uppercase block opacity-70" style={{ color: 'var(--theme-secondary)' }}>INTENSITY LEVEL</span>
                  <span className="font-semibold" style={{ color: 'var(--theme-primary)' }}>{sp.intensity || 'Unknown'}</span>
                </div>

                <div
                  className="border p-4 space-y-1 rounded-xs"
                  style={{
                    backgroundColor: 'var(--theme-surface)',
                    borderColor: 'var(--theme-border-subtle)',
                  }}
                >
                  <span className="text-[10px] font-mono uppercase block opacity-70" style={{ color: 'var(--theme-secondary)' }}>PROJECTION & SILLAGE</span>
                  <span className="font-semibold" style={{ color: 'var(--theme-primary)' }}>{sp.projection || 'Unknown'}</span>
                </div>

                <div
                  className="border p-4 space-y-1 rounded-xs"
                  style={{
                    backgroundColor: 'var(--theme-surface)',
                    borderColor: 'var(--theme-border-subtle)',
                  }}
                >
                  <span className="text-[10px] font-mono uppercase block opacity-70" style={{ color: 'var(--theme-secondary)' }}>SKIN LONGEVITY</span>
                  <span className="font-semibold" style={{ color: 'var(--theme-primary)' }}>{sp.longevity || 'Unknown'}</span>
                </div>

                <div
                  className="border p-4 space-y-1 rounded-xs"
                  style={{
                    backgroundColor: 'var(--theme-surface)',
                    borderColor: 'var(--theme-border-subtle)',
                  }}
                >
                  <span className="text-[10px] font-mono uppercase block opacity-70" style={{ color: 'var(--theme-secondary)' }}>SWEETNESS LEVEL</span>
                  <span className="font-semibold" style={{ color: 'var(--theme-primary)' }}>{sp.sweetness || 'Unknown'}</span>
                </div>

                <div
                  className="border p-4 space-y-1 rounded-xs"
                  style={{
                    backgroundColor: 'var(--theme-surface)',
                    borderColor: 'var(--theme-border-subtle)',
                  }}
                >
                  <span className="text-[10px] font-mono uppercase block opacity-70" style={{ color: 'var(--theme-secondary)' }}>BOTTLE MECHANISM</span>
                  <span className="font-semibold" style={{ color: 'var(--theme-primary)' }}>Italian Glass Tube with Precision High-Pressure Spray Head</span>
                </div>

                <div
                  className="border p-4 space-y-1 rounded-xs"
                  style={{
                    backgroundColor: 'var(--theme-surface)',
                    borderColor: 'var(--theme-border-subtle)',
                  }}
                >
                  <span className="text-[10px] font-mono uppercase block opacity-70" style={{ color: 'var(--theme-secondary)' }}>AUTHENTICITY GUARANTEE</span>
                  <span className="font-semibold" style={{ color: 'var(--theme-primary)' }}>100% Direct-from-Flacon Decant (Zero dilution, zero oils)</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Care & Maceration Guide */}
          {activeTab === 'care' && (
            <div className="space-y-6 animate-fade-in max-w-4xl text-xs sm:text-sm font-sans leading-relaxed opacity-90" style={{ color: 'var(--theme-text-primary)' }}>
              <h3 className="font-serif text-xl sm:text-2xl" style={{ color: 'var(--theme-primary)' }}>
                Decant Transit Care & Maceration Advice
              </h3>

              <div className="space-y-4">
                <div
                  className="border p-5 space-y-2 rounded-xs"
                  style={{
                    backgroundColor: 'var(--theme-surface)',
                    borderColor: 'var(--theme-border-subtle)',
                  }}
                >
                  <h4 className="font-semibold uppercase tracking-wide text-xs flex items-center gap-2" style={{ color: 'var(--theme-primary)' }}>
                    <Clock className="w-4 h-4" style={{ color: 'var(--theme-secondary)' }} />
                    <span>1. Let the Decant Rest After Delivery</span>
                  </h4>
                  <p>
                    During postal transit and shipping, temperature fluctuations and mechanical shaking temporarily disrupt fragrance oil molecules. Upon opening your parcel, allow the decant bottle to rest undisturbed in a dark, room-temperature room for 24-48 hours before testing on skin.
                  </p>
                </div>

                <div
                  className="border p-5 space-y-2 rounded-xs"
                  style={{
                    backgroundColor: 'var(--theme-surface)',
                    borderColor: 'var(--theme-border-subtle)',
                  }}
                >
                  <h4 className="font-semibold uppercase tracking-wide text-xs flex items-center gap-2" style={{ color: 'var(--theme-primary)' }}>
                    <Info className="w-4 h-4" style={{ color: 'var(--theme-secondary)' }} />
                    <span>2. Maceration & Oxygen Contact</span>
                  </h4>
                  <p>
                    Freshly decanted fragrances react lightly with small amounts of air inside the glass tube. Over 1-2 weeks of light use, the scent will deepen, rounding out sharp alcohol top notes and unlocking richer base accords.
                  </p>
                </div>
              </div>
            </div>
          )}
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
