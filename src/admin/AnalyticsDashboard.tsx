import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingBag,
  PackageCheck,
  Users,
  Clock,
  Calendar,
  RefreshCw,
  AlertTriangle,
  Award,
  Layers,
  ChevronRight,
  Filter
} from 'lucide-react';

interface AnalyticsData {
  period: string;
  start_date: string;
  end_date: string;
  summary: {
    revenue: { value: number; prev: number; change_pct: number | null };
    orders: { value: number; prev: number; change_pct: number | null };
    units_sold: { value: number; prev: number; change_pct: number | null };
    aov: { value: number; prev: number; change_pct: number | null };
    customers: { value: number; prev: number; change_pct: number | null };
    pending_orders: { value: number };
  };
  revenue_chart: Array<{ date: string; revenue: number; orders: number }>;
  best_sellers: Array<{
    product_id: string;
    product_name: string;
    brand_name: string;
    image: string;
    current_stock: number;
    units_sold: number;
    total_sales: number;
  }>;
  orders_by_status: {
    pending: number;
    confirmed: number;
    processing: number;
    shipped: number;
    delivered: number;
    cancelled: number;
  };
  low_stock: Array<{
    id: string;
    name: string;
    brand: string;
    image: string;
    inventory_qty: number;
    low_stock_threshold: number;
  }>;
  category_performance: Array<{
    category_name: string;
    total_units: number;
    total_revenue: number;
  }>;
}

