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
      <div className="min-h-[70vh] bg-[#fdfbf7] flex flex-col items-center justify-center px-4 py-20 text-center">
        <div className="max-w-md space-y-4">
          <span className="text-xs font-mono tracking-widest text-amber-700 uppercase">
            AROMATICA CATALOGUE
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl text-zinc-950">
            Fragrance Not Found
          </h1>
          <p className="text-sm font-sans text-zinc-600 leading-relaxed">
            The decant edition you are looking for may have been archived or is currently out of stock.
          </p>
          <div className="pt-4">
            <button
              onClick={onNavigateHome}
              className="inline-flex items-center gap-2 bg-zinc-950 text-white hover:bg-amber-400 hover:text-black px-6 py-3 text-xs font-sans uppercase tracking-widest transition-all shadow-md cursor-pointer"
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
    <div className="bg-[#fdfbf7] text-zinc-900 min-h-screen selection:bg-zinc-900 selection:text-white">
      {/* 1. Top Breadcrumb & Navigation Bar */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-4">
        <div className="flex items-center justify-between border-b border-zinc-200/80 pb-3 text-xs font-sans text-zinc-500">
          <div className="flex items-center gap-2 truncate">
            <button
              onClick={onNavigateHome}
              className="hover:text-zinc-950 transition-colors uppercase tracking-wider text-[11px]"
            >
              Home
            </button>
            <ChevronRight className="w-3 h-3 text-zinc-400 shrink-0" />
            <span className="uppercase tracking-wider text-[11px] text-zinc-400 shrink-0">
              {product.brand}
            </span>
            <ChevronRight className="w-3 h-3 text-zinc-400 shrink-0" />
            <span className="text-zinc-900 font-medium truncate text-[11px]">
              {product.name}
            </span>
          </div>

          <button
            onClick={onNavigateHome}
            className="hidden sm:flex items-center gap-1.5 text-zinc-600 hover:text-black transition-colors text-[11px] uppercase tracking-wider shrink-0 cursor-pointer"
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
            <div className="relative w-full aspect-square sm:aspect-[4/3] lg:aspect-square bg-white border border-zinc-200/90 shadow-xs flex items-center justify-center p-6 sm:p-10 overflow-hidden group">
              <img
                src={activeImage}
                alt={product.name}
                className="max-h-[82%] max-w-[82%] object-contain drop-shadow-xl transition-transform duration-500 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />

              {/* Badges Overlay */}
              <div className="absolute top-4 left-4 flex flex-col gap-1.5 z-10">
                <span className="bg-zinc-950 text-white text-[9px] font-mono tracking-widest uppercase px-2.5 py-1 shadow-sm">
                  100% AUTHENTIC ATOMIZER
                </span>
                {product.gender && (
                  <span className="bg-amber-100 text-amber-900 border border-amber-200 text-[9px] font-sans font-semibold tracking-wider uppercase px-2.5 py-0.5 w-fit">
                    {product.gender} EDITION
                  </span>
                )}
              </div>

              {/* Share Floating Action */}
              <button
                onClick={handleCopyShareLink}
                className="absolute top-4 right-4 p-2.5 bg-white/90 hover:bg-zinc-950 hover:text-white text-zinc-700 transition-all border border-zinc-200 shadow-sm rounded-full cursor-pointer z-10"
                title="Share product link"
              >
                {copiedLink ? (
                  <Check className="w-4 h-4 text-emerald-500" />
                ) : (
                  <Share2 className="w-4 h-4" />
                )}
              </button>

              <div className="absolute bottom-4 right-4 text-[9px] font-mono text-zinc-400 tracking-widest uppercase">
                FINE MIST DISPERSION GLASS BOTTLE
              </div>
            </div>

            {/* Thumbnail Navigation Row */}
            {galleryImages.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-1">
                {galleryImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`relative w-20 h-20 sm:w-24 sm:h-24 bg-white border transition-all cursor-pointer p-2 shrink-0 flex items-center justify-center ${
                      selectedImageIndex === idx
                        ? 'border-zinc-950 ring-1 ring-zinc-950 shadow-md scale-102'
                        : 'border-zinc-200 opacity-70 hover:opacity-100 hover:border-zinc-400'
                    }`}
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
          <div className="lg:col-span-5 flex flex-col justify-between space-y-6 bg-white p-6 sm:p-8 border border-zinc-200/90 shadow-xs">
            <div className="space-y-4">
              {/* Brand & Concentration Header */}
              <div className="flex items-center justify-between border-b border-zinc-150 pb-3">
                <span className="text-xs font-sans tracking-[0.2em] uppercase font-bold text-amber-800">
                  {product.brand} · {product.concentration || 'Eau de Parfum'}
                </span>
                <span className="text-[10px] font-mono text-zinc-400 uppercase">
                  ID: {product.id}
                </span>
              </div>

              {/* Title & Category */}
              <div>
                <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-zinc-950 font-normal leading-tight">
                  {product.name}
                </h1>
                <p className="text-xs font-sans tracking-widest text-zinc-500 uppercase mt-1">
                  Olfactory Family: <span className="text-zinc-800 font-medium">{product.category}</span>
                </p>
              </div>

              {/* Dynamic Price Display */}
              <div className="bg-[#fcfbf9] border border-zinc-200/80 p-4 flex items-baseline justify-between">
                <div>
                  <span className="text-[10px] font-sans tracking-widest text-zinc-400 uppercase block">
                    PRICE FOR {currentSize.size} ({quantity}x)
                  </span>
                  <span className="font-serif text-2xl sm:text-3xl text-zinc-950 font-bold tabular-nums">
                    ৳ {totalPrice.toLocaleString()}
                  </span>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center gap-1.5 text-[10px] font-sans text-emerald-700 bg-emerald-50 px-2.5 py-1 border border-emerald-200 uppercase font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    In Stock • Freshly Decanted
                  </span>
                </div>
              </div>

              {/* Short Description */}
              {product.shortDescription && (
                <p className="text-xs sm:text-sm text-zinc-600 font-sans leading-relaxed pt-1">
                  {product.shortDescription}
                </p>
              )}

              {/* Decant Volume / Size Option Visual Cards Selector */}
              <div className="space-y-3 pt-3 border-t border-zinc-150">
                <div className="flex items-center justify-between text-xs text-zinc-800 font-sans">
                  <span className="font-bold tracking-widest uppercase text-amber-900 text-xs">
                    SELECT SIZE
                  </span>
                  <span className="text-xs text-zinc-600 font-medium">
                    Selected: <span className="font-bold text-zinc-950">{currentSize.size}</span>
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {product.sizes.map((s, idx) => {
                    const isSelected = selectedSizeIndex === idx;
                    const sizeImage = s.image || activeImage;

                    return (
                      <button
                        key={s.size || idx}
                        onClick={() => setSelectedSizeIndex(idx)}
                        className={`group relative flex flex-col overflow-hidden rounded-2xl border transition-all duration-200 text-left cursor-pointer ${
                          isSelected
                            ? 'border-amber-600 ring-2 ring-amber-600/40 shadow-lg scale-[1.02]'
                            : 'border-zinc-200 hover:border-zinc-400 bg-white'
                        }`}
                      >
                        {/* Variant Picture Container */}
                        <div className="w-full aspect-square bg-[#f8f7f4] p-3 flex items-center justify-center overflow-hidden">
                          <img
                            src={sizeImage}
                            alt={s.size}
                            className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105"
                            referrerPolicy="no-referrer"
                          />
                        </div>

                        {/* Dark/Gold Label Banner */}
                        <div
                          className={`w-full py-2 px-2 text-center transition-colors ${
                            isSelected
                              ? 'bg-amber-700 text-white'
                              : 'bg-zinc-900 text-white group-hover:bg-zinc-800'
                          }`}
                        >
                          <span className="text-xs font-bold font-sans tracking-wide uppercase block">
                            {s.size}
                          </span>
                          <span className="text-[11px] font-mono font-medium block opacity-90 mt-0.5">
                            ৳ {s.price}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Quantity Selector & Action CTAs */}
              <div className="space-y-3 pt-3">
                <div className="flex flex-col sm:flex-row items-stretch gap-3">
                  {/* Quantity Control */}
                  <div className="flex items-center border border-zinc-300 bg-zinc-50 shrink-0 justify-between sm:justify-start">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-4 py-3 text-zinc-700 hover:bg-zinc-200 transition-colors font-mono cursor-pointer"
                      aria-label="Decrease quantity"
                    >
                      -
                    </button>
                    <span className="px-4 py-3 text-xs font-semibold font-mono min-w-[36px] text-center text-zinc-950">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="px-4 py-3 text-zinc-700 hover:bg-zinc-200 transition-colors font-mono cursor-pointer"
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>

                  {/* Add to Bag Button */}
                  <button
                    onClick={handleAddToCartClick}
                    disabled={added}
                    className="flex-1 bg-zinc-950 hover:bg-zinc-800 text-white py-3.5 px-6 text-xs font-sans tracking-widest uppercase flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
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
                  className="w-full bg-amber-700 hover:bg-amber-800 text-white py-3.5 px-6 text-xs font-sans tracking-widest uppercase flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md font-semibold"
                >
                  <span>Buy Now · ৳ {totalPrice.toLocaleString()}</span>
                </button>
              </div>

              {/* Guarantee & Authenticity Badges */}
              <div className="pt-4 border-t border-zinc-150 space-y-2 text-[11px] font-sans text-zinc-600">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>100% Genuine Perfume extracted directly from brand flacon.</span>
                </div>
                <div className="flex items-center gap-2">
                  <PackageCheck className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Transit-safe shrink-sealed glass tube with high-pressure fine spray nozzle.</span>
                </div>
                <div className="flex items-center gap-2">
                  <Droplets className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Free nationwide delivery on orders over ৳ 3,000.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Detailed Additional Product Information Section (Notes, Specs, Maceration Guide) */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        <div className="bg-white border border-zinc-200/90 shadow-xs p-6 sm:p-10 lg:p-12 space-y-10">

          {/* Section Navigation Tabs */}
          <div className="flex items-center gap-6 border-b border-zinc-200 overflow-x-auto no-scrollbar pb-3">
            <button
              onClick={() => setActiveTab('notes')}
              className={`text-xs sm:text-sm font-sans tracking-[0.16em] uppercase font-semibold transition-colors pb-1 border-b-2 cursor-pointer whitespace-nowrap ${
                activeTab === 'notes'
                  ? 'border-zinc-950 text-zinc-950'
                  : 'border-transparent text-zinc-400 hover:text-zinc-700'
              }`}
            >
              Fragrance Notes & Profile
            </button>
            <button
              onClick={() => setActiveTab('specs')}
              className={`text-xs sm:text-sm font-sans tracking-[0.16em] uppercase font-semibold transition-colors pb-1 border-b-2 cursor-pointer whitespace-nowrap ${
                activeTab === 'specs'
                  ? 'border-zinc-950 text-zinc-950'
                  : 'border-transparent text-zinc-400 hover:text-zinc-700'
              }`}
            >
              Details & Specifications
            </button>
            <button
              onClick={() => setActiveTab('care')}
              className={`text-xs sm:text-sm font-sans tracking-[0.16em] uppercase font-semibold transition-colors pb-1 border-b-2 cursor-pointer whitespace-nowrap ${
                activeTab === 'care'
                  ? 'border-zinc-950 text-zinc-950'
                  : 'border-transparent text-zinc-400 hover:text-zinc-700'
              }`}
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
                <div className="bg-[#fcfbf9] border border-zinc-200 p-5 space-y-4">
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
                    className="w-full border border-zinc-300/80 hover:border-zinc-950 bg-white hover:bg-zinc-950 text-zinc-800 hover:text-white py-3.5 px-6 rounded-full text-xs font-sans font-bold tracking-widest uppercase transition-all shadow-2xs cursor-pointer text-center"
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
              <h3 className="font-serif text-xl sm:text-2xl text-zinc-950">
                Decant Technical Specifications
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans">
                <div className="border border-zinc-200 p-4 space-y-1">
                  <span className="text-[10px] font-mono text-zinc-400 uppercase block">BRAND HOUSE</span>
                  <span className="font-semibold text-zinc-900">{product.brand}</span>
                </div>

                <div className="border border-zinc-200 p-4 space-y-1">
                  <span className="text-[10px] font-mono text-zinc-400 uppercase block">CONCENTRATION</span>
                  <span className="font-semibold text-zinc-900">{product.concentration || 'Eau de Parfum'}</span>
                </div>

                <div className="border border-zinc-200 p-4 space-y-1">
                  <span className="text-[10px] font-mono text-zinc-400 uppercase block">FRAGRANCE FAMILY</span>
                  <span className="font-semibold text-zinc-900">
                    {sp.fragranceFamilies && sp.fragranceFamilies.length > 0 ? sp.fragranceFamilies.join(', ') : product.category}
                  </span>
                </div>

                <div className="border border-zinc-200 p-4 space-y-1">
                  <span className="text-[10px] font-mono text-zinc-400 uppercase block">SUITABLE GENDER</span>
                  <span className="font-semibold text-zinc-900">{sp.genderPositioning || product.gender || 'Unisex'}</span>
                </div>

                <div className="border border-zinc-200 p-4 space-y-1">
                  <span className="text-[10px] font-mono text-zinc-400 uppercase block">INTENSITY LEVEL</span>
                  <span className="font-semibold text-zinc-900">{sp.intensity || 'Unknown'}</span>
                </div>

                <div className="border border-zinc-200 p-4 space-y-1">
                  <span className="text-[10px] font-mono text-zinc-400 uppercase block">PROJECTION & SILLAGE</span>
                  <span className="font-semibold text-zinc-900">{sp.projection || 'Unknown'}</span>
                </div>

                <div className="border border-zinc-200 p-4 space-y-1">
                  <span className="text-[10px] font-mono text-zinc-400 uppercase block">SKIN LONGEVITY</span>
                  <span className="font-semibold text-zinc-900">{sp.longevity || 'Unknown'}</span>
                </div>

                <div className="border border-zinc-200 p-4 space-y-1">
                  <span className="text-[10px] font-mono text-zinc-400 uppercase block">SWEETNESS LEVEL</span>
                  <span className="font-semibold text-zinc-900">{sp.sweetness || 'Unknown'}</span>
                </div>

                <div className="border border-zinc-200 p-4 space-y-1">
                  <span className="text-[10px] font-mono text-zinc-400 uppercase block">BOTTLE MECHANISM</span>
                  <span className="font-semibold text-zinc-900">Italian Glass Tube with Precision High-Pressure Spray Head</span>
                </div>

                <div className="border border-zinc-200 p-4 space-y-1">
                  <span className="text-[10px] font-mono text-zinc-400 uppercase block">AUTHENTICITY GUARANTEE</span>
                  <span className="font-semibold text-zinc-900">100% Direct-from-Flacon Decant (Zero dilution, zero oils)</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Care & Maceration Guide */}
          {activeTab === 'care' && (
            <div className="space-y-6 animate-fade-in max-w-4xl text-xs sm:text-sm font-sans text-zinc-700 leading-relaxed">
              <h3 className="font-serif text-xl sm:text-2xl text-zinc-950">
                Decant Transit Care & Maceration Advice
              </h3>

              <div className="space-y-4">
                <div className="bg-[#fafaf8] border border-zinc-200 p-5 space-y-2">
                  <h4 className="font-semibold text-zinc-900 uppercase tracking-wide text-xs flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-600" />
                    <span>1. Let the Decant Rest After Delivery</span>
                  </h4>
                  <p>
                    During postal transit and shipping, temperature fluctuations and mechanical shaking temporarily disrupt fragrance oil molecules. Upon opening your parcel, allow the decant bottle to rest undisturbed in a dark, room-temperature room for 24-48 hours before testing on skin.
                  </p>
                </div>

                <div className="bg-[#fafaf8] border border-zinc-200 p-5 space-y-2">
                  <h4 className="font-semibold text-zinc-900 uppercase tracking-wide text-xs flex items-center gap-2">
                    <Info className="w-4 h-4 text-amber-600" />
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
