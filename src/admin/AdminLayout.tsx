import React, { useState } from 'react';
import {
  BarChart3,
  Package,
  ShoppingBag,
  Users,
  LayoutDashboard,
  Settings,
  Image as ImageIcon,
  LogOut,
  ExternalLink,
  Layers,
  Menu,
  X,
  User,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { AnalyticsDashboard } from './AnalyticsDashboard';
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
  const [activeTab, setActiveTab] = useState<'analytics' | 'products' | 'collections' | 'orders' | 'customers' | 'homepage' | 'settings' | 'media'>('analytics');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const navItems = [
    { id: 'analytics', label: 'Analytics & Insights', icon: BarChart3, desc: 'Sales performance & metrics' },
    { id: 'products', label: 'Products & Inventory', icon: Package, desc: 'Manage catalogue & stock' },
    { id: 'collections', label: 'Collections & Categories', icon: Layers, desc: 'Organize store taxonomy' },
    { id: 'orders', label: 'Orders & Invoices', icon: ShoppingBag, desc: 'Track customer orders' },
    { id: 'customers', label: 'Customer Directory', icon: Users, desc: 'Customer accounts & contact' },
    { id: 'homepage', label: 'Website Content', icon: LayoutDashboard, desc: 'Homepage sections & banners' },
    { id: 'settings', label: 'Store Settings', icon: Settings, desc: 'Preferences & configurations' },
    { id: 'media', label: 'Media Library', icon: ImageIcon, desc: 'Uploaded images & media' }
  ] as const;

  const activeNavItem = navItems.find(item => item.id === activeTab);

  return (
    <div className="min-h-screen bg-[#FBFBFB] text-[#111111] font-sans antialiased flex flex-col">
      {/* Top Admin Navigation Bar */}
      <header className="bg-white border-b border-[#EAEAEA] sticky top-0 z-40">
        <div className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">

          {/* Brand Logo & Section Title */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 -ml-2 text-[#737373] hover:text-[#111111] lg:hidden rounded-md hover:bg-[#F4F4F4]"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#111111] text-white flex items-center justify-center font-bold tracking-tighter text-sm rounded">
                A1
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold tracking-widest uppercase text-[#111111]">
                  AROMATICA <span className="font-light text-[#737373]">ATELIER</span>
                </span>
                <span className="text-[10px] text-[#737373] tracking-wider uppercase hidden sm:block">
                  Admin Control Suite
                </span>
              </div>
            </div>

            <div className="h-4 w-[1px] bg-[#EAEAEA] hidden md:block" />

            {/* Current Page Title */}
            <div className="hidden md:flex items-center gap-2 text-xs font-medium text-[#737373]">
              <span>Console</span>
              <ChevronRight className="w-3.5 h-3.5 text-[#A3A3A3]" />
              <span className="text-[#111111] font-semibold">{activeNavItem?.label}</span>
            </div>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={onSwitchToStorefront}
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-white hover:bg-[#F4F4F4] text-[#111111] text-xs font-medium border border-[#EAEAEA] rounded transition-all shadow-2xs hover:border-[#111111]"
            >
              <ExternalLink className="w-3.5 h-3.5 text-[#737373]" />
              <span className="hidden sm:inline">View Storefront</span>
            </button>

            <div className="h-4 w-[1px] bg-[#EAEAEA]" />

            {/* User Profile Menu */}
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2.5 p-1.5 hover:bg-[#F4F4F4] rounded transition-colors"
              >
                <div className="w-7 h-7 bg-[#111111] text-white rounded-full flex items-center justify-center text-xs font-mono font-medium">
                  {typeof user?.username === 'string' ? user.username.charAt(0).toUpperCase() : 'A'}
                </div>
                <div className="hidden sm:flex flex-col text-left leading-tight">
                  <span className="text-xs font-semibold text-[#111111]">
                    {typeof user?.username === 'string' ? user.username : 'Admin'}
                  </span>
                  <span className="text-[10px] text-[#737373] uppercase font-mono">
                    {user?.role || 'Administrator'}
                  </span>
                </div>
              </button>

              {/* User Dropdown */}
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-[#EAEAEA] rounded shadow-lg py-1.5 z-50 animate-in fade-in slide-in-from-top-1 duration-100">
                  <div className="px-3 py-2 border-b border-[#EAEAEA]">
                    <p className="text-xs font-semibold text-[#111111]">{user?.username}</p>
                    <p className="text-[11px] text-[#737373] truncate">{user?.email || 'admin@aromatica.one'}</p>
                  </div>

                  <div className="px-3 py-2 text-[11px] text-[#737373] flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Session: CSRF Authenticated</span>
                  </div>

                  <div className="border-t border-[#EAEAEA] pt-1">
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        onLogout();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-600 hover:bg-red-50 text-left transition-colors font-medium cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </header>

      {/* Main Admin Workspace */}
      <div className="flex-1 max-w-[1536px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col lg:flex-row gap-8">

        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-64 shrink-0 space-y-1">
          <div className="px-3 py-2 mb-2">
            <span className="text-[10px] font-semibold tracking-wider text-[#737373] uppercase">
              Management Suite
            </span>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-xs font-medium rounded transition-all text-left cursor-pointer ${
                    isActive
                      ? 'bg-[#111111] text-white shadow-2xs'
                      : 'text-[#737373] hover:text-[#111111] hover:bg-[#F4F4F4]'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-[#737373]'}`} />
                  <div className="flex flex-col">
                    <span className="font-semibold">{item.label}</span>
                  </div>
                </button>
              );
            })}
          </nav>

          <div className="pt-6 border-t border-[#EAEAEA] mt-6 px-3">
            <div className="p-3 bg-[#F8F8F8] border border-[#EAEAEA] rounded text-[11px] text-[#737373]">
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="font-semibold text-[#111111]">System Healthy</span>
              </div>
              <p className="text-[10px]">Connected to MariaDB/SQLite PDO engine.</p>
            </div>
          </div>
        </aside>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <div
              className="fixed inset-0 bg-black/40 backdrop-blur-xs"
              onClick={() => setIsMobileMenuOpen(false)}
            />

            <div className="relative w-4/5 max-w-xs bg-white h-full shadow-2xl flex flex-col p-6 z-10 border-r border-[#EAEAEA]">
              <div className="flex items-center justify-between pb-4 border-b border-[#EAEAEA]">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-[#111111] text-white flex items-center justify-center font-bold text-xs rounded">
                    A1
                  </div>
                  <span className="font-semibold text-xs tracking-wider uppercase">Menu Navigation</span>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1 text-[#737373] hover:text-[#111111]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="py-4 space-y-1 flex-1 overflow-y-auto">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 text-xs font-medium rounded transition-all text-left ${
                        isActive
                          ? 'bg-[#111111] text-white'
                          : 'text-[#737373] hover:bg-[#F4F4F4]'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>

              <div className="pt-4 border-t border-[#EAEAEA]">
                <button
                  onClick={onLogout}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded text-xs font-medium"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Workspace Main Content */}
        <main className="flex-1 min-w-0">
          {activeTab === 'analytics' && <AnalyticsDashboard csrfToken={csrfToken} />}
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
