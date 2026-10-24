import React from 'react';
import { Home, LayoutGrid, Search, ShoppingBag, Sparkles } from 'lucide-react';

interface MobileBottomNavProps {
  activeTab: 'home' | 'shop' | 'search' | 'bag' | 'ai';
  cartCount: number;
  onNavigateHome: () => void;
  onNavigateShop: () => void;
  onOpenSearch: () => void;
  onOpenCart: () => void;
  onSelectAI: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  cartCount,
  onNavigateHome,
  onNavigateShop,
  onOpenSearch,
  onOpenCart,
  onSelectAI,
}) => {
  const navItems = [
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
      id: 'search' as const,
      label: 'Search',
      icon: Search,
      action: onOpenSearch,
    },
    {
      id: 'bag' as const,
      label: 'Bag',
      icon: ShoppingBag,
      action: onOpenCart,
      badge: cartCount > 0 ? cartCount : undefined,
    },
    {
      id: 'ai' as const,
      label: 'AI',
      icon: Sparkles,
      action: onSelectAI,
    },
  ];

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[92%] max-w-md md:hidden pointer-events-none pb-[env(safe-area-inset-bottom)]">
      {/* Floating Liquid-Glass Pill Container */}
      <nav
        className="pointer-events-auto bg-white/85 backdrop-blur-xl border border-zinc-200/80 shadow-[0_8px_32px_rgba(0,0,0,0.12)] rounded-full px-3 py-1.5 flex items-center justify-between transition-all duration-300"
        aria-label="Mobile Bottom Navigation"
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={item.action}
              className={`relative flex flex-col items-center justify-center flex-1 py-1 px-2 rounded-full transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'bg-zinc-100/90 text-zinc-950 font-medium'
                  : 'text-zinc-500 hover:text-zinc-900 active:scale-95'
              }`}
            >
              <div className="relative flex items-center justify-center">
                <Icon
                  className={`w-5 h-5 transition-transform duration-200 ${
                    isActive ? 'scale-110 stroke-[2]' : 'stroke-[1.6]'
                  }`}
                />
                {item.badge !== undefined && (
                  <span className="absolute -top-1 -right-2 bg-zinc-900 text-white text-[9px] font-mono font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </div>
              <span
                className={`text-[10px] tracking-tight mt-0.5 transition-colors ${
                  isActive ? 'text-zinc-950 font-semibold' : 'text-zinc-500'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};
