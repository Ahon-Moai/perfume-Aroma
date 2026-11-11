import React, { useState, useRef, useEffect } from 'react';
import { X, Search, Palette, Check, ChevronDown } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface HeaderProps {
  cartCount: number;
  onOpenCart: () => void;
  onOpenSearch: () => void;
  onOpenWishlist: () => void;
  onOpenFinder?: () => void;
  onNavigateHome?: () => void;
  onNavigateToCollection?: (slug: string) => void;
  storeSettings?: any;
}

export const Header: React.FC<HeaderProps> = ({
  cartCount,
  onOpenCart,
  onOpenSearch,
  onOpenFinder,
  onNavigateHome,
  onNavigateToCollection,
  storeSettings
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [themeDropdownOpen, setThemeDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { theme, setTheme, themes, currentTheme } = useTheme();

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setThemeDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCollectionClick = (slug: string) => {
    setMobileMenuOpen(false);
    if (onNavigateToCollection) {
      onNavigateToCollection(slug);
    } else {
      window.location.href = `/collections/${slug}`;
    }
  };

  return (
    <header
      className="sticky top-0 z-40 w-full border-b transition-colors duration-200"
      style={{
        backgroundColor: 'var(--theme-surface)',
        borderColor: 'var(--theme-border-subtle)',
      }}
    >
      {/* Main Top Navigation matching reference */}
      <div className="w-full px-5 sm:px-8 md:px-12 pt-5 pb-3 flex items-center justify-between">
        {/* Left: Brand Symbol */}
        <div className="flex items-center">
          <a
            href="/"
            onClick={(e) => {
              if (onNavigateHome) {
                e.preventDefault();
                onNavigateHome();
              }
            }}
            className="text-3xl sm:text-4xl font-black tracking-[-0.15em] hover:opacity-85 transition-opacity inline-flex items-center select-none"
            style={{ color: 'var(--theme-primary)' }}
            aria-label="Home"
          >
            ++
          </a>
        </div>

        {/* Center: Desktop Navigation Links (Shop, Explore Decants, About Us) */}
        <nav
          className="hidden md:flex items-center gap-8 lg:gap-12 text-lg lg:text-xl font-medium tracking-tight"
          style={{ color: 'var(--theme-primary)' }}
        >
          <button
            onClick={() => handleCollectionClick('all')}
            className="hover:opacity-75 transition-opacity cursor-pointer"
          >
            Shop
          </button>
          <button
            onClick={onOpenFinder}
            className="hover:opacity-75 transition-opacity cursor-pointer inline-flex items-center gap-1.5"
          >
            <span>AI Scent Finder</span>
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

        {/* Right: Actions (Theme Selector, Bag (count), Menu) */}
        <div
          className="flex items-center gap-4 sm:gap-6 text-lg lg:text-xl font-medium tracking-tight"
          style={{ color: 'var(--theme-primary)' }}
        >
          {/* Theme Selector Popover (Desktop) */}
          <div className="relative hidden md:block" ref={dropdownRef}>
            <button
              onClick={() => setThemeDropdownOpen(!themeDropdownOpen)}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs sm:text-sm font-semibold tracking-wider uppercase hover:opacity-80 transition-all cursor-pointer"
              style={{
                borderColor: 'var(--theme-primary)',
                color: 'var(--theme-primary)',
                backgroundColor: 'transparent',
              }}
              aria-label="Select colour theme"
              aria-expanded={themeDropdownOpen}
            >
              {/* Swatch mini preview of active theme */}
              <div className="flex -space-x-1 items-center">
                <span
                  className="w-2.5 h-2.5 rounded-full border border-black/20"
                  style={{ backgroundColor: currentTheme.colors.primary }}
                />
                <span
                  className="w-2.5 h-2.5 rounded-full border border-black/20"
                  style={{ backgroundColor: currentTheme.colors.secondary }}
                />
                <span
                  className="w-2.5 h-2.5 rounded-full border border-black/20"
                  style={{ backgroundColor: currentTheme.colors.accent }}
                />
              </div>
              <span className="text-[11px] lg:text-xs font-bold">{currentTheme.name}</span>
              <ChevronDown className="w-3.5 h-3.5 opacity-70" />
            </button>

            {/* Dropdown Menu */}
            {themeDropdownOpen && (
              <div
                className="absolute right-0 mt-2 w-64 rounded-xl shadow-xl border p-2 z-50 backdrop-blur-md"
                style={{
                  backgroundColor: 'var(--theme-surface-card)',
                  borderColor: 'var(--theme-border-subtle)',
                }}
              >
                <div
                  className="px-3 py-2 text-[10px] uppercase font-bold tracking-widest border-b mb-1"
                  style={{
                    color: 'var(--theme-text-secondary)',
                    borderColor: 'var(--theme-border-subtle)',
                  }}
                >
                  Choose Palette
                </div>
                <div className="space-y-1">
                  {themes.map((t) => {
                    const isSelected = t.id === theme;
                    return (
                      <button
                        key={t.id}
                        onClick={() => {
                          setTheme(t.id);
                          setThemeDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                          isSelected ? 'font-bold' : 'hover:opacity-80'
                        }`}
                        style={{
                          backgroundColor: isSelected ? 'var(--theme-surface)' : 'transparent',
                          color: 'var(--theme-primary)',
                        }}
                      >
                        <div className="flex items-center gap-2.5">
                          {/* 3 Color Swatch Pills */}
                          <div className="flex items-center -space-x-1">
                            <span
                              className="w-3.5 h-3.5 rounded-full border border-black/20"
                              style={{ backgroundColor: t.colors.primary }}
                            />
                            <span
                              className="w-3.5 h-3.5 rounded-full border border-black/20"
                              style={{ backgroundColor: t.colors.secondary }}
                            />
                            <span
                              className="w-3.5 h-3.5 rounded-full border border-black/20"
                              style={{ backgroundColor: t.colors.accent }}
                            />
                          </div>
                          <span>{t.name}</span>
                        </div>
                        {isSelected && <Check className="w-4 h-4 ml-2" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

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
          <div
            className="w-full max-w-sm sm:max-w-md h-full p-6 sm:p-8 shadow-2xl flex flex-col justify-between overflow-y-auto"
            style={{
              backgroundColor: 'var(--theme-surface)',
              color: 'var(--theme-primary)',
            }}
          >
            <div className="space-y-8">
              {/* Drawer Header */}
              <div
                className="flex items-center justify-between border-b pb-4"
                style={{ borderColor: 'var(--theme-border-subtle)' }}
              >
                <span className="text-3xl font-black tracking-[-0.15em]">++</span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 hover:opacity-70 transition-opacity cursor-pointer"
                  aria-label="Close menu"
                >
                  <X className="w-6 h-6 stroke-[2.5]" />
                </button>
              </div>

              {/* Theme Selector Section in Mobile Drawer */}
              <div
                className="p-4 rounded-xl border space-y-3"
                style={{
                  backgroundColor: 'var(--theme-surface-card)',
                  borderColor: 'var(--theme-border-subtle)',
                }}
              >
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
                  <Palette className="w-4 h-4" />
                  <span>Colour Scheme</span>
                </div>
                <div className="space-y-1.5">
                  {themes.map((t) => {
                    const isSelected = t.id === theme;
                    return (
                      <button
                        key={t.id}
                        onClick={() => setTheme(t.id)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                          isSelected ? 'font-bold' : 'hover:opacity-80'
                        }`}
                        style={{
                          backgroundColor: isSelected ? 'var(--theme-surface)' : 'transparent',
                          color: 'var(--theme-primary)',
                          border: isSelected ? '1px solid var(--theme-border)' : '1px solid transparent',
                        }}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="flex items-center -space-x-1">
                            <span
                              className="w-4 h-4 rounded-full border border-black/20"
                              style={{ backgroundColor: t.colors.primary }}
                            />
                            <span
                              className="w-4 h-4 rounded-full border border-black/20"
                              style={{ backgroundColor: t.colors.secondary }}
                            />
                            <span
                              className="w-4 h-4 rounded-full border border-black/20"
                              style={{ backgroundColor: t.colors.accent }}
                            />
                          </div>
                          <span>{t.name}</span>
                        </div>
                        {isSelected && <Check className="w-4 h-4" />}
                      </button>
                    );
                  })}
                </div>
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
                    onOpenFinder?.();
                  }}
                  className="text-left hover:opacity-75 transition-opacity"
                >
                  AI Scent Finder
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
              <div
                className="pt-6 border-t space-y-2 text-sm opacity-90"
                style={{ borderColor: 'var(--theme-border-subtle)' }}
              >
                <p className="font-bold tracking-wider uppercase text-xs">Customer Care & Studio</p>
                <p>Location: 100 Main St., Studio</p>
                <p>Email: {storeSettings?.contact_email || 'hello@outfitstore.com'}</p>
                <p>Phone: {storeSettings?.contact_phone || '+1 (555) 019-2834'}</p>
              </div>
            </div>

            <div
              className="pt-6 border-t text-xs opacity-80 flex justify-between items-center"
              style={{ borderColor: 'var(--theme-border-subtle)' }}
            >
              <span>VISIT ++ WEBSITE</span>
              <span>© 2026</span>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
