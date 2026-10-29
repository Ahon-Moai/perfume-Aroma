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
import { VideoSection } from './components/VideoSection';
import { CustomProductSections } from './components/CustomProductSections';
import { TrustSection } from './components/TrustSection';
import { FAQSection } from './components/FAQSection';
import { ReviewsSection } from './components/ReviewsSection';
import { StudioSection } from './components/StudioSection';
import { JournalSection } from './components/JournalSection';
import { Footer } from './components/Footer';
import { ProductDetailPage } from './components/ProductDetailPage';
import { CollectionPage } from './components/CollectionPage';
import { CartDrawer } from './components/CartDrawer';
import { SearchModal } from './components/SearchModal';
import { MobileBottomNav } from './components/MobileBottomNav';
import { IntroSequence } from './components/IntroSequence';
import { AdminLogin } from './admin/AdminLogin';
import { AdminLayout } from './admin/AdminLayout';
import { NEW_ARRIVALS } from './data/fragranceData';
import { FragranceProduct, CartItem, JournalArticle } from './types';
import { fetchPublicProducts, fetchHomepageData, fetchStoreSettings, getErrorMessage } from './services/api';
import { Shield } from 'lucide-react';

export default function App() {
  const [showIntro, setShowIntro] = useState<boolean>(() => {
    try {
      return !sessionStorage.getItem('hasSeenIntro');
    } catch (e) {
      return true;
    }
  });

  const [products, setProducts] = useState<FragranceProduct[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Routing State: 'home' | 'product' | 'collection' | 'admin'
  const [route, setRoute] = useState<{ path: 'home' | 'product' | 'collection' | 'admin'; productSlugOrId?: string; collectionSlug?: string }>({ path: 'home' });

  // Admin View State
  const [viewMode, setViewMode] = useState<'storefront' | 'admin'>('storefront');
  const [adminUser, setAdminUser] = useState<any | null>(null);
  const [csrfToken, setCsrfToken] = useState<string>('');

  // Live CMS & Store Settings State
  const [storeSettings, setStoreSettings] = useState<any>(null);
  const [homepageData, setHomepageData] = useState<any>(null);

  // Sync route state with window.location
  useEffect(() => {
    const syncRouteWithUrl = () => {
      const pathname = window.location.pathname;
      const hash = window.location.hash;
      const searchParams = new URLSearchParams(window.location.search);

      if (hash === '#admin' || pathname.startsWith('/admin')) {
        setViewMode('admin');
        setRoute({ path: 'admin' });
        return;
      } else {
        setViewMode('storefront');
      }

      const queryProd = searchParams.get('product');
      if (queryProd) {
        setRoute({ path: 'product', productSlugOrId: queryProd });
        return;
      }

      if (pathname.startsWith('/products/') || pathname.startsWith('/product/')) {
        const slugOrId = pathname.replace(/^\/(products|product)\//, '').split('/')[0];
        if (slugOrId) {
          setRoute({ path: 'product', productSlugOrId: slugOrId });
          return;
        }
      }

      if (pathname.startsWith('/collections/') || pathname.startsWith('/collection/')) {
        const colSlug = pathname.replace(/^\/(collections|collection)\//, '').split('/')[0];
        if (colSlug) {
          setRoute({ path: 'collection', collectionSlug: colSlug });
          return;
        }
      }

      setRoute({ path: 'home' });
    };

    syncRouteWithUrl();
    window.addEventListener('popstate', syncRouteWithUrl);
    window.addEventListener('hashchange', syncRouteWithUrl);
    return () => {
      window.removeEventListener('popstate', syncRouteWithUrl);
      window.removeEventListener('hashchange', syncRouteWithUrl);
    };
  }, []);

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

  const navigateToProduct = (productOrSlug: FragranceProduct | string) => {
    const slugOrId = typeof productOrSlug === 'string' ? productOrSlug : (productOrSlug.slug || productOrSlug.id);
    const targetUrl = `/products/${slugOrId}`;
    if (window.location.pathname !== targetUrl) {
      window.history.pushState({}, '', targetUrl);
    }
    setRoute({ path: 'product', productSlugOrId: slugOrId });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToCollection = (slug: string) => {
    const targetUrl = `/collections/${slug}`;
    if (window.location.pathname !== targetUrl) {
      window.history.pushState({}, '', targetUrl);
    }
    setRoute({ path: 'collection', collectionSlug: slug });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToHome = () => {
    if (window.location.pathname !== '/' && window.location.hash !== '#admin') {
      window.history.pushState({}, '', '/');
    }
    setRoute({ path: 'home' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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

  const handleBuyNow = (product: FragranceProduct, size: string, price: number, qty = 1) => {
    handleAddToCart(product, size, price, qty);
    setIsCartOpen(true);
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

  const handleExploreClick = () => {
    if (route.path !== 'home') {
      navigateToHome();
      setTimeout(() => {
        const el = document.getElementById('new-arrivals');
        el?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const el = document.getElementById('new-arrivals');
      el?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSelectGenderCategory = (gender: 'Him' | 'Her') => {
    handleExploreClick();
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
    navigateToHome();
    showToast('Logged out from Admin CMS');
  };

  const totalCartCount = cart.reduce((total, item) => total + item.quantity, 0);

  // Active product for detail page
  const currentProduct = route.path === 'product' && route.productSlugOrId
    ? products.find((p) => p.slug === route.productSlugOrId || p.id === route.productSlugOrId) || null
    : null;

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
        onSwitchToStorefront={() => {
          setViewMode('storefront');
          navigateToHome();
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-white text-zinc-900 font-sans flex flex-col selection:bg-zinc-900 selection:text-white relative">
      {/* Editorial OUTFIT-style opening intro sequence */}
      {showIntro && (
        <IntroSequence onComplete={() => setShowIntro(false)} />
      )}

      {/* Admin Quick Switch floating button for store manager */}
      <button
        onClick={() => {
          setViewMode('admin');
          window.location.hash = '#admin';
        }}
        className="fixed bottom-6 left-6 z-40 bg-zinc-950 text-white hover:bg-amber-400 hover:text-black px-3 py-2 border border-zinc-700 shadow-2xl text-[10px] font-sans tracking-widest uppercase flex items-center gap-2 transition-all cursor-pointer"
        title="Open Admin CMS Dashboard"
      >
        <Shield className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">ADMIN CMS</span>
      </button>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-zinc-950 text-white border border-zinc-700 px-4 py-2.5 shadow-2xl text-xs font-sans tracking-wide flex items-center gap-2 animate-bounce">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* A. Minimal announcement and navigation bar */}
      <Header
        cartCount={totalCartCount}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenWishlist={() => showToast('Wishlist: 3 items saved')}
        onNavigateHome={navigateToHome}
        onNavigateToCollection={navigateToCollection}
        storeSettings={storeSettings}
      />

      <main className="flex-1">
        {route.path === 'collection' && route.collectionSlug ? (
          /* Dedicated Collection / Category Filter Page */
          <CollectionPage
            collectionSlug={route.collectionSlug}
            allProducts={products}
            onNavigateHome={navigateToHome}
            onNavigateToCollection={navigateToCollection}
            onNavigateToProduct={navigateToProduct}
            onAddToCart={(p, size, price, qty) => handleAddToCart(p, size, price, qty)}
            showToast={showToast}
          />
        ) : route.path === 'product' ? (
          /* Dedicated Product Detail Page */
          <ProductDetailPage
            product={currentProduct}
            allProducts={products}
            onNavigateHome={navigateToHome}
            onNavigateToProduct={navigateToProduct}
            onAddToCart={handleAddToCart}
            onBuyNow={handleBuyNow}
            showToast={showToast}
          />
        ) : (
          /* Storefront Homepage */
          <>
            {/* B. Full-width luxury hero showcasing Pure Portions by ARRINA */}
            <Hero
              onExploreClick={handleExploreClick}
              onOrderProduct={() => {
                const purePortions = products.find((p) => p.id === 'prod-pure-portions') || products[0];
                if (purePortions) navigateToProduct(purePortions);
              }}
              onNavigateToCollection={navigateToCollection}
              heroData={homepageData?.sections?.hero?.content}
            />

            {/* C. Oversized category marquee */}
            <CategoryMarquee
              items={homepageData?.sections?.category_marquee?.content?.items}
              onNavigateToCollection={navigateToCollection}
            />

            {/* D. New Arrivals product carousel */}
            <NewArrivals
              products={products}
              onSelectProduct={(p) => navigateToProduct(p)}
              onAddToCart={(p, size, price) => handleAddToCart(p, size, price, 1)}
            />

            {/* E. For Him / For Her editorial banners */}
            <CampaignBanners
              onSelectCategory={handleSelectGenderCategory}
              onNavigateToCollection={navigateToCollection}
              campaignData={homepageData?.sections?.campaign_banners?.content}
            />

            {/* F. Seasons campaign gallery */}
            <SeasonsGallery
              seasonsData={homepageData?.sections?.seasons_gallery?.content}
              onExploreClick={handleExploreClick}
              onNavigateToCollection={navigateToCollection}
            />

            {/* G. Premium Video Product Showcase Carousel */}
            <VideoSection
              videoData={homepageData?.sections?.video_showcase?.content || homepageData?.sections?.video_hero?.content}
              products={products}
              onSelectProduct={(p) => navigateToProduct(p)}
              onExploreClick={handleExploreClick}
            />

            {/* Dynamic Custom Product Sections */}
            <CustomProductSections
              homepageData={homepageData}
              allProducts={products}
              onSelectProduct={(p) => navigateToProduct(p)}
              onAddToCart={(p, size, price) => handleAddToCart(p, size, price, 1)}
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
          </>
        )}
      </main>

      {/* M. Oversized AROMATICA brand footer */}
      <Footer storeSettings={storeSettings} />

      {/* N. Premium Mobile Floating Bottom Navigation */}
      <MobileBottomNav
        activeTab={
          isSearchOpen
            ? 'search'
            : isCartOpen
            ? 'bag'
            : route.path === 'collection'
            ? 'shop'
            : route.path === 'home'
            ? 'home'
            : 'home'
        }
        cartCount={totalCartCount}
        onNavigateHome={navigateToHome}
        onNavigateShop={() => navigateToCollection('all')}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenCart={() => setIsCartOpen(true)}
        onSelectAI={() => showToast('AromaAI Concierge: Scent recommendation engine ready')}
      />

      {/* Interactive Drawers & Search Modal */}
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
        onSelectProduct={(p) => navigateToProduct(p)}
      />
    </div>
  );
}
