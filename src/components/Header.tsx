import React, { useState } from 'react';
import { Menu, Search, User, Heart, ShoppingBag, X, ChevronLeft, ChevronRight } from 'lucide-react';

interface HeaderProps {
  cartCount: number;
  onOpenCart: () => void;
  onOpenSearch: () => void;
  onOpenWishlist: () => void;
  onNavigateHome?: () => void;
  onNavigateToCollection?: (slug: string) => void;
  storeSettings?: any;
}

export const Header: React.FC<HeaderProps> = ({
  cartCount,
  onOpenCart,
  onOpenSearch,
  onOpenWishlist,
  onNavigateHome,
  onNavigateToCollection,
  storeSettings
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [announcementIndex, setAnnouncementIndex] = useState(0);

  const defaultAnnouncements = [
    'Upto 1500BDT Cashback On bKash Payments',
    'Free Shipping on Decant Orders Over BDT 3,000',
    'Guaranteed 100% Authentic & Unaltered Decants'
  ];

  const customAnnouncement = storeSettings?.announcement_bar;
  const announcements = customAnnouncement
    ? customAnnouncement.includes('·')
      ? customAnnouncement.split('·').map((s: string) => s.trim())
      : customAnnouncement.includes('|')
      ? customAnnouncement.split('|').map((s: string) => s.trim())
      : [customAnnouncement]
    : defaultAnnouncements;

  const nextAnnouncement = () => {
    setAnnouncementIndex((prev) => (prev + 1) % announcements.length);
  };

  const prevAnnouncement = () => {
    setAnnouncementIndex((prev) => (prev - 1 + announcements.length) % announcements.length);
  };

  const handleCollectionClick = (slug: string) => {
    setMobileMenuOpen(false);
    if (onNavigateToCollection) {
      onNavigateToCollection(slug);
    } else {
      window.location.href = `/collections/${slug}`;
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white transition-all duration-200">
      {/* Top Black Announcement Strip */}
      <div className="bg-black text-white text-[11px] font-medium tracking-wider uppercase py-2 px-4 flex items-center justify-between border-b border-zinc-900">
        <button
          onClick={prevAnnouncement}
          aria-label="Previous announcement"
          className="text-zinc-400 hover:text-white transition-colors p-1"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>
        <div className="flex-1 text-center font-sans tracking-widest px-2 truncate">
          {announcements[announcementIndex]}
        </div>
        <button
          onClick={nextAnnouncement}
          aria-label="Next announcement"
          className="text-zinc-400 hover:text-white transition-colors p-1"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Main Navbar */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between border-b border-zinc-100">
        {/* Left: Mobile & Desktop Navigation */}
        <div className="flex items-center gap-6">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-zinc-900 hover:text-zinc-600 transition-colors focus:outline-none cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Desktop Collections Quick Links */}
          <nav className="hidden lg:flex items-center gap-5 text-xs uppercase font-sans tracking-widest font-medium text-zinc-700">
            <button
              onClick={() => handleCollectionClick('all')}
              className="hover:text-amber-800 transition-colors cursor-pointer"
            >
              All Fragrances
            </button>
            <button
              onClick={() => handleCollectionClick('forhim')}
              className="hover:text-amber-800 transition-colors cursor-pointer"
            >
              For Him
            </button>
            <button
              onClick={() => handleCollectionClick('forher')}
              className="hover:text-amber-800 transition-colors cursor-pointer"
            >
              For Her
            </button>
            <button
              onClick={() => handleCollectionClick('unisex')}
              className="hover:text-amber-800 transition-colors cursor-pointer"
            >
              Unisex
            </button>
            <button
              onClick={() => handleCollectionClick('best-sellers')}
              className="hover:text-amber-800 transition-colors cursor-pointer text-amber-900 font-semibold"
            >
              Best Sellers
            </button>
          </nav>
        </div>

        {/* Center: Brand Wordmark */}
        <div className="absolute left-1/2 -translate-x-1/2 text-center">
          <a
            href="/"
            onClick={(e) => {
              if (onNavigateHome) {
                e.preventDefault();
                onNavigateHome();
              }
            }}
            className="font-bodoni text-base xs:text-lg sm:text-2xl md:text-3xl tracking-[0.08em] xs:tracking-[0.1em] sm:tracking-[0.18em] font-light text-zinc-950 uppercase hover:opacity-90 transition-opacity whitespace-nowrap cursor-pointer"
          >
            {storeSettings?.store_name || 'AROMATICA'}
          </a>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1 sm:gap-2 text-zinc-900">
          <button
            onClick={onOpenSearch}
            className="p-2 hover:text-zinc-600 transition-colors hidden md:block"
            aria-label="Search fragrances"
          >
            <Search className="w-4 h-4 sm:w-5 sm:h-5 stroke-[1.75]" />
          </button>
          
          <button
            onClick={() => {
              const el = document.getElementById('account-section');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="p-2 hover:text-zinc-600 transition-colors hidden md:block"
            aria-label="Account"
          >
            <User className="w-4 h-4 sm:w-5 sm:h-5 stroke-[1.75]" />
          </button>

          <button
            onClick={onOpenWishlist}
            className="p-2 hover:text-zinc-600 transition-colors relative hidden md:block"
            aria-label="Wishlist"
          >
            <Heart className="w-4 h-4 sm:w-5 sm:h-5 stroke-[1.75]" />
          </button>

          <button
            onClick={onOpenCart}
            className="p-2 hover:text-zinc-600 transition-colors relative"
            aria-label="Shopping bag"
          >
            <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 stroke-[1.75]" />
            {cartCount > 0 && (
              <span className="absolute top-1 right-1 bg-red-600 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Slide-out Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 top-[96px] z-50 bg-black/40 backdrop-blur-sm md:hidden animate-fade-in">
          <div className="bg-white w-4/5 max-w-sm h-full p-6 shadow-2xl flex flex-col justify-between overflow-y-auto">
            <div className="space-y-6">
              <div className="border-b border-zinc-100 pb-4">
                <p className="text-[10px] tracking-widest uppercase text-zinc-400 font-medium">Explore Decants</p>
                <div className="mt-4 flex flex-col space-y-3 font-serif text-lg text-zinc-900">
                  <button onClick={() => handleCollectionClick('all')} className="text-left hover:text-amber-800 transition-colors font-semibold">
                    Explore All Decants
                  </button>
                  <button onClick={() => handleCollectionClick('forhim')} className="text-left hover:text-amber-800 transition-colors">
                    For Him
                  </button>
                  <button onClick={() => handleCollectionClick('forher')} className="text-left hover:text-amber-800 transition-colors">
                    For Her
                  </button>
                  <button onClick={() => handleCollectionClick('unisex')} className="text-left hover:text-amber-800 transition-colors">
                    Unisex
                  </button>
                  <button onClick={() => handleCollectionClick('best-sellers')} className="text-left hover:text-amber-800 transition-colors">
                    Best Sellers
                  </button>
                  <button onClick={() => handleCollectionClick('new-arrivals')} className="text-left hover:text-amber-800 transition-colors">
                    New Arrivals
                  </button>
                  <button onClick={() => handleCollectionClick('woody')} className="text-left hover:text-amber-800 transition-colors text-sm">
                    Woody & Oud Collection
                  </button>
                  <button onClick={() => handleCollectionClick('gourmand')} className="text-left hover:text-amber-800 transition-colors text-sm">
                    Gourmand & Vanilla Collection
                  </button>
                  <a href="#faq" onClick={() => setMobileMenuOpen(false)} className="hover:text-red-600 transition-colors">
                    Frequently Asked Questions
                  </a>
                  <a href="#journal" onClick={() => setMobileMenuOpen(false)} className="hover:text-red-600 transition-colors">
                    Editorial Diary
                  </a>
                </div>
              </div>

              <div className="space-y-2 text-xs text-zinc-600 font-sans">
                <p className="text-zinc-400 tracking-wider uppercase text-[10px]">Concierge Service</p>
                <p>Contact: {storeSettings?.contact_phone || '+880 1700-AROMA'}</p>
                <p>Email: {storeSettings?.contact_email || 'concierge@aromatica.com.bd'}</p>
              </div>
            </div>

            <div className="pt-6 border-t border-zinc-100 text-xs text-zinc-400">
              <p className="font-serif italic text-zinc-600">{storeSettings?.tagline || 'Luxury, By The ML.'}</p>
              <p className="mt-1">{storeSettings?.address || 'AROMATICA Dhaka, Bangladesh'}</p>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
