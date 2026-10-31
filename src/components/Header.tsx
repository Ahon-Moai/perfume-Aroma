import React, { useState } from 'react';
import { X, Search } from 'lucide-react';

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
  onNavigateHome,
  onNavigateToCollection,
  storeSettings
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleCollectionClick = (slug: string) => {
    setMobileMenuOpen(false);
    if (onNavigateToCollection) {
      onNavigateToCollection(slug);
    } else {
      window.location.href = `/collections/${slug}`;
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#ECE8E1] transition-all duration-200">
      {/* Main Top Navigation matching reference */}
      <div className="w-full px-5 sm:px-8 md:px-12 pt-5 pb-3 flex items-center justify-between">
        {/* Left: Red ++ Brand Symbol */}
        <div className="flex items-center">
          <a
            href="/"
            onClick={(e) => {
              if (onNavigateHome) {
                e.preventDefault();
                onNavigateHome();
              }
            }}
            className="text-[#FF1801] text-3xl sm:text-4xl font-black tracking-[-0.15em] hover:opacity-85 transition-opacity inline-flex items-center select-none"
            aria-label="Home"
          >
            ++
          </a>
        </div>

        {/* Center: Desktop Navigation Links (Shop, Explore Decants, About Us) */}
        <nav className="hidden md:flex items-center gap-10 lg:gap-14 text-[#FF1801] text-lg lg:text-xl font-medium tracking-tight">
          <button
            onClick={() => handleCollectionClick('all')}
            className="hover:opacity-75 transition-opacity cursor-pointer"
          >
            Shop
          </button>
          <button
            onClick={() => {
              const el = document.getElementById('new-arrivals');
              if (el) {
                el.scrollIntoView({ behavior: 'smooth' });
              } else {
                handleCollectionClick('all');
              }
            }}
            className="hover:opacity-75 transition-opacity cursor-pointer"
          >
            Explore Decants
          </button>
          <button
            onClick={() => {
              const el = document.getElementById('studio-section') || document.getElementById('why-section');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="hover:opacity-75 transition-opacity cursor-pointer"
          >
            About Us
          </button>
        </nav>

        {/* Right: Actions (Bag (count), Menu) */}
        <div className="flex items-center gap-6 sm:gap-8 text-[#FF1801] text-lg lg:text-xl font-medium tracking-tight">
          <button
            onClick={onOpenCart}
            className="hover:opacity-75 transition-opacity cursor-pointer inline-flex items-center gap-1"
            aria-label={`Shopping Bag (${cartCount})`}
          >
            Bag ({cartCount})
          </button>

          <button
            onClick={() => setMobileMenuOpen(true)}
            className="hover:opacity-75 transition-opacity cursor-pointer"
            aria-label="Open Navigation Menu"
          >
            Menu
          </button>
        </div>
      </div>

      {/* Slide-out Menu Drawer for both Mobile and Desktop Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm animate-fade-in flex justify-end">
          <div className="bg-[#ECE8E1] text-[#FF1801] w-full max-w-sm sm:max-w-md h-full p-6 sm:p-8 shadow-2xl flex flex-col justify-between overflow-y-auto">
            <div className="space-y-8">
              {/* Drawer Header */}
              <div className="flex items-center justify-between border-b border-[#FF1801]/30 pb-4">
                <span className="text-3xl font-black tracking-[-0.15em]">++</span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 hover:opacity-70 transition-opacity cursor-pointer"
                  aria-label="Close menu"
                >
                  <X className="w-6 h-6 stroke-[2.5]" />
                </button>
              </div>

              {/* Navigation Links */}
              <nav className="flex flex-col space-y-4 text-2xl font-semibold tracking-tight">
                <button
                  onClick={() => handleCollectionClick('all')}
                  className="text-left hover:opacity-75 transition-opacity"
                >
                  Shop
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    const el = document.getElementById('new-arrivals');
                    if (el) {
                      el.scrollIntoView({ behavior: 'smooth' });
                    } else {
                      handleCollectionClick('all');
                    }
                  }}
                  className="text-left hover:opacity-75 transition-opacity"
                >
                  Explore Decants
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    const el = document.getElementById('studio-section') || document.getElementById('why-section');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="text-left hover:opacity-75 transition-opacity"
                >
                  About Us
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenSearch();
                  }}
                  className="text-left hover:opacity-75 transition-opacity inline-flex items-center gap-2 pt-2 text-xl"
                >
                  <Search className="w-5 h-5 stroke-[2.5]" />
                  <span>Search Catalog</span>
                </button>
              </nav>

              {/* Store & Contact Information */}
              <div className="pt-6 border-t border-[#FF1801]/30 space-y-2 text-sm text-[#FF1801]/90">
                <p className="font-bold tracking-wider uppercase text-xs">Customer Care & Studio</p>
                <p>Location: 100 Main St., Studio</p>
                <p>Email: {storeSettings?.contact_email || 'hello@outfitstore.com'}</p>
                <p>Phone: {storeSettings?.contact_phone || '+1 (555) 019-2834'}</p>
              </div>
            </div>

            <div className="pt-6 border-t border-[#FF1801]/30 text-xs text-[#FF1801]/80 flex justify-between items-center">
              <span>VISIT ++ WEBSITE</span>
              <span>© 2026</span>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
