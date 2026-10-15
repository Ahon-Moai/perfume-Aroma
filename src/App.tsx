/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { CategoryMarquee } from './components/CategoryMarquee';
import { NewArrivals } from './components/NewArrivals';
import { CampaignBanners } from './components/CampaignBanners';
import { SeasonsGallery } from './components/SeasonsGallery';
import { BrandFilterStrip } from './components/BrandFilterStrip';
import { TrustSection } from './components/TrustSection';
import { FAQSection } from './components/FAQSection';
import { ReviewsSection } from './components/ReviewsSection';
import { StudioSection } from './components/StudioSection';
import { JournalSection } from './components/JournalSection';
import { Footer } from './components/Footer';
import { QuickViewModal } from './components/QuickViewModal';
import { CartDrawer } from './components/CartDrawer';
import { SearchModal } from './components/SearchModal';
import { NEW_ARRIVALS } from './data/fragranceData';
import { FragranceProduct, CartItem, JournalArticle } from './types';

export default function App() {
  const [products, setProducts] = useState<FragranceProduct[]>(NEW_ARRIVALS);
  const [cart, setCart] = useState<CartItem[]>([
    {
      product: NEW_ARRIVALS[0],
      selectedSize: '5ml',
      price: 990,
      quantity: 1
    }
  ]);
  const [selectedProduct, setSelectedProduct] = useState<FragranceProduct | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  const handleAddToCart = (product: FragranceProduct, size: string, price: number, qty = 1) => {
    setCart((prev) => {
      const existingIdx = prev.findIndex(
        (item) => item.product.id === product.id && item.selectedSize === size
      );
      if (existingIdx > -1) {
        const next = [...prev];
        next[existingIdx].quantity += qty;
        return next;
      } else {
        return [...prev, { product, selectedSize: size, price, quantity: qty }];
      }
    });
    showToast(`Added ${size} ${product.brand} - ${product.name} to bag`);
  };

  const handleUpdateQty = (productId: string, size: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId && item.selectedSize === size) {
            const nextQty = item.quantity + delta;
            return nextQty > 0 ? { ...item, quantity: nextQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const handleRemoveFromCart = (productId: string, size: string) => {
    setCart((prev) =>
      prev.filter(
        (item) => !(item.product.id === productId && item.selectedSize === size)
      )
    );
    showToast('Decant removed from bag');
  };

  const handleBrandSelect = (brandName: string) => {
    showToast(`Filter applied: ${brandName}`);
  };

  const handleExploreClick = () => {
    const el = document.getElementById('new-arrivals');
    el?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSelectGenderCategory = (gender: 'Him' | 'Her') => {
    const el = document.getElementById('new-arrivals');
    el?.scrollIntoView({ behavior: 'smooth' });
    showToast(`Displaying curated decants for ${gender}`);
  };

  const handleReadArticle = (article: JournalArticle) => {
    showToast(`Opening article: "${article.title}"`);
  };

  const totalCartCount = cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <div className="min-h-screen bg-white text-zinc-900 font-sans flex flex-col selection:bg-zinc-900 selection:text-white">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-zinc-950 text-white border border-zinc-700 px-4 py-2.5 shadow-2xl text-xs font-sans tracking-wide flex items-center gap-2 animate-bounce">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* A. Minimal announcement and navigation bar */}
      <Header
        cartCount={totalCartCount}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenWishlist={() => showToast('Wishlist: 3 items saved')}
      />

      <main className="flex-1">
        {/* B. Full-width luxury hero showcasing Pure Portions by ARRINA */}
        <Hero
          onExploreClick={handleExploreClick}
          onOrderProduct={() => {
            const purePortions = products.find((p) => p.id === 'prod-pure-portions') || products[0];
            setSelectedProduct(purePortions);
          }}
        />

        {/* C. Oversized category marquee */}
        <CategoryMarquee />

        {/* D. New Arrivals product carousel */}
        <NewArrivals
          products={products}
          onSelectProduct={(p) => setSelectedProduct(p)}
          onAddToCart={(p, size, price) => handleAddToCart(p, size, price, 1)}
        />

        {/* E. For Him / For Her editorial banners */}
        <CampaignBanners onSelectCategory={handleSelectGenderCategory} />

        {/* F. Seasons campaign gallery */}
        <SeasonsGallery />

        {/* G. Fragrance category filter strip */}
        <BrandFilterStrip onSelectBrand={handleBrandSelect} />

        {/* H. Trust and shopping information section */}
        <TrustSection />

        {/* I. Black FAQ section */}
        <FAQSection />

        {/* J. Customer reviews section */}
        <ReviewsSection />

        {/* K. Our Studio social-content section */}
        <StudioSection />

        {/* L. Editorial blog and fragrance guides */}
        <JournalSection onReadArticle={handleReadArticle} />
      </main>

      {/* M. Oversized AROMATICA brand footer */}
      <Footer />

      {/* Interactive Drawers & Modals */}
      <QuickViewModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={handleAddToCart}
      />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cart}
        onUpdateQty={handleUpdateQty}
        onRemoveItem={handleRemoveFromCart}
      />

      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        products={products}
        onSelectProduct={(p) => setSelectedProduct(p)}
      />
    </div>
  );
}
