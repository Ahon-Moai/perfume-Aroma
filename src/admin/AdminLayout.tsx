import React, { useState } from 'react';
import { Package, ShoppingBag, Users, LayoutDashboard, Settings, Image as ImageIcon, Sparkles, LogOut, ExternalLink, Layers } from 'lucide-react';
import { ProductManager } from './ProductManager';
import { CollectionManager } from './CollectionManager';
import { OrderManager } from './OrderManager';
import { CustomerManager } from './CustomerManager';
import { HomepageCMS } from './HomepageCMS';
import { SettingsCMS } from './SettingsCMS';
import { MediaManager } from './MediaManager';

interface AdminLayoutProps {
  user: {
    username: string;
    email: string;
    role: string;
  };
  csrfToken: string;
  onLogout: () => void;
  onSwitchToStorefront: () => void;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  user,
  csrfToken,
  onLogout,
  onSwitchToStorefront
}) => {
  const [activeTab, setActiveTab] = useState<'products' | 'collections' | 'orders' | 'customers' | 'homepage' | 'settings' | 'media'>('products');

  const navItems = [
    { id: 'products', label: 'Products & Variants', icon: Package },
    { id: 'collections', label: 'Collections Manager', icon: Layers },
    { id: 'orders', label: 'Orders & Invoice', icon: ShoppingBag },
    { id: 'customers', label: 'Customer Records', icon: Users },
    { id: 'homepage', label: 'Homepage Builder', icon: LayoutDashboard },
    { id: 'settings', label: 'Store Settings', icon: Settings },
    { id: 'media', label: 'Media Library', icon: ImageIcon }
  ] as const;

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white font-sans selection:bg-amber-400 selection:text-black flex flex-col">
      {/* Top Admin Navigation Header */}
      <header className="bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800/80 sticky top-0 z-40">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-gradient-to-r from-amber-400 to-amber-500 text-black text-[10px] font-bold tracking-widest uppercase rounded shadow-sm">
              <Sparkles className="w-3 h-3 text-black" />
              <span>ATELIER CMS</span>
            </div>
            <div>
              <h1 className="font-serif text-lg font-normal tracking-wide text-white flex items-center gap-2">
                <span>AROMATICA ONE</span>
                <span className="text-[10px] font-mono text-amber-400 bg-amber-400/10 border border-amber-400/20 px-1.5 py-0.2 rounded uppercase">v2.4</span>
              </h1>
              <p className="text-[10px] text-zinc-400 tracking-wider uppercase hidden sm:block">Luxury Decant Management Suite</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={onSwitchToStorefront}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 text-xs font-sans uppercase tracking-wider transition-all cursor-pointer border border-zinc-700/60 shadow-sm hover:border-amber-400/40"
            >
              <ExternalLink className="w-3.5 h-3.5 text-amber-300" />
              <span>View Storefront</span>
            </button>

            <div className="h-4 w-[1px] bg-zinc-800 hidden sm:block" />

            <div className="hidden sm:flex items-center gap-2 text-xs">
              <span className="text-zinc-500">Master User:</span>
              <span className="font-mono font-semibold text-amber-300">
                {typeof user?.username === 'string' ? user.username : 'Admin'}
              </span>
            </div>

            <button
              onClick={onLogout}
              className="p-2 text-zinc-400 hover:text-red-400 transition-colors cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Overview Stat Ribbon */}
      <div className="bg-zinc-950/60 border-b border-zinc-800/60 py-3">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between text-[11px] text-zinc-400 font-mono overflow-x-auto gap-6">
          <div className="flex items-center gap-2 shrink-0">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>STORE STATUS: <strong className="text-white font-sans font-semibold">LIVE ONLINE</strong></span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span>CURRENCY: <strong className="text-amber-300 font-sans font-semibold">BDT (৳)</strong></span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span>DATABASE: <strong className="text-white font-sans font-semibold">AUTHENTICATED PDO</strong></span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span>SECURITY: <strong className="text-emerald-400 font-sans font-semibold">CSRF PROTECTED</strong></span>
          </div>
        </div>
      </div>

      {/* Main Admin Workspace */}
      <div className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row gap-8">
        {/* Sidebar Nav */}
        <aside className="w-full md:w-64 shrink-0 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-xs tracking-wider uppercase font-sans font-medium transition-all text-left cursor-pointer border-l-2 ${
                  isActive
                    ? 'bg-zinc-900 text-amber-300 border-amber-400 font-semibold'
                    : 'bg-zinc-950 text-zinc-400 hover:text-white border-transparent hover:bg-zinc-900/50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-zinc-500'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </aside>

        {/* Workspace Content View */}
        <main className="flex-1">
          {activeTab === 'products' && <ProductManager csrfToken={csrfToken} />}
          {activeTab === 'collections' && <CollectionManager csrfToken={csrfToken} />}
          {activeTab === 'orders' && <OrderManager csrfToken={csrfToken} />}
          {activeTab === 'customers' && <CustomerManager csrfToken={csrfToken} />}
          {activeTab === 'homepage' && <HomepageCMS csrfToken={csrfToken} />}
          {activeTab === 'settings' && <SettingsCMS csrfToken={csrfToken} />}
          {activeTab === 'media' && <MediaManager csrfToken={csrfToken} />}
        </main>
      </div>
    </div>
  );
};
