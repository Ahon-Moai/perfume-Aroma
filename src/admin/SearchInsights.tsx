import React, { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';

type Item = {
  key: string;
  name: string;
  brand?: string | null;
  count: number;
  stock?: 'ok' | 'low' | 'out';
  orders?: number | null;
  spellings?: string[];
};

type Insights = {
  period: string;
  total_searches: number;
  not_in_list: Item[];
  most_searched: Item[];
  low_stock: Item[];
  not_bought: Item[];
};

const PERIODS: { id: string; label: string }[] = [
  { id: 'today', label: 'Today' },
  { id: '7d', label: '7D' },
  { id: '30d', label: '30D' },
  { id: 'all', label: 'All' },
];

const SECTIONS: { id: keyof Omit<Insights, 'period' | 'total_searches'>; title: string; hint: string; dot: string }[] = [
  { id: 'not_in_list', title: 'Not in your list', hint: 'Customers want these — consider stocking', dot: '#EF9F27' },
  { id: 'most_searched', title: 'Most searched', hint: 'Your perfumes people look for most', dot: '#1D9E75' },
  { id: 'low_stock', title: 'Low stock', hint: 'Wanted, but can’t be bought now', dot: '#E24B4A' },
  { id: 'not_bought', title: 'Searched, not bought', hint: 'Try an offer or a 1.5ml tester', dot: '#B4B2A9' },
];

const serif = { fontFamily: "'Cormorant Garamond', Georgia, serif", fontWeight: 700 } as const;

export const SearchInsights: React.FC<{ csrfToken: string }> = ({ csrfToken }) => {
  const [period, setPeriod] = useState('30d');
  const [data, setData] = useState<Insights | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState<Record<string, boolean>>({});

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/search_insights.php?period=${period}`, {
        credentials: 'include',
        headers: { 'X-Admin-Token': localStorage.getItem('adminToken') || '', 'X-CSRF-Token': csrfToken },
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || `Couldn’t load (${res.status})`);
      setData(json.data);
    } catch (e: any) {
      setError(e.message || 'Couldn’t load search insights');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [period]);

  return (
    <div className="max-w-5xl mx-auto px-1 sm:px-2 py-2">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-[11px] font-semibold tracking-[0.3em] text-neutral-600">SEARCH INSIGHTS</div>
          <div className="flex items-baseline gap-2 mt-2">
            <span style={serif} className="text-5xl leading-none text-neutral-900">
              {loading && !data ? '—' : (data?.total_searches ?? 0).toLocaleString()}
            </span>
            <span className="text-sm font-medium text-neutral-700">searches</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-full border border-neutral-300 p-0.5">
            {PERIODS.map((p) => (
              <button
                key={p.id}
                onClick={() => setPeriod(p.id)}
                className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors ${
                  period === p.id ? 'bg-neutral-900 text-white' : 'text-neutral-700 hover:text-neutral-900'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
          <button
            onClick={load}
            aria-label="Refresh"
            className="w-8 h-8 rounded-full flex items-center justify-center text-neutral-400 hover:text-neutral-900"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {error && <p className="mt-6 text-sm text-red-600">{error}</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-9 mt-9">
        {SECTIONS.map((sec) => {
          const items = (data?.[sec.id] as Item[] | undefined) ?? [];
          const shown = open[sec.id] ? items : items.slice(0, 5);
          return (
            <section key={sec.id}>
              <div className="flex items-center justify-between">
                <h3 className="flex items-center gap-2 text-xs font-bold tracking-[0.2em] uppercase text-neutral-900">
                  <span className="w-2 h-2 rounded-full" style={{ background: sec.dot }} />
                  {sec.title}
                </h3>
                <span className="text-xs font-semibold text-neutral-600">{items.length}</span>
              </div>
              <p className="text-[13px] font-medium text-neutral-600 mt-1 mb-3">{sec.hint}</p>
              {loading && !data ? (
                <div className="h-24 rounded-lg bg-neutral-50 animate-pulse" />
              ) : items.length === 0 ? (
                <div style={serif} className="py-2 border-t border-neutral-200 text-lg text-neutral-500">Nothing yet</div>
              ) : (
                <>
                  {shown.map((it, i) => (
                    <div key={it.key} className="grid grid-cols-[22px_minmax(0,1fr)_auto] items-baseline gap-2 py-2.5 border-t border-neutral-200">
                      <span className="text-xs font-semibold text-neutral-500 tabular-nums">{String(i + 1).padStart(2, '0')}</span>
                      <span className="min-w-0">
                        <span style={serif} className="text-[19px] leading-snug text-neutral-950 truncate block">
                          {it.name}
                          {sec.id === 'low_stock' && it.stock && (
                            <span className="ml-2 font-sans text-[11px] font-bold tracking-[0.12em] text-red-600">
                              {it.stock === 'out' ? 'OUT' : 'LOW'}
                            </span>
                          )}
                        </span>
                        {(it.brand || (it.spellings && it.spellings.length > 0)) && (
                          <span className="block text-xs font-medium text-neutral-600 truncate">
                            {it.brand ? it.brand : `Also typed: ${it.spellings!.slice(0, 3).join(', ')}`}
                          </span>
                        )}
                      </span>
                      <span className="text-base font-bold text-neutral-900 tabular-nums">{it.count}</span>
                    </div>
                  ))}
                  {items.length > 5 && (
                    <button
                      onClick={() => setOpen({ ...open, [sec.id]: !open[sec.id] })}
                      className="mt-2 text-xs font-semibold text-neutral-700 hover:text-neutral-950"
                    >
                      {open[sec.id] ? 'Show less' : `Show all ${items.length}`}
                    </button>
                  )}
                </>
              )}
            </section>
          );
        })}
      </div>

      <p className="mt-10 text-xs font-medium text-neutral-600">
        A search is counted when a customer stops typing — no Enter needed. Similar spellings are grouped.
      </p>
    </div>
  );
};
