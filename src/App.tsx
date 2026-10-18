/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
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
import { AdminLogin } from './admin/AdminLogin';
import { AdminLayout } from './admin/AdminLayout';
import { NEW_ARRIVALS } from './data/fragranceData';
import { FragranceProduct, CartItem, JournalArticle } from './types';
import { fetchPublicProducts, fetchHomepageData, fetchStoreSettings, getErrorMessage } from './services/api';
import { Shield, Sparkles } from 'lucide-react';

export default function App() {
  const [products, setProducts] = useState<FragranceProduct[]>(NEW_ARRIVALS);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<FragranceProduct | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Admin View State
  const [viewMode, setViewMode] = useState<'storefront' | 'admin'>('storefront');
  const [adminUser, setAdminUser] = useState<any | null>(null);
  const [csrfToken, setCsrfToken] = useState<string>('');

  // Check URL hash or path for admin
  useEffect(() => {
    const handleHashCheck = () => {
      if (window.location.hash === '#admin' || window.location.pathname.startsWith('/admin')) {
        setViewMode('admin');
      }
    };
    handleHashCheck();
    window.addEventListener('hashchange', handleHashCheck);
    return () => window.removeEventListener('hashchange', handleHashCheck);
  }, []);

  // Live CMS & Store Settings State
  const [storeSettings, setStoreSettings] = useState<any>(null);
  const [homepageData, setHomepageData] = useState<any>(null);

  // Fetch live products, store settings & homepage content from API on mount
  useEffect(() => {
    const loadApiData = async () => {
      const [liveProducts, settings, hpData] = await Promise.all([
        fetchPublicProducts(),
        fetchStoreSettings(),
        fetchHomepageData()
      ]);

      if (liveProducts && liveProducts.length > 0) {
        setProducts(liveProducts);
      }
      if (settings) {
        setStoreSettings(settings);
      }
      if (hpData) {
        setHomepageData(hpData);
      }
    };
    loadApiData();
  }, [viewMode]);

  // Check existing admin session
  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch('/api/auth.php?action=me');
        const data = await res.json();
        if (data.success && data.data) {
          setAdminUser(data.data.user);
          setCsrfToken(data.data.csrf_token);
        }
      } catch (e) {
        // Unauthenticated
      }
    };
    checkSession();
  }, []);

  const showToast = (msg: any) => {
    setToastMessage(typeof msg === 'string' ? msg : getErrorMessage(msg, 'Notification'));
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

  const handleAdminLogout = async () => {
    try {
      await fetch('/api/auth.php?action=logout');
    } catch (e) {}
    setAdminUser(null);
    setCsrfToken('');
    setViewMode('storefront');
    showToast('Logged out from Admin CMS');
  };

  const totalCartCount = cart.reduce((total, item) => total + item.quantity, 0);

  // If in Admin CMS Mode
  if (viewMode === 'admin') {
    if (!adminUser) {
      return (
        <AdminLogin
          onLoginSuccess={(user, token) => {
            setAdminUser(user);
            setCsrfToken(token);
          }}
        />
      );
    }
    return (
      <AdminLayout
        user={adminUser}
        csrfToken={csrfToken}
        onLogout={handleAdminLogout}
        onSwitchToStorefront={() => setViewMode('storefront')}
      />
    );
  }

  return (
    <div className="min-h-screen bg-white text-zinc-900 font-sans flex flex-col selection:bg-zinc-900 selection:text-white relative">
      {/* Admin Quick Switch floating button for store manager */}
      <button
        onClick={() => setViewMode('admin')}
        className="fixed bottom-6 left-6 z-40 bg-zinc-950 text-white hover:bg-amber-400 hover:text-black px-3 py-2 border border-zinc-700 shadow-2xl text-[10px] font-sans tracking-widest uppercase flex items-center gap-2 transition-all cursor-pointer"
        title="Open Admin CMS Dashboard"
      >
        <Shield className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">ADMIN CMS</span>
      </button>

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
        storeSettings={storeSettings}
      />

      <main className="flex-1">
        {/* B. Full-width luxury hero showcasing Pure Portions by ARRINA */}
        <Hero
          onExploreClick={handleExploreClick}
          onOrderProduct={() => {
            const purePortions = products.find((p) => p.id === 'prod-pure-portions') || products[0];
            if (purePortions) setSelectedProduct(purePortions);
          }}
          heroData={homepageData?.sections?.hero?.content}
        />

        {/* C. Oversized category marquee */}
        <CategoryMarquee
          items={homepageData?.sections?.category_marquee?.content?.items}
        />

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
        <BrandFilterStrip
          onSelectBrand={handleBrandSelect}
          brands={homepageData?.brands}
        />

        {/* H. Trust and shopping information section */}
        <TrustSection storeSettings={storeSettings} />

        {/* I. Black FAQ section */}
        <FAQSection faqs={homepageData?.faqs} />

        {/* J. Customer reviews section */}
        <ReviewsSection reviews={homepageData?.reviews} />

        {/* K. Our Studio social-content section */}
        <StudioSection socialCards={homepageData?.socialCards} />

        {/* L. Editorial blog and fragrance guides */}
        <JournalSection
          onReadArticle={handleReadArticle}
          articles={homepageData?.articles}
        />
      </main>

      {/* M. Oversized AROMATICA brand footer */}
      <Footer storeSettings={storeSettings} />

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
        onClearCart={() => setCart([])}
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
