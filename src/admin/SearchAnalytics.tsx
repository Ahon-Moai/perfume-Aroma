import React, { useState, useEffect } from 'react';
import {
  Search,
  TrendingUp,
  AlertCircle,
  Package,
  Layers,
  Calendar,
  RefreshCw,
  Clock,
  Sparkles,
  ShoppingBag,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Filter,
  CheckCircle2,
  XCircle,
  AlertTriangle
} from 'lucide-react';

interface DecantVariant {
  id: string;
  size: string;
  size_ml: number;
  stock_qty: number;
  is_available: boolean;
  ml_sufficient: boolean;
}

interface ProductAvailability {
  exists: boolean;
  status: 'available' | 'low_stock' | 'unavailable';
  status_label: string;
  available_sizes: string[];
  unavailable_sizes: string[];
  remaining_ml: number | null;
  inventory_qty: number;
  variants: DecantVariant[];
}

interface MostSearchedPerfume {
  product_id: string | null;
  search_term: string;
  normalized_term: string;
  search_count: number;
  search_percentage: number;
  last_searched_at: string;
  product_name: string;
  product_brand: string;
  product_image: string;
  product_slug: string;
  starting_price: number;
  orders_count: number;
  availability: ProductAvailability;
}

interface UnmatchedSearch {
  normalized_term: string;
  search_term: string;
  search_count: number;
  last_searched_at: string;
}

interface ZeroStockSearch {
  product_id: string;
  search_term: string;
  search_count: number;
  last_searched_at: string;
  name: string;
  brand: string;
  image: string;
  availability: ProductAvailability;
}

interface SearchAnalyticsData {
  period: 'today' | '7d' | '30d' | 'all';
  start_date: string;
  end_date: string;
  kpis: {
    total_searches: number;
    unique_queries: number;
    zero_result_searches: number;
    avg_searches_per_day: number;
    unavailable_searches_count: number;
  };
  trend_series: Array<{ date: string; count: number }>;
  pagination: {
    page: number;
    limit: number;
    total_items: number;
    total_pages: number;
  };
  most_searched_perfumes: MostSearchedPerfume[];
  unmatched_searches: UnmatchedSearch[];
  zero_stock_searches: ZeroStockSearch[];
  no_purchase_searches: MostSearchedPerfume[];
}

interface SearchAnalyticsProps {
  csrfToken: string;
}

