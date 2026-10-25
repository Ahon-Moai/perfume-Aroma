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
  ShieldCheck,
  ChevronRight,
  Sun,
  Moon
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
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('admin_theme') === 'dark';
  });

  const toggleDarkMode = () => {
    const nextMode = !isDarkMode;
    setIsDarkMode(nextMode);
    localStorage.setItem('admin_theme', nextMode ? 'dark' : 'light');
  };

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
    <div className={`min-h-screen font-sans antialiased flex flex-col transition-colors duration-200 ${
      isDarkMode
        ? 'bg-[#0a0a0a] text-[#f4f4f5] dark'
        : 'bg-[#FBFBFB] text-[#111111]'
    }`}>
      {/* Top Admin Navigation Bar */}
      <header className={`border-b sticky top-0 z-40 transition-colors duration-200 ${
        isDarkMode
          ? 'bg-[#121212] border-[#27272a]'
          : 'bg-white border-[#EAEAEA]'
      }`}>
        <div className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand Logo & Section Title */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`p-2 -ml-2 lg:hidden rounded-md transition-colors ${
                isDarkMode ? 'text-[#a1a1aa] hover:text-white hover:bg-[#27272a]' : 'text-[#737373] hover:text-[#111111] hover:bg-[#F4F4F4]'
              }`}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 font-bold tracking-tighter text-sm rounded flex items-center justify-center ${
                isDarkMode ? 'bg-amber-500 text-black' : 'bg-[#111111] text-white'
              }`}>
                A1
              </div>
              <div className="flex flex-col">
                <span className={`text-xs font-bold tracking-widest uppercase ${
                  isDarkMode ? 'text-white' : 'text-[#111111]'
                }`}>
                  AROMATICA <span className={`font-light ${isDarkMode ? 'text-[#a1a1aa]' : 'text-[#737373]'}`}>ATELIER</span>
                </span>
                <span className={`text-[10px] tracking-wider uppercase hidden sm:block ${
                  isDarkMode ? 'text-[#a1a1aa]' : 'text-[#737373]'
                }`}>
                  Admin Control Suite
                </span>
              </div>
            </div>

            <div className={`h-4 w-[1px] hidden md:block ${isDarkMode ? 'bg-[#27272a]' : 'bg-[#EAEAEA]'}`} />

            {/* Current Page Title */}
            <div className={`hidden md:flex items-center gap-2 text-xs font-medium ${
              isDarkMode ? 'text-[#a1a1aa]' : 'text-[#737373]'
            }`}>
              <span>Console</span>
              <ChevronRight className="w-3.5 h-3.5 opacity-60" />
              <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-[#111111]'}`}>{activeNavItem?.label}</span>
            </div>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-3">
            {/* Dark Mode Toggle Button */}
            <button
              onClick={toggleDarkMode}
              className={`p-2 rounded border transition-all cursor-pointer flex items-center gap-1.5 text-xs font-medium ${
                isDarkMode
                  ? 'bg-[#1e1e24] border-[#3f3f46] text-amber-400 hover:bg-[#27272a]'
                  : 'bg-white border-[#EAEAEA] text-[#737373] hover:text-[#111111] hover:bg-[#F4F4F4]'
              }`}
              title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDarkMode ? (
                <>
                  <Sun className="w-4 h-4 text-amber-400" />
                  <span className="hidden sm:inline text-white">Light Mode</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-zinc-700" />
                  <span className="hidden sm:inline">Dark Mode</span>
                </>
              )}
            </button>

            <button
              onClick={onSwitchToStorefront}
              className={`inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium border rounded transition-all shadow-2xs cursor-pointer ${
                isDarkMode
                  ? 'bg-[#18181b] hover:bg-[#27272a] text-white border-[#27272a]'
                  : 'bg-white hover:bg-[#F4F4F4] text-[#111111] border-[#EAEAEA]'
              }`}
            >
              <ExternalLink className={`w-3.5 h-3.5 ${isDarkMode ? 'text-[#a1a1aa]' : 'text-[#737373]'}`} />
              <span className="hidden sm:inline">View Storefront</span>
            </button>

            <div className={`h-4 w-[1px] ${isDarkMode ? 'bg-[#27272a]' : 'bg-[#EAEAEA]'}`} />

            {/* User Profile Menu */}
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className={`flex items-center gap-2.5 p-1.5 rounded transition-colors cursor-pointer ${
                  isDarkMode ? 'hover:bg-[#27272a]' : 'hover:bg-[#F4F4F4]'
                }`}
              >
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-mono font-medium ${
                  isDarkMode ? 'bg-amber-500 text-black' : 'bg-[#111111] text-white'
                }`}>
                  {typeof user?.username === 'string' ? user.username.charAt(0).toUpperCase() : 'A'}
                </div>
                <div className="hidden sm:flex flex-col text-left leading-tight">
                  <span className={`text-xs font-semibold ${isDarkMode ? 'text-white' : 'text-[#111111]'}`}>
                    {typeof user?.username === 'string' ? user.username : 'Admin'}
                  </span>
                  <span className={`text-[10px] uppercase font-mono ${isDarkMode ? 'text-[#a1a1aa]' : 'text-[#737373]'}`}>
                    {user?.role || 'Administrator'}
                  </span>
                </div>
              </button>

              {/* User Dropdown */}
              {isUserMenuOpen && (
                <div className={`absolute right-0 mt-2 w-56 border rounded shadow-lg py-1.5 z-50 animate-in fade-in slide-in-from-top-1 duration-100 ${
                  isDarkMode ? 'bg-[#18181b] border-[#27272a] text-white' : 'bg-white border-[#EAEAEA] text-[#111111]'
                }`}>
                  <div className={`px-3 py-2 border-b ${isDarkMode ? 'border-[#27272a]' : 'border-[#EAEAEA]'}`}>
                    <p className={`text-xs font-semibold ${isDarkMode ? 'text-white' : 'text-[#111111]'}`}>{user?.username}</p>
                    <p className={`text-[11px] truncate ${isDarkMode ? 'text-[#a1a1aa]' : 'text-[#737373]'}`}>{user?.email || 'admin@aromatica.one'}</p>
                  </div>

                  <div className={`px-3 py-2 text-[11px] flex items-center gap-1.5 ${isDarkMode ? 'text-[#a1a1aa]' : 'text-[#737373]'}`}>
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Session: CSRF Authenticated</span>
                  </div>

                  <div className={`border-t pt-1 ${isDarkMode ? 'border-[#27272a]' : 'border-[#EAEAEA]'}`}>
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        onLogout();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-500 hover:bg-red-500/10 text-left transition-colors font-medium cursor-pointer"
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
            <span className={`text-[10px] font-semibold tracking-wider uppercase ${
              isDarkMode ? 'text-[#a1a1aa]' : 'text-[#737373]'
            }`}>
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
                      ? isDarkMode
                        ? 'bg-amber-500 text-black font-bold shadow-2xs'
                        : 'bg-[#111111] text-white shadow-2xs'
                      : isDarkMode
                        ? 'text-[#a1a1aa] hover:text-white hover:bg-[#18181b]'
                        : 'text-[#737373] hover:text-[#111111] hover:bg-[#F4F4F4]'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${
                    isActive
                      ? isDarkMode ? 'text-black' : 'text-white'
                      : isDarkMode ? 'text-[#a1a1aa]' : 'text-[#737373]'
                  }`} />
                  <div className="flex flex-col">
                    <span className="font-semibold">{item.label}</span>
                  </div>
                </button>
              );
            })}
          </nav>

          <div className={`pt-6 border-t mt-6 px-3 ${isDarkMode ? 'border-[#27272a]' : 'border-[#EAEAEA]'}`}>
            <div className={`p-3 border rounded text-[11px] ${
              isDarkMode
                ? 'bg-[#121212] border-[#27272a] text-[#a1a1aa]'
                : 'bg-[#F8F8F8] border-[#EAEAEA] text-[#737373]'
            }`}>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-[#111111]'}`}>System Healthy</span>
              </div>
              <p className="text-[10px]">Connected to MariaDB/SQLite PDO engine.</p>
            </div>
          </div>
        </aside>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-xs"
              onClick={() => setIsMobileMenuOpen(false)}
            />

            <div className={`relative w-4/5 max-w-xs h-full shadow-2xl flex flex-col p-6 z-10 border-r ${
              isDarkMode ? 'bg-[#121212] border-[#27272a] text-white' : 'bg-white border-[#EAEAEA] text-[#111111]'
            }`}>
              <div className={`flex items-center justify-between pb-4 border-b ${isDarkMode ? 'border-[#27272a]' : 'border-[#EAEAEA]'}`}>
                <div className="flex items-center gap-2">
                  <div className={`w-7 h-7 flex items-center justify-center font-bold text-xs rounded ${
                    isDarkMode ? 'bg-amber-500 text-black' : 'bg-[#111111] text-white'
                  }`}>
                    A1
                  </div>
                  <span className="font-semibold text-xs tracking-wider uppercase">Menu Navigation</span>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`p-1 ${isDarkMode ? 'text-[#a1a1aa] hover:text-white' : 'text-[#737373] hover:text-[#111111]'}`}
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
                          ? isDarkMode
                            ? 'bg-amber-500 text-black font-bold'
                            : 'bg-[#111111] text-white'
                          : isDarkMode
                            ? 'text-[#a1a1aa] hover:bg-[#18181b]'
                            : 'text-[#737373] hover:bg-[#F4F4F4]'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>

              <div className={`pt-4 border-t ${isDarkMode ? 'border-[#27272a]' : 'border-[#EAEAEA]'}`}>
                <button
                  onClick={onLogout}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-500/10 text-red-500 rounded text-xs font-medium cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Workspace Main Content */}
        <main className={`flex-1 min-w-0 p-4 sm:p-6 rounded-xl border transition-colors ${
          isDarkMode
            ? 'bg-[#121212] border-[#27272a] text-zinc-100'
            : 'bg-white border-[#EAEAEA] text-[#111111]'
        }`}>
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
