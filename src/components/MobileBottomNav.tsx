import React, { useEffect, useRef, useState } from 'react';
import { Home, LayoutGrid, Search, ShoppingBag, Sparkles } from 'lucide-react';

interface MobileBottomNavProps {
  activeTab: 'home' | 'shop' | 'search' | 'bag' | 'ai';
  cartCount: number;
  onNavigateHome: () => void;
  onNavigateShop: () => void;
  onOpenSearch: () => void;
  onOpenCart: () => void;
  onSelectAI: () => void;
  onOpenTesters?: () => void;
  testersActive?: boolean;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  cartCount,
  onNavigateHome,
  onNavigateShop,
  onOpenSearch,
  onOpenCart,
  onSelectAI,
  onOpenTesters,
  testersActive = false,
}) => {
  // Apple-style: tuck the bar away while scrolling down, bring it back on scroll up
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      const dy = y - lastY.current;
      if (Math.abs(dy) < 6) return;
      setHidden(dy > 0 && y > 160);
      lastY.current = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // One-time hint so first-time visitors know "AI" is a scent finder
  const HINT_KEY = 'pp_finder_hint_seen';
  const [hint, setHint] = useState(false);
  useEffect(() => {
    let seen = false;
    try { seen = localStorage.getItem(HINT_KEY) === '1'; } catch {}
    if (seen) return;
    const show = window.setTimeout(() => setHint(true), 2500);
    const hide = window.setTimeout(() => closeHint(), 14000);
    return () => { window.clearTimeout(show); window.clearTimeout(hide); };
  }, []);
  const closeHint = () => {
    setHint(false);
    try { localStorage.setItem(HINT_KEY, '1'); } catch {}
  };

  const navItems: { id: 'home' | 'shop' | 'tester' | 'search' | 'ai'; label: string; icon: any; action: () => void; badge?: number }[] = [
    {
      id: 'home' as const,
      label: 'Home',
      icon: Home,
      action: onNavigateHome,
    },
    {
      id: 'shop' as const,
      label: 'Shop',
      icon: LayoutGrid,
      action: onNavigateShop,
    },
    {
      id: 'tester' as const,
      label: 'Tester',
      icon: null,
      action: onOpenTesters || onNavigateShop,
    },
    {
      id: 'search' as const,
      label: 'Search',
      icon: Search,
      action: onOpenSearch,
    },
    {
      id: 'ai' as const,
      label: 'AI',
      icon: Sparkles,
      action: () => { closeHint(); onSelectAI(); },
    },
  ];

  return (
    <div className={`pp-dock fixed bottom-3 left-1/2 z-40 w-[82%] max-w-[320px] md:hidden pointer-events-none pb-[env(safe-area-inset-bottom)] select-none${hidden ? ' is-hidden' : ''}`}>
      {hint && !hidden && (
        <div className="pp-finder-hint pointer-events-auto" role="status">
          <span className="pp-finder-hint__eyebrow">Scent Finder</span>
          <span className="pp-finder-hint__title">New to perfume?</span>
          <span className="pp-finder-hint__text">Tap <b>AI</b>, pick your mood — we’ll match your scent.</span>
          <button type="button" onClick={closeHint} className="pp-finder-hint__ok">Got it</button>
        </div>
      )}
      {/* Floating Liquid-Glass Pill Outer Wrapper */}
      <nav
        aria-label="Mobile Bottom Navigation"
        className="pp-dock__glass relative pointer-events-auto rounded-full p-[3px]"
      >
        {/* Subtle top-edge glass specular curvature sheen */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-4 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/80 to-transparent"
        />

        {/* Navigation Items List */}
        <div className="relative flex items-center justify-between gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.id === 'tester' ? testersActive : activeTab === item.id && !testersActive;

            if (item.id === 'tester') {
              return (
                <button
                  key={item.id}
                  onClick={item.action}
                  className="relative flex flex-col items-center justify-center flex-1 py-1 cursor-pointer active:scale-95 transition-transform touch-manipulation"
                  aria-label="1.5ml testers"
                >
                  <span className={`pp-tester-chip${isActive ? ' is-active' : ''}`}>1.5ml</span>
                  <span className="text-[9.5px] tracking-tight mt-[3px] leading-tight" style={{ color: isActive ? 'var(--theme-primary)' : 'var(--theme-text-secondary)', fontWeight: isActive ? 600 : 400 }}>
                    Tester
                  </span>
                </button>
              );
            }

            return (
              <button
                key={item.id}
                onClick={item.action}
                className="group relative flex flex-col items-center justify-center flex-1 py-1 px-0.5 rounded-full transition-all duration-300 ease-out cursor-pointer active:scale-95 touch-manipulation"
                style={
                  isActive
                    ? {
                        background: 'rgba(255, 255, 255, 0.75)',
                        backdropFilter: 'blur(16px)',
                        WebkitBackdropFilter: 'blur(16px)',
                        color: 'var(--theme-primary)',
                      }
                    : {
                        color: 'var(--theme-text-secondary)',
                      }
                }
              >
                {/* Active inner subtle glass refraction highlight */}
                {isActive && (
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-x-2 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/90 to-transparent"
                  />
                )}

                <div className="relative flex items-center justify-center">
                  <Icon
                    className={`w-[18px] h-[18px] transition-transform duration-300 ease-out ${
                      isActive ? 'stroke-[1.9]' : 'stroke-[1.5] opacity-70'
                    }`}
                    style={{
                      color: isActive ? 'var(--theme-primary)' : 'inherit',
                    }}
                  />

                  {/* Cart Notification Counter Badge */}
                  {item.badge !== undefined && (
                    <span
                      className="absolute -top-1.5 -right-2.5 text-white text-[9px] font-medium min-w-[16px] h-4 px-1 rounded-full flex items-center justify-center shadow-[0_2px_6px_rgba(0,0,0,0.25)] border border-white/40"
                      style={{
                        backgroundColor: 'var(--theme-btn-bg)',
                        color: 'var(--theme-btn-text)',
                      }}
                    >
                      {item.badge > 99 ? '99+' : item.badge}
                    </span>
                  )}
                </div>

                <span
                  className={`text-[10px] tracking-tight mt-0.5 leading-tight transition-colors duration-200 ${
                    isActive ? 'font-bold' : 'font-normal opacity-80'
                  }`}
                  style={{
                    color: isActive ? 'var(--theme-primary)' : 'inherit',
                  }}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};