export const SearchAnalytics: React.FC<SearchAnalyticsProps> = ({ csrfToken }) => {
  const [period, setPeriod] = useState<'today' | '7d' | '30d' | 'all'>('30d');
  const [data, setData] = useState<SearchAnalyticsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<'all_perfumes' | 'unmatched' | 'zero_stock' | 'no_purchases'>('all_perfumes');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [hoveredPoint, setHoveredPoint] = useState<{ date: string; count: number } | null>(null);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      let url = `/api/admin/search_analytics.php?period=${period}&page=${page}&limit=15`;
      if (searchTerm.trim()) {
        url += `&search=${encodeURIComponent(searchTerm.trim())}`;
      }

      const res = await fetch(url, {
        headers: {
          'X-Admin-Token': localStorage.getItem('adminToken') || '',
          'X-CSRF-Token': csrfToken
        }
      });

      if (!res.ok) {
        throw new Error(`Failed to fetch search analytics (${res.status})`);
      }

      const result = await res.json();
      if (result.success) {
        setData(result.data);
      } else {
        throw new Error(result.error || 'Failed to load search analytics');
      }
    } catch (err: any) {
      setError(err.message || 'Error communicating with analytics endpoint');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [period, page]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchAnalytics();
  };

  const renderAvailabilityBadge = (avail: ProductAvailability) => {
    if (!avail.exists || avail.status === 'unavailable') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-red-500/10 text-red-500 border border-red-500/20">
          <XCircle className="w-3 h-3 shrink-0" />
          <span>Unavailable</span>
        </span>
      );
    }

    if (avail.status === 'low_stock') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-500 border border-amber-500/20">
          <AlertTriangle className="w-3 h-3 shrink-0" />
          <span>Low Stock</span>
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
        <CheckCircle2 className="w-3 h-3 shrink-0" />
        <span>Available</span>
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Period Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#EAEAEA] dark:border-[#27272a]">
        <div>
          <div className="flex items-center gap-2">
            <Search className="w-5 h-5 text-amber-500" />
            <h1 className="text-xl font-bold tracking-tight">Popular Search Analytics & Decant Availability</h1>
          </div>
          <p className="text-xs text-[#737373] dark:text-[#a1a1aa] mt-0.5">
            Monitor customer search trends, identify unmet product demand, and track real-time decant stock levels
          </p>
        </div>

        {/* Date Filter Bar */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="inline-flex bg-[#F4F4F4] dark:bg-[#18181b] p-1 rounded border border-[#EAEAEA] dark:border-[#27272a] text-xs font-medium">
            {[
              { id: 'today', label: 'Today' },
              { id: '7d', label: 'Last 7 days' },
              { id: '30d', label: 'Last 30 days' },
              { id: 'all', label: 'All time' }
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => {
                  setPeriod(p.id as any);
                  setPage(1);
                }}
                className={`px-3 py-1.5 rounded transition-colors cursor-pointer ${
                  period === p.id
                    ? 'bg-[#111111] text-white dark:bg-amber-500 dark:text-black font-semibold shadow-2xs'
                    : 'text-[#737373] dark:text-[#a1a1aa] hover:text-[#111111] dark:hover:text-white'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          <button
            onClick={fetchAnalytics}
            disabled={loading}
            className="p-2 bg-white dark:bg-[#18181b] border border-[#EAEAEA] dark:border-[#27272a] text-[#737373] dark:text-[#a1a1aa] hover:text-[#111111] dark:hover:text-white rounded transition-colors cursor-pointer"
            title="Refresh analytics data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* Total Searches */}
        <div className="bg-white dark:bg-[#18181b] p-4 border border-[#EAEAEA] dark:border-[#27272a] rounded-xl space-y-1.5">
          <div className="flex items-center justify-between text-[#737373] dark:text-[#a1a1aa]">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Total Searches</span>
            <Search className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold font-mono tracking-tight">
            {data ? data.kpis.total_searches.toLocaleString() : '—'}
          </div>
          <p className="text-[10px] text-[#737373] dark:text-[#a1a1aa]">
            Customer queries in selected period
          </p>
        </div>

        {/* Unique Queries */}
        <div className="bg-white dark:bg-[#18181b] p-4 border border-[#EAEAEA] dark:border-[#27272a] rounded-xl space-y-1.5">
          <div className="flex items-center justify-between text-[#737373] dark:text-[#a1a1aa]">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Distinct Terms</span>
            <Layers className="w-4 h-4 text-[#111111] dark:text-zinc-100" />
          </div>
          <div className="text-2xl font-bold font-mono tracking-tight">
            {data ? data.kpis.unique_queries.toLocaleString() : '—'}
          </div>
          <p className="text-[10px] text-[#737373] dark:text-[#a1a1aa]">
            Unique normalized search queries
          </p>
        </div>

        {/* Searches with Zero Results */}
        <div className="bg-white dark:bg-[#18181b] p-4 border border-[#EAEAEA] dark:border-[#27272a] rounded-xl space-y-1.5">
          <div className="flex items-center justify-between text-[#737373] dark:text-[#a1a1aa]">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Zero Catalog Matches</span>
            <AlertCircle className="w-4 h-4 text-red-500" />
          </div>
          <div className="text-2xl font-bold font-mono tracking-tight text-red-500">
            {data ? data.kpis.zero_result_searches.toLocaleString() : '—'}
          </div>
          <p className="text-[10px] text-[#737373] dark:text-[#a1a1aa]">
            Queries with 0 matched products
          </p>
        </div>

        {/* Unavailable Searches */}
        <div className="bg-white dark:bg-[#18181b] p-4 border border-[#EAEAEA] dark:border-[#27272a] rounded-xl space-y-1.5">
          <div className="flex items-center justify-between text-[#737373] dark:text-[#a1a1aa]">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Zero-Stock Searches</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold font-mono tracking-tight text-amber-500">
            {data ? data.kpis.unavailable_searches_count.toLocaleString() : '—'}
          </div>
          <p className="text-[10px] text-[#737373] dark:text-[#a1a1aa]">
            Searches for out-of-stock perfumes
          </p>
        </div>

        {/* Daily Velocity */}
        <div className="bg-white dark:bg-[#18181b] p-4 border border-[#EAEAEA] dark:border-[#27272a] rounded-xl space-y-1.5">
          <div className="flex items-center justify-between text-[#737373] dark:text-[#a1a1aa]">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Search Velocity</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold font-mono tracking-tight">
            {data ? `${data.kpis.avg_searches_per_day}/day` : '—'}
          </div>
          <p className="text-[10px] text-[#737373] dark:text-[#a1a1aa]">
            Daily search request frequency
          </p>
        </div>
      </div>

      {/* Search Volume Trend Chart */}
      {data && data.trend_series.length > 1 && (
        <div className="bg-white dark:bg-[#18181b] p-5 border border-[#EAEAEA] dark:border-[#27272a] rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider">Daily Search Volume Trajectory</h2>
              <p className="text-[11px] text-[#737373] dark:text-[#a1a1aa]">Customer query volume over time</p>
            </div>
            {hoveredPoint && (
              <div className="bg-[#111111] text-white dark:bg-amber-500 dark:text-black text-[11px] px-2.5 py-1 rounded font-mono font-semibold">
                {hoveredPoint.date}: {hoveredPoint.count} searches
              </div>
            )}
          </div>

          <div className="relative w-full overflow-hidden pt-1">
            {(() => {
              const points = data.trend_series;
              const maxVal = Math.max(...points.map((p) => p.count), 5);
              const svgW = 800;
              const svgH = 120;
              const pad = 15;

              const getX = (i: number) => pad + (i / (points.length - 1)) * (svgW - pad * 2);
              const getY = (val: number) => svgH - pad - (val / maxVal) * (svgH - pad * 2);

              const polyline = points.map((p, i) => `${getX(i)},${getY(p.count)}`).join(' ');
              const area = `${getX(0)},${svgH - pad} ${polyline} ${getX(points.length - 1)},${svgH - pad}`;

              return (
                <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full h-32 overflow-visible">
                  <line x1={pad} y1={pad} x2={svgW - pad} y2={pad} stroke="currentColor" strokeOpacity="0.08" strokeDasharray="3 3" />
                  <line x1={pad} y1={svgH / 2} x2={svgW - pad} y2={svgH / 2} stroke="currentColor" strokeOpacity="0.08" strokeDasharray="3 3" />
                  <line x1={pad} y1={svgH - pad} x2={svgW - pad} y2={svgH - pad} stroke="currentColor" strokeOpacity="0.15" />
                  <polygon points={area} fill="currentColor" fillOpacity="0.06" />
                  <polyline fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" points={polyline} />
                  {points.map((p, i) => (
                    <circle
                      key={i}
                      cx={getX(i)}
                      cy={getY(p.count)}
                      r={3.5}
                      fill="currentColor"
                      className="cursor-pointer hover:r-5 transition-all"
                      onMouseEnter={() => setHoveredPoint(p)}
                      onMouseLeave={() => setHoveredPoint(null)}
                    />
                  ))}
                </svg>
              );
            })()}
            <div className="flex justify-between text-[10px] text-[#737373] dark:text-[#a1a1aa] mt-1 font-mono">
              <span>{data.trend_series[0]?.date}</span>
              <span>{data.trend_series[Math.floor(data.trend_series.length / 2)]?.date}</span>
              <span>{data.trend_series[data.trend_series.length - 1]?.date}</span>
            </div>
          </div>
        </div>
      )}

      {/* Main Interactive Sub-tabs */}
      <div className="bg-white dark:bg-[#18181b] border border-[#EAEAEA] dark:border-[#27272a] rounded-xl overflow-hidden">
        {/* Navigation Tabs Header */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between border-b border-[#EAEAEA] dark:border-[#27272a] px-4 py-3 gap-3">
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
            {[
              { id: 'all_perfumes', label: 'Most Searched Perfumes', count: data?.pagination.total_items },
              { id: 'unmatched', label: 'Zero-Result Searches', count: data?.unmatched_searches.length },
              { id: 'zero_stock', label: 'Zero-Stock Demand', count: data?.zero_stock_searches.length },
              { id: 'no_purchases', label: 'Unconverted Searches', count: data?.no_purchase_searches.length }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer flex items-center gap-2 ${
                  activeSubTab === tab.id
                    ? 'bg-[#111111] text-white dark:bg-amber-500 dark:text-black font-semibold'
                    : 'text-[#737373] dark:text-[#a1a1aa] hover:bg-[#F4F4F4] dark:hover:bg-[#27272a]'
                }`}
              >
                <span>{tab.label}</span>
                {typeof tab.count === 'number' && (
                  <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                    activeSubTab === tab.id
                      ? 'bg-white/20 dark:bg-black/20 text-current'
                      : 'bg-[#EAEAEA] dark:bg-[#27272a] text-[#737373] dark:text-[#a1a1aa]'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Sub-table Search Filter (for all_perfumes tab) */}
          {activeSubTab === 'all_perfumes' && (
            <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 shrink-0">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-[#737373] dark:text-[#a1a1aa]" />
                <input
                  type="text"
                  placeholder="Filter perfumes or terms..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 pr-3 py-1 text-xs border rounded-lg bg-[#fafaf8] dark:bg-[#121212] border-[#EAEAEA] dark:border-[#27272a] focus:outline-none focus:border-amber-500 w-44 sm:w-56"
                />
              </div>
              <button
                type="submit"
                className="px-2.5 py-1 text-xs bg-[#111111] text-white dark:bg-amber-500 dark:text-black rounded-lg font-medium cursor-pointer"
              >
                Filter
              </button>
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm('');
                    setPage(1);
                  }}
                  className="text-xs text-[#737373] dark:text-[#a1a1aa] hover:underline cursor-pointer"
                >
                  Clear
                </button>
              )}
            </form>
          )}
        </div>

        {/* Tab 1: Most Searched Perfumes & Decant Availability Table */}
        {activeSubTab === 'all_perfumes' && (
          <div>
            {loading && !data ? (
              <div className="p-12 text-center text-xs text-[#737373] animate-pulse">
                Loading popular search analytics...
              </div>
            ) : !data || data.most_searched_perfumes.length === 0 ? (
              <div className="p-12 text-center text-xs text-[#737373] dark:text-[#a1a1aa] space-y-2">
                <p className="font-semibold text-sm">No search analytics recorded for this period.</p>
                <p>Customer searches submitted through the catalog search bar or filter will appear here.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[#EAEAEA] dark:border-[#27272a] bg-[#fafafa] dark:bg-[#121212] text-[#737373] dark:text-[#a1a1aa] uppercase text-[10px] tracking-wider">
                      <th className="py-3 px-4 font-semibold">Perfume / Query</th>
                      <th className="py-3 px-3 font-semibold text-center">Searches</th>
                      <th className="py-3 px-3 font-semibold text-center">Share</th>
                      <th className="py-3 px-3 font-semibold">Availability Status</th>
                      <th className="py-3 px-4 font-semibold">Available Decant Sizes</th>
                      <th className="py-3 px-4 font-semibold">Unavailable Sizes</th>
                      <th className="py-3 px-4 font-semibold">Stock / ML</th>
                      <th className="py-3 px-3 font-semibold text-right">Orders</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EAEAEA] dark:divide-[#27272a]">
                    {data.most_searched_perfumes.map((row, idx) => {
                      const avail = row.availability;
                      return (
                        <tr
                          key={`${row.product_id || row.normalized_term}-${idx}`}
                          className="hover:bg-[#F9F9F9] dark:hover:bg-[#141416] transition-colors"
                        >
                          {/* Perfume Identity */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded border border-[#EAEAEA] dark:border-[#27272a] bg-[#F4F4F4] dark:bg-[#18181b] overflow-hidden shrink-0 flex items-center justify-center">
                                {row.product_image ? (
                                  <img
                                    src={row.product_image}
                                    alt={row.product_name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <Package className="w-4 h-4 text-[#a1a1aa]" />
                                )}
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <p className="font-semibold text-xs truncate max-w-[200px]">
                                    {row.product_name}
                                  </p>
                                  {row.product_slug && (
                                    <a
                                      href={`/?product=${row.product_slug}`}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="text-[#737373] hover:text-amber-500"
                                      title="Open storefront product page"
                                    >
                                      <ExternalLink className="w-3 h-3" />
                                    </a>
                                  )}
                                </div>
                                <p className="text-[10px] text-[#737373] dark:text-[#a1a1aa] uppercase tracking-wider">
                                  {row.product_brand} &bull; query: "{row.search_term}"
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Search Count */}
                          <td className="py-3 px-3 text-center font-mono font-bold text-sm">
                            {row.search_count}
                          </td>

                          {/* Share Percentage */}
                          <td className="py-3 px-3 text-center">
                            <span className="font-mono text-xs font-semibold text-[#737373] dark:text-[#a1a1aa]">
                              {row.search_percentage}%
                            </span>
                          </td>

                          {/* Real-time Dynamic Availability Badge */}
                          <td className="py-3 px-3">
                            {renderAvailabilityBadge(avail)}
                          </td>

                          {/* Available Decant Sizes */}
                          <td className="py-3 px-4">
                            {avail.available_sizes.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {avail.available_sizes.map((sz) => (
                                  <span
                                    key={sz}
                                    className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                                  >
                                    {sz}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-[11px] text-[#737373] dark:text-[#a1a1aa] italic">
                                None in stock
                              </span>
                            )}
                          </td>

                          {/* Out-of-Stock Sizes */}
                          <td className="py-3 px-4">
                            {avail.unavailable_sizes.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {avail.unavailable_sizes.map((sz) => (
                                  <span
                                    key={sz}
                                    className="px-2 py-0.5 rounded text-[10px] font-mono text-red-500/80 bg-red-500/5 line-through border border-red-500/20"
                                  >
                                    {sz}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                                None (All available)
                              </span>
                            )}
                          </td>

                          {/* Stock & ML Remaining */}
                          <td className="py-3 px-4">
                            <div className="space-y-0.5 text-[11px] font-mono">
                              {avail.remaining_ml !== null ? (
                                <div className="flex items-center gap-1">
                                  <span className="text-[#737373] dark:text-[#a1a1aa]">ML:</span>
                                  <span className={`font-semibold ${
                                    avail.remaining_ml <= 15 ? 'text-amber-500' : 'text-current'
                                  }`}>
                                    {avail.remaining_ml} ml
                                  </span>
                                </div>
                              ) : null}
                              <div className="flex items-center gap-1">
                                <span className="text-[#737373] dark:text-[#a1a1aa]">Qty:</span>
                                <span>{avail.inventory_qty} units</span>
                              </div>
                            </div>
                          </td>

                          {/* Completed Orders Count */}
                          <td className="py-3 px-3 text-right">
                            <span className={`font-mono text-xs font-semibold ${
                              row.orders_count > 0 ? 'text-emerald-500' : 'text-[#737373] dark:text-[#a1a1aa]'
                            }`}>
                              {row.orders_count}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination Controls */}
            {data && data.pagination.total_pages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-[#EAEAEA] dark:border-[#27272a] text-xs">
                <span className="text-[#737373] dark:text-[#a1a1aa] font-mono">
                  Showing page {data.pagination.page} of {data.pagination.total_pages} ({data.pagination.total_items} total)
                </span>
                <div className="flex items-center gap-2">
                  <button
                    disabled={data.pagination.page <= 1}
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    className="p-1.5 rounded border border-[#EAEAEA] dark:border-[#27272a] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#F4F4F4] dark:hover:bg-[#27272a] cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    disabled={data.pagination.page >= data.pagination.total_pages}
                    onClick={() => setPage(p => Math.min(data.pagination.total_pages, p + 1))}
                    className="p-1.5 rounded border border-[#EAEAEA] dark:border-[#27272a] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#F4F4F4] dark:hover:bg-[#27272a] cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Zero-Result Searches (Procurement Insights) */}
        {activeSubTab === 'unmatched' && (
          <div className="p-4 sm:p-6 space-y-4">
            <div className="max-w-xl">
              <h3 className="text-sm font-bold uppercase tracking-wider">Unmatched Customer Demand</h3>
              <p className="text-xs text-[#737373] dark:text-[#a1a1aa] mt-0.5">
                Fragrance names and brands frequently searched by shoppers that currently do not exist in your catalog.
                Use this list for inventory purchasing and brand expansion.
              </p>
            </div>

            {(!data || data.unmatched_searches.length === 0) ? (
              <div className="py-12 text-center text-xs text-[#737373] dark:text-[#a1a1aa]">
                No zero-match searches found for this timeframe.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {data.unmatched_searches.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl border border-[#EAEAEA] dark:border-[#27272a] bg-[#fafafa] dark:bg-[#121212] flex items-center justify-between"
                  >
                    <div className="min-w-0 pr-3">
                      <p className="font-semibold text-xs truncate capitalize">
                        {item.search_term}
                      </p>
                      <p className="text-[10px] text-[#737373] dark:text-[#a1a1aa] mt-0.5">
                        Last requested: {new Date(item.last_searched_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="inline-block px-2 py-0.5 rounded font-mono font-bold text-xs bg-red-500/10 text-red-500 border border-red-500/20">
                        {item.search_count} searches
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Most Searched Zero-Stock Perfumes */}
        {activeSubTab === 'zero_stock' && (
          <div className="p-4 sm:p-6 space-y-4">
            <div className="max-w-xl">
              <h3 className="text-sm font-bold uppercase tracking-wider">High-Demand Out-of-Stock Fragrances</h3>
              <p className="text-xs text-[#737373] dark:text-[#a1a1aa] mt-0.5">
                Perfumes that exist in your store but have 0 stock or depleted ML decants, ranked by search interest.
                Restocking these represents immediate revenue recovery.
              </p>
            </div>

            {(!data || data.zero_stock_searches.length === 0) ? (
              <div className="py-12 text-center text-xs text-[#737373] dark:text-[#a1a1aa]">
                All searched catalog perfumes currently have available inventory.
              </div>
            ) : (
              <div className="divide-y divide-[#EAEAEA] dark:divide-[#27272a]">
                {data.zero_stock_searches.map((item, idx) => (
                  <div
                    key={idx}
                    className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-11 h-11 rounded border border-[#EAEAEA] dark:border-[#27272a] bg-[#F4F4F4] dark:bg-[#18181b] overflow-hidden shrink-0 flex items-center justify-center">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <Package className="w-4 h-4 text-[#a1a1aa]" />
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-xs">{item.name}</p>
                        <p className="text-[10px] text-[#737373] dark:text-[#a1a1aa] uppercase tracking-wider">
                          {item.brand} &bull; Searched as "{item.search_term}"
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0 sm:justify-end">
                      {renderAvailabilityBadge(item.availability)}
                      <div className="text-right">
                        <span className="block font-mono font-bold text-xs">{item.search_count} searches</span>
                        <span className="text-[10px] text-[#737373] dark:text-[#a1a1aa]">
                          ML: {item.availability.remaining_ml ?? 0} ml left
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Unconverted Searches (High Search, Zero Purchases) */}
        {activeSubTab === 'no_purchases' && (
          <div className="p-4 sm:p-6 space-y-4">
            <div className="max-w-xl">
              <h3 className="text-sm font-bold uppercase tracking-wider">Searches Without Purchase Conversion</h3>
              <p className="text-xs text-[#737373] dark:text-[#a1a1aa] mt-0.5">
                Searched fragrances that did not translate into completed checkout orders during this date window.
                Review pricing, decant size variety, or accord descriptions to improve conversion.
              </p>
            </div>

            {(!data || data.no_purchase_searches.length === 0) ? (
              <div className="py-12 text-center text-xs text-[#737373] dark:text-[#a1a1aa]">
                No unconverted search queries found.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {data.no_purchase_searches.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl border border-[#EAEAEA] dark:border-[#27272a] bg-[#fafafa] dark:bg-[#121212] space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-[#737373] dark:text-[#a1a1aa]">
                        {item.product_brand}
                      </span>
                      {renderAvailabilityBadge(item.availability)}
                    </div>
                    <div>
                      <p className="font-semibold text-xs truncate">{item.product_name}</p>
                      <p className="text-[10px] text-[#737373] dark:text-[#a1a1aa]">
                        Searched {item.search_count} times &bull; 0 orders
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