interface AnalyticsDashboardProps {
  csrfToken: string;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ csrfToken }) => {
  const [period, setPeriod] = useState<string>('30d');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [hoveredPoint, setHoveredPoint] = useState<{ date: string; revenue: number; orders: number } | null>(null);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      let url = `/api/admin/analytics.php?period=${period}`;
      if (period === 'custom' && startDate && endDate) {
        url += `&start_date=${startDate}&end_date=${endDate}`;
      }

      const res = await fetch(url, {
        headers: {
          'X-Admin-Token': localStorage.getItem('adminToken') || '',
          'X-CSRF-Token': csrfToken
        }
      });

      if (!res.ok) {
        throw new Error(`Failed to fetch analytics (${res.status})`);
      }

      const result = await res.json();
      if (result.success) {
        setData(result.data);
      } else {
        throw new Error(result.error || 'Failed to load analytics data');
      }
    } catch (err: any) {
      setError(err.message || 'Error connecting to analytics endpoint');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (period !== 'custom' || (startDate && endDate)) {
      fetchAnalytics();
    }
  }, [period, startDate, endDate]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT',
      maximumFractionDigits: 0
    }).format(amount).replace('BDT', '৳');
  };

  if (loading && !data) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 bg-[#EAEAEA] rounded w-1/3" />
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-28 bg-white border border-[#EAEAEA] rounded p-4" />
          ))}
        </div>
        <div className="h-72 bg-white border border-[#EAEAEA] rounded" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded text-red-700 space-y-3">
        <div className="flex items-center gap-2 font-semibold text-sm">
          <AlertTriangle className="w-5 h-5 text-red-600" />
          <span>Analytics Load Error</span>
        </div>
        <p className="text-xs">{error}</p>
        <button
          onClick={fetchAnalytics}
          className="px-3 py-1.5 bg-red-600 text-white rounded text-xs font-medium hover:bg-red-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!data) return null;

  // Compute SVG chart path
  const chartPoints = data.revenue_chart;
  const maxRevenue = Math.max(...chartPoints.map(p => p.revenue), 100);
  const svgWidth = 800;
  const svgHeight = 200;
  const padding = 20;

  const getX = (index: number) => {
    if (chartPoints.length <= 1) return padding;
    return padding + (index / (chartPoints.length - 1)) * (svgWidth - padding * 2);
  };

  const getY = (value: number) => {
    return svgHeight - padding - (value / maxRevenue) * (svgHeight - padding * 2);
  };

  const polylinePoints = chartPoints
    .map((p, i) => `${getX(i)},${getY(p.revenue)}`)
    .join(' ');

  const areaPoints = `${getX(0)},${svgHeight - padding} ${polylinePoints} ${getX(chartPoints.length - 1)},${svgHeight - padding}`;

  return (
    <div className="space-y-8">
      {/* Page Header & Date Range Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#EAEAEA]">
        <div>
          <h1 className="text-xl font-bold text-[#111111] tracking-tight">Analytics & Business Insights</h1>
          <p className="text-xs text-[#737373] mt-0.5">
            Real-time performance tracking based on verified store transactions
          </p>
        </div>

        {/* Date Filter Selector */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="inline-flex bg-[#F4F4F4] p-1 rounded border border-[#EAEAEA] text-xs font-medium">
            {[
              { id: 'today', label: 'Today' },
              { id: '7d', label: '7 Days' },
              { id: '30d', label: '30 Days' },
              { id: '90d', label: '90 Days' },
              { id: 'all', label: 'All Time' },
              { id: 'custom', label: 'Custom' }
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => setPeriod(p.id)}
                className={`px-3 py-1 rounded transition-colors ${
                  period === p.id
                    ? 'bg-[#111111] text-white shadow-2xs font-semibold'
                    : 'text-[#737373] hover:text-[#111111]'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          <button
            onClick={fetchAnalytics}
            className="p-1.5 bg-white border border-[#EAEAEA] text-[#737373] hover:text-[#111111] hover:bg-[#F4F4F4] rounded transition-colors"
            title="Refresh analytics"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Custom Date Selector Input Group */}
      {period === 'custom' && (
        <div className="flex items-center gap-3 p-4 bg-white border border-[#EAEAEA] rounded">
          <Calendar className="w-4 h-4 text-[#737373]" />
          <div className="flex items-center gap-2 text-xs">
            <span className="text-[#737373]">From:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-2.5 py-1 border border-[#EAEAEA] rounded text-[#111111] bg-white"
            />
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-[#737373]">To:</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-2.5 py-1 border border-[#EAEAEA] rounded text-[#111111] bg-white"
            />
          </div>
        </div>
      )}

      {/* KPI Cards Grid (6 Metric Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Total Revenue */}
        <div className="bg-white p-4 border border-[#EAEAEA] rounded space-y-2">
          <div className="flex items-center justify-between text-[#737373]">
            <span className="text-xs font-medium uppercase tracking-wider">Total Revenue</span>
            <DollarSign className="w-4 h-4 text-[#111111]" />
          </div>
          <div className="text-lg font-bold text-[#111111] tracking-tight">
            {formatCurrency(data.summary.revenue.value)}
          </div>
          <div className="flex items-center gap-1.5 text-[11px]">
            {data.summary.revenue.change_pct !== null ? (
              <>
                {data.summary.revenue.change_pct >= 0 ? (
                  <span className="text-emerald-700 font-medium flex items-center gap-0.5">
                    <TrendingUp className="w-3 h-3" />+{data.summary.revenue.change_pct}%
                  </span>
                ) : (
                  <span className="text-red-600 font-medium flex items-center gap-0.5">
                    <TrendingDown className="w-3 h-3" />{data.summary.revenue.change_pct}%
                  </span>
                )}
                <span className="text-[#737373]">vs prev. period</span>
              </>
            ) : (
              <span className="text-[#737373]">No previous baseline</span>
            )}
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-white p-4 border border-[#EAEAEA] rounded space-y-2">
          <div className="flex items-center justify-between text-[#737373]">
            <span className="text-xs font-medium uppercase tracking-wider">Total Orders</span>
            <ShoppingBag className="w-4 h-4 text-[#111111]" />
          </div>
          <div className="text-lg font-bold text-[#111111] tracking-tight">
            {data.summary.orders.value}
          </div>
          <div className="flex items-center gap-1.5 text-[11px]">
            {data.summary.orders.change_pct !== null ? (
              <>
                {data.summary.orders.change_pct >= 0 ? (
                  <span className="text-emerald-700 font-medium flex items-center gap-0.5">
                    <TrendingUp className="w-3 h-3" />+{data.summary.orders.change_pct}%
                  </span>
                ) : (
                  <span className="text-red-600 font-medium flex items-center gap-0.5">
                    <TrendingDown className="w-3 h-3" />{data.summary.orders.change_pct}%
                  </span>
                )}
                <span className="text-[#737373]">vs prev. period</span>
              </>
            ) : (
              <span className="text-[#737373]">No previous baseline</span>
            )}
          </div>
        </div>

        {/* Units Sold */}
        <div className="bg-white p-4 border border-[#EAEAEA] rounded space-y-2">
          <div className="flex items-center justify-between text-[#737373]">
            <span className="text-xs font-medium uppercase tracking-wider">Units Sold</span>
            <PackageCheck className="w-4 h-4 text-[#111111]" />
          </div>
          <div className="text-lg font-bold text-[#111111] tracking-tight">
            {data.summary.units_sold.value}
          </div>
          <div className="flex items-center gap-1.5 text-[11px]">
            {data.summary.units_sold.change_pct !== null ? (
              <>
                {data.summary.units_sold.change_pct >= 0 ? (
                  <span className="text-emerald-700 font-medium flex items-center gap-0.5">
                    <TrendingUp className="w-3 h-3" />+{data.summary.units_sold.change_pct}%
                  </span>
                ) : (
                  <span className="text-red-600 font-medium flex items-center gap-0.5">
                    <TrendingDown className="w-3 h-3" />{data.summary.units_sold.change_pct}%
                  </span>
                )}
                <span className="text-[#737373]">vs prev. period</span>
              </>
            ) : (
              <span className="text-[#737373]">No previous baseline</span>
            )}
          </div>
        </div>

        {/* Average Order Value */}
        <div className="bg-white p-4 border border-[#EAEAEA] rounded space-y-2">
          <div className="flex items-center justify-between text-[#737373]">
            <span className="text-xs font-medium uppercase tracking-wider">Avg Order Value</span>
            <Award className="w-4 h-4 text-[#111111]" />
          </div>
          <div className="text-lg font-bold text-[#111111] tracking-tight">
            {formatCurrency(data.summary.aov.value)}
          </div>
          <div className="flex items-center gap-1.5 text-[11px]">
            {data.summary.aov.change_pct !== null ? (
              <>
                {data.summary.aov.change_pct >= 0 ? (
                  <span className="text-emerald-700 font-medium flex items-center gap-0.5">
                    <TrendingUp className="w-3 h-3" />+{data.summary.aov.change_pct}%
                  </span>
                ) : (
                  <span className="text-red-600 font-medium flex items-center gap-0.5">
                    <TrendingDown className="w-3 h-3" />{data.summary.aov.change_pct}%
                  </span>
                )}
                <span className="text-[#737373]">vs prev. period</span>
              </>
            ) : (
              <span className="text-[#737373]">No previous baseline</span>
            )}
          </div>
        </div>

        {/* Unique Customers */}
        <div className="bg-white p-4 border border-[#EAEAEA] rounded space-y-2">
          <div className="flex items-center justify-between text-[#737373]">
            <span className="text-xs font-medium uppercase tracking-wider">Active Customers</span>
            <Users className="w-4 h-4 text-[#111111]" />
          </div>
          <div className="text-lg font-bold text-[#111111] tracking-tight">
            {data.summary.customers.value}
          </div>
          <div className="flex items-center gap-1.5 text-[11px]">
            {data.summary.customers.change_pct !== null ? (
              <>
                {data.summary.customers.change_pct >= 0 ? (
                  <span className="text-emerald-700 font-medium flex items-center gap-0.5">
                    <TrendingUp className="w-3 h-3" />+{data.summary.customers.change_pct}%
                  </span>
                ) : (
                  <span className="text-red-600 font-medium flex items-center gap-0.5">
                    <TrendingDown className="w-3 h-3" />{data.summary.customers.change_pct}%
                  </span>
                )}
                <span className="text-[#737373]">vs prev. period</span>
              </>
            ) : (
              <span className="text-[#737373]">No previous baseline</span>
            )}
          </div>
        </div>

        {/* Pending Orders */}
        <div className="bg-white p-4 border border-[#EAEAEA] rounded space-y-2">
          <div className="flex items-center justify-between text-[#737373]">
            <span className="text-xs font-medium uppercase tracking-wider">Pending Orders</span>
            <Clock className="w-4 h-4 text-[#111111]" />
          </div>
          <div className="text-lg font-bold text-[#111111] tracking-tight">
            {data.summary.pending_orders.value}
          </div>
          <div className="flex items-center gap-1 text-[11px] text-[#737373]">
            <span>Requires fulfillment</span>
          </div>
        </div>
      </div>

      {/* Interactive Revenue Chart */}
      <div className="bg-white p-6 border border-[#EAEAEA] rounded space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-[#111111] uppercase tracking-wider">Revenue Trend</h2>
            <p className="text-xs text-[#737373]">Daily revenue trajectory over selected timeframe</p>
          </div>
          {hoveredPoint && (
            <div className="bg-[#111111] text-white text-xs px-3 py-1.5 rounded flex items-center gap-3">
              <span>{hoveredPoint.date}</span>
              <span className="font-bold">{formatCurrency(hoveredPoint.revenue)}</span>
              <span className="text-[#A3A3A3]">({hoveredPoint.orders} orders)</span>
            </div>
          )}
        </div>

        <div className="relative w-full overflow-hidden pt-2">
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="w-full h-56 overflow-visible"
          >
            {/* Horizontal Grid lines */}
            <line x1={padding} y1={padding} x2={svgWidth - padding} y2={padding} stroke="#EAEAEA" strokeDasharray="3 3" />
            <line x1={padding} y1={svgHeight / 2} x2={svgWidth - padding} y2={svgHeight / 2} stroke="#EAEAEA" strokeDasharray="3 3" />
            <line x1={padding} y1={svgHeight - padding} x2={svgWidth - padding} y2={svgHeight - padding} stroke="#EAEAEA" />

            {/* Area Fill */}
            <polygon points={areaPoints} fill="#111111" fillOpacity="0.05" />

            {/* Trend Polyline */}
            <polyline
              fill="none"
              stroke="#111111"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={polylinePoints}
            />

            {/* Interactive Data Nodes */}
            {chartPoints.map((point, i) => {
              const cx = getX(i);
              const cy = getY(point.revenue);
              return (
                <g key={i} className="cursor-pointer">
                  <circle
                    cx={cx}
                    cy={cy}
                    r="4"
                    fill="#FFFFFF"
                    stroke="#111111"
                    strokeWidth="2"
                    className="transition-transform hover:scale-150"
                    onMouseEnter={() => setHoveredPoint(point)}
                    onMouseLeave={() => setHoveredPoint(null)}
                  />
                </g>
              );
            })}
          </svg>

          {/* X Axis Labels */}
          <div className="flex justify-between text-[10px] text-[#737373] mt-2 px-2 font-mono">
            <span>{chartPoints[0]?.date}</span>
            <span>{chartPoints[Math.floor(chartPoints.length / 2)]?.date}</span>
            <span>{chartPoints[chartPoints.length - 1]?.date}</span>
          </div>
        </div>
      </div>

      {/* Analytics Main Dashboard Grid: Best Sellers & Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left Column: Best-Selling Products (2 cols) */}
        <div className="lg:col-span-2 bg-white p-6 border border-[#EAEAEA] rounded space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#EAEAEA]">
            <div>
              <h2 className="text-sm font-bold text-[#111111] uppercase tracking-wider">Best-Selling Decants</h2>
              <p className="text-xs text-[#737373]">Top products ranked by actual completed sales volume</p>
            </div>
            <span className="text-xs font-mono text-[#737373]">{data.best_sellers.length} Products</span>
          </div>

          {data.best_sellers.length === 0 ? (
            <div className="py-12 text-center text-xs text-[#737373]">
              No sales data recorded in this date range.
            </div>
          ) : (
            <div className="divide-y divide-[#EAEAEA]">
              {data.best_sellers.map((item, idx) => (
                <div key={item.product_id} className="py-3 flex items-center justify-between gap-4 text-xs">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-5 font-mono font-bold text-[#737373] shrink-0 text-center">
                      #{idx + 1}
                    </span>
                    <div className="w-10 h-10 bg-[#F4F4F4] rounded border border-[#EAEAEA] overflow-hidden shrink-0 flex items-center justify-center">
                      {item.image ? (
                        <img src={item.image} alt={item.product_name} className="w-full h-full object-cover" />
                      ) : (
                        <PackageCheck className="w-5 h-5 text-[#A3A3A3]" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-[#111111] truncate">{item.product_name}</p>
                      <p className="text-[10px] text-[#737373] uppercase tracking-wider">{item.brand_name}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 shrink-0 text-right">
                    <div>
                      <span className="block font-semibold text-[#111111]">{item.units_sold} units</span>
                      <span className="text-[10px] text-[#737373]">Volume</span>
                    </div>
                    <div>
                      <span className="block font-semibold text-[#111111]">{formatCurrency(item.total_sales)}</span>
                      <span className="text-[10px] text-[#737373]">Revenue</span>
                    </div>
                    <div className="hidden sm:block">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono ${
                        item.current_stock <= 5
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-[#F4F4F4] text-[#111111]'
                      }`}>
                        Stock: {item.current_stock}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Order Status Breakdown & Inventory Alerts */}
        <div className="space-y-6">

          {/* Order Status Distribution */}
          <div className="bg-white p-6 border border-[#EAEAEA] rounded space-y-4">
            <div className="pb-3 border-b border-[#EAEAEA]">
              <h2 className="text-sm font-bold text-[#111111] uppercase tracking-wider">Order Status Overview</h2>
              <p className="text-xs text-[#737373]">Fulfillment status distribution</p>
            </div>

            <div className="space-y-2.5 text-xs">
              {[
                { key: 'pending', label: 'Pending', count: data.orders_by_status.pending, color: 'bg-amber-500' },
                { key: 'confirmed', label: 'Confirmed', count: data.orders_by_status.confirmed, color: 'bg-blue-500' },
                { key: 'processing', label: 'Processing', count: data.orders_by_status.processing, color: 'bg-indigo-500' },
                { key: 'shipped', label: 'Shipped', count: data.orders_by_status.shipped, color: 'bg-purple-500' },
                { key: 'delivered', label: 'Delivered', count: data.orders_by_status.delivered, color: 'bg-emerald-500' },
                { key: 'cancelled', label: 'Cancelled', count: data.orders_by_status.cancelled, color: 'bg-gray-400' }
              ].map((s) => (
                <div key={s.key} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${s.color}`} />
                    <span className="text-[#111111]">{s.label}</span>
                  </div>
                  <span className="font-mono font-semibold text-[#111111]">{s.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Category Performance */}
          <div className="bg-white p-6 border border-[#EAEAEA] rounded space-y-4">
            <div className="pb-3 border-b border-[#EAEAEA]">
              <h2 className="text-sm font-bold text-[#111111] uppercase tracking-wider">Top Fragrance Families</h2>
              <p className="text-xs text-[#737373]">Revenue generated by category</p>
            </div>

            <div className="space-y-3 text-xs">
              {data.category_performance.map((cat, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-[#111111]">{cat.category_name}</p>
                    <p className="text-[10px] text-[#737373]">{cat.total_units} units sold</p>
                  </div>
                  <span className="font-semibold text-[#111111]">
                    {formatCurrency(cat.total_revenue)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Low Stock Warning Box */}
          {data.low_stock.length > 0 && (
            <div className="bg-amber-50/50 border border-amber-200 p-5 rounded space-y-3">
              <div className="flex items-center gap-2 text-amber-900 font-semibold text-xs uppercase tracking-wider">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Low Inventory Alert ({data.low_stock.length})</span>
              </div>
              <div className="divide-y divide-amber-200/60 text-xs">
                {data.low_stock.map((prod) => (
                  <div key={prod.id} className="py-1.5 flex items-center justify-between">
                    <span className="font-medium text-amber-950 truncate max-w-[180px]">{prod.name}</span>
                    <span className="font-mono text-amber-800 font-bold">{prod.inventory_qty} left</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
