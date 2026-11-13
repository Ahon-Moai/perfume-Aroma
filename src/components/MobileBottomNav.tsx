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
      action: onSelectAI,
    },
  ];

  return (
    <div className="fixed bottom-3 left-1/2 -translate-x-1/2 z-40 w-[86%] max-w-[340px] md:hidden pointer-events-none pb-[env(safe-area-inset-bottom)] select-none">
      {/* Floating Liquid-Glass Pill Outer Wrapper */}
      <nav
        aria-label="Mobile Bottom Navigation"
        className="relative pointer-events-auto rounded-full p-[3px] transition-all duration-300 ease-out"
        style={{
          /* Apple Liquid Glass styling: realistic translucent substrate + multi-layer specular & ambient illumination */
          background: 'rgba(255, 255, 255, 0.65)',
          backdropFilter: 'blur(25px) saturate(180%)',
          WebkitBackdropFilter: 'blur(25px) saturate(180%)',
          boxShadow: `
            0 20px 48px -8px rgba(0, 0, 0, 0.16),
            0 8px 20px -4px rgba(0, 0, 0, 0.08),
            0 0 0 1px rgba(255, 255, 255, 0.6) inset,
            0 1px 2px 0 rgba(255, 255, 255, 0.8) inset
          `,
          border: '1px solid rgba(255, 255, 255, 0.45)',
        }}
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
                  className="relative flex flex-col items-center justify-center flex-1 -my-1 cursor-pointer active:scale-95 touch-manipulation"
                  aria-label="1.5ml testers"
                >
                  <span className={`pp-tester-chip${isActive ? ' is-active' : ''}`}>
                    <span className="pp-tester-chip__ml">1.5</span>
                    <span className="pp-tester-chip__unit">ml</span>
                  </span>
                  <span className="text-[9.5px] tracking-tight mt-0.5 leading-tight font-medium" style={{ color: 'var(--theme-primary)' }}>
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
                    className={`w-[19px] h-[19px] transition-transform duration-300 ease-out ${
                      isActive ? 'scale-110 stroke-[2.2]' : 'stroke-[1.6] group-hover:scale-105 opacity-70'
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
