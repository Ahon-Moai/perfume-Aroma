import React, { useEffect, useMemo, useState } from 'react';
import { Search, ChevronDown, Plus, X, RefreshCw } from 'lucide-react';
import { categoryOf } from '../lib/brandCategory';

type Size = { id: string; size: string; ml: number; price: number };
type Perfume = {
  id: string;
  brand: string;
  name: string;
  status: string;
  sizes: Size[];
  bottle_size_ml: number;
  ml_left: number | null;
  low_ml: number;
  bottle_cost: number;
};
type Edit = { prices?: Record<string, number>; bottle_cost?: number; set_ml?: number; bottle_size_ml?: number; low_stock_threshold_ml?: number };

const serif = { fontFamily: "'Cormorant Garamond', Georgia, serif", fontWeight: 700 } as const;
const COLOR = { ok: '#1D9E75', low: '#EF9F27', out: '#E24B4A' };
const api = '/api/admin/perfume_stock.php';
const HOUSES = [
  { id: 'all', label: 'All' },
  { id: 'Arabian', label: 'Middle Eastern' },
  { id: 'Designer', label: 'Designer' },
  { id: 'Niche', label: 'Niche' },
] as const;
type House = (typeof HOUSES)[number]['id'];

const stateOf = (p: Perfume) => {
  const left = p.ml_left ?? 0;
  return left <= 0 ? 'out' : left <= p.low_ml ? 'low' : 'ok';
};

const Ring: React.FC<{ p: Perfume }> = ({ p }) => {
  const r = 12, c = 2 * Math.PI * r;
  const v = Math.max(0, Math.min(1, (p.ml_left ?? 0) / (p.bottle_size_ml || 100)));
  return (
    <svg width="30" height="30" viewBox="0 0 30 30" aria-hidden="true">
      <circle cx="15" cy="15" r={r} fill="none" stroke="#ececec" strokeWidth="3" />
      <circle cx="15" cy="15" r={r} fill="none" stroke={COLOR[stateOf(p)]} strokeWidth="3" strokeLinecap="round"
        strokeDasharray={`${c * v} ${c}`} transform="rotate(-90 15 15)" />
    </svg>
  );
};

export const PerfumeStock: React.FC<{ csrfToken: string; onOpenCatalogue: () => void; onOpenHistory: () => void }> = ({
  csrfToken, onOpenCatalogue, onOpenHistory,
}) => {
  const [list, setList] = useState<Perfume[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState<'all' | 'low' | 'out'>('all');
  const [house, setHouse] = useState<House>('all');
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const [edits, setEdits] = useState<Record<string, Edit>>({});
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [showOrder, setShowOrder] = useState(false);
  const [limit, setLimit] = useState(40);

  const headers = { 'Content-Type': 'application/json', 'X-CSRF-Token': csrfToken, 'X-Admin-Token': localStorage.getItem('adminToken') || '' };

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const r = await fetch(api, { credentials: 'include', headers });
      const j = await r.json();
      if (!r.ok || !j.success) throw new Error(j.error || 'Couldn’t load perfumes');
      setList(j.data.perfumes);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  // Perfume as it will look after unsaved edits
  const view = (p: Perfume): Perfume => {
    const e = edits[p.id];
    if (!e) return p;
    return {
      ...p,
      bottle_cost: e.bottle_cost ?? p.bottle_cost,
      ml_left: e.set_ml ?? p.ml_left,
      sizes: p.sizes.map((s) => (e.prices?.[s.id] != null ? { ...s, price: e.prices[s.id] } : s)),
    };
  };

  const edit = (pid: string, patch: Edit) =>
    setEdits((all) => {
      const cur = all[pid] || {};
      return { ...all, [pid]: { ...cur, ...patch, prices: { ...(cur.prices || {}), ...(patch.prices || {}) } } };
    });

  const changeCount = Object.values(edits).reduce(
    (n, e) => n + Object.keys(e.prices || {}).length + (e.bottle_cost != null ? 1 : 0) + (e.set_ml != null ? 1 : 0), 0);

  const houseCount = useMemo(() => {
    const c: Record<string, number> = { all: list.length, Arabian: 0, Designer: 0, Niche: 0 };
    list.forEach((p) => { c[categoryOf(p.brand)]++; });
    return c;
  }, [list]);

  const counts = useMemo(() => ({
    low: list.filter((p) => stateOf(p) === 'low').length,
    out: list.filter((p) => stateOf(p) === 'out').length,
  }), [list]);

  const shown = useMemo(() => {
    const t = q.trim().toLowerCase();
    return list
      .map(view)
      .filter((p) => (filter === 'all' || stateOf(p) === filter) && (house === 'all' || categoryOf(p.brand) === house) && (!t || `${p.brand} ${p.name}`.toLowerCase().includes(t)));
  }, [list, q, filter, house, edits]);

  const save = async () => {
    if (!changeCount) return;
    setSaving(true);
    setMsg(null);
    try {
      const changes = Object.entries(edits).map(([product_id, e]) => ({ product_id, ...e }));
      const r = await fetch(api, { method: 'PUT', credentials: 'include', headers, body: JSON.stringify({ changes }) });
      const j = await r.json();
      if (!r.ok || !j.success) throw new Error(j.error || 'Couldn’t save');
      setEdits({});
      setMsg({ ok: true, text: 'Saved — prices and stock are updated on the website' });
      await load();
    } catch (e: any) {
      setMsg({ ok: false, text: e.message });
    } finally {
      setSaving(false);
    }
  };

  const moveMl = async (p: Perfume, action: 'restock' | 'remove') => {
    const label = action === 'restock' ? `How many ml did you add to ${p.name}?` : `How many ml to remove from ${p.name}? (spill, tester…)`;
    const ans = window.prompt(label, action === 'restock' ? String(p.bottle_size_ml || 100) : '5');
    if (ans == null) return;
    const ml = Number(ans);
    if (!(ml > 0)) { setMsg({ ok: false, text: 'Enter the ml as a number' }); return; }
    try {
      const r = await fetch(api, { method: 'POST', credentials: 'include', headers, body: JSON.stringify({ product_id: p.id, action, ml }) });
      const j = await r.json();
      if (!r.ok || !j.success) throw new Error(j.error || 'Couldn’t update');
      setMsg({ ok: true, text: `${p.name}: ${action === 'restock' ? '+' : '−'}${ml}ml` });
      await load();
    } catch (e: any) {
      setMsg({ ok: false, text: e.message });
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-1 sm:px-2 py-2 pb-24">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-[11px] font-semibold tracking-[0.3em] text-neutral-600">PERFUMES</div>
          <div className="flex items-baseline gap-3 mt-2">
            <span style={serif} className="text-5xl leading-none text-neutral-900">{loading && !list.length ? '—' : list.length}</span>
            <span className="text-sm font-medium text-neutral-700">
              <span style={{ color: COLOR.low }}>{counts.low} low</span> · <span style={{ color: COLOR.out }}>{counts.out} empty</span>
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={() => setShowOrder(true)} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-neutral-900 text-white text-xs font-semibold">
            <Plus className="w-3.5 h-3.5" /> Offline order
          </button>
          <div className="inline-flex rounded-full border border-neutral-300 p-0.5">
            {(['all', 'low', 'out'] as const).map((f) => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-3 py-1 text-xs font-semibold rounded-full ${filter === f ? 'bg-neutral-900 text-white' : 'text-neutral-700'}`}>
                {f === 'all' ? 'All' : f === 'low' ? 'Low' : 'Empty'}
              </button>
            ))}
          </div>
          <button onClick={load} aria-label="Refresh" className="w-8 h-8 rounded-full flex items-center justify-center text-neutral-500 hover:text-neutral-900">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="flex gap-6 mt-6 border-b border-neutral-200 overflow-x-auto">
        {HOUSES.map((h) => (
          <button key={h.id} onClick={() => setHouse(h.id)}
            className={`pb-2.5 -mb-px text-[13px] font-semibold whitespace-nowrap border-b-2 transition-colors ${
              house === h.id ? 'border-neutral-900 text-neutral-950' : 'border-transparent text-neutral-500 hover:text-neutral-900'}`}>
            {h.label} <span className="text-neutral-400 font-medium">{houseCount[h.id] ?? 0}</span>
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2 border-b border-neutral-300 pb-2 mt-4">
        <Search className="w-4 h-4 text-neutral-500" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search perfume or brand"
          className="flex-1 bg-transparent outline-none text-sm font-medium text-neutral-900 placeholder:text-neutral-400" />
      </div>
      <div className="flex gap-5 mt-3 text-xs font-semibold">
        <button onClick={onOpenCatalogue} className="text-neutral-700 underline underline-offset-4 decoration-neutral-300 hover:text-neutral-950">Add perfume / edit details & photos</button>
        <button onClick={onOpenHistory} className="text-neutral-500 underline underline-offset-4 decoration-neutral-300 hover:text-neutral-950">Stock history</button>
      </div>

      {error && <p className="mt-6 text-sm font-medium text-red-600">{error}</p>}

      <div className="mt-4">
        {shown.slice(0, limit).map((p) => {
          const st = stateOf(p);
          const cpm = p.bottle_cost > 0 ? p.bottle_cost / (p.bottle_size_ml || 100) : 0;
          const e = edits[p.id];
          return (
            <div key={p.id} className="border-b border-neutral-200 py-4">
              <button type="button" onClick={() => setOpen({ ...open, [p.id]: !open[p.id] })}
                className="w-full grid grid-cols-[minmax(0,1fr)_auto_16px] gap-3 items-center text-left">
                <span className="min-w-0">
                  <span className="block text-[11px] font-semibold tracking-[0.18em] text-neutral-600 uppercase truncate">
                    {p.brand}{p.status !== 'published' && <span className="ml-2 text-neutral-400">· hidden</span>}
                  </span>
                  <span style={serif} className="block text-[21px] leading-tight text-neutral-950 truncate">{p.name}</span>
                </span>
                <span className="flex items-center gap-2.5">
                  <span className="text-right">
                    <span className="block text-[15px] font-bold tabular-nums" style={{ color: COLOR[st] }}>{p.ml_left ?? 0}ml</span>
                    <span className="block text-xs font-medium text-neutral-500">of {p.bottle_size_ml}ml</span>
                  </span>
                  <Ring p={p} />
                </span>
                <ChevronDown className={`w-4 h-4 text-neutral-400 transition-transform ${open[p.id] ? 'rotate-180' : ''}`} />
              </button>

              <div className="flex flex-wrap gap-x-5 gap-y-2 mt-2.5">
                {p.sizes.map((s) => {
                  const off = (p.ml_left ?? 0) < s.ml;
                  const changed = e?.prices?.[s.id] != null;
                  return (
                    <label key={s.id} className={`inline-flex items-baseline gap-1.5 text-[13px] font-semibold text-neutral-600 ${off ? 'opacity-40' : ''}`}
                      title={off ? 'Not enough ml — customers see “Sold out”' : ''}>
                      <span className={off ? 'line-through' : ''}>{s.size.toLowerCase()}</span>
                      <span>৳</span>
                      <input inputMode="numeric" value={s.price}
                        onChange={(ev) => { const v = Math.round(Number(ev.target.value.replace(/\D/g, ''))); if (v >= 0) edit(p.id, { prices: { [s.id]: v } }); }}
                        className={`w-16 bg-transparent outline-none border-b border-dashed text-[15px] font-bold tabular-nums ${
                          changed ? 'text-emerald-700 border-emerald-600' : 'text-neutral-950 border-neutral-300 focus:border-neutral-900'}`} />
                    </label>
                  );
                })}
                {p.sizes.length === 0 && <span className="text-xs font-medium text-neutral-400">No sizes yet — add them in “edit details”</span>}
              </div>

              {open[p.id] && (
                <div className="mt-4 pt-3 border-t border-dashed border-neutral-200">
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <div className="text-[10px] font-semibold tracking-[0.14em] text-neutral-500">BOTTLE COST</div>
                      <span className="text-[17px] font-bold">৳</span>
                      <input inputMode="numeric" value={p.bottle_cost || ''} placeholder="0"
                        onChange={(ev) => edit(p.id, { bottle_cost: Math.round(Number(ev.target.value.replace(/\D/g, ''))) || 0 })}
                        className="w-24 bg-transparent outline-none border-b border-dashed border-neutral-300 text-[17px] font-bold" />
                    </div>
                    <div>
                      <div className="text-[10px] font-semibold tracking-[0.14em] text-neutral-500">COST / ML</div>
                      <div className="text-[17px] font-bold">{cpm ? `৳${Math.round(cpm)}` : '—'}</div>
                    </div>
                    <div>
                      <div className="text-[10px] font-semibold tracking-[0.14em] text-neutral-500">ML LEFT</div>
                      <input inputMode="decimal" value={p.ml_left ?? 0}
                        onChange={(ev) => { const v = Number(ev.target.value.replace(/[^\d.]/g, '')); if (v >= 0) edit(p.id, { set_ml: v }); }}
                        className="w-20 bg-transparent outline-none border-b border-dashed border-neutral-300 text-[17px] font-bold" />
                    </div>
                  </div>
                  {cpm > 0 && (
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-[13px] font-semibold text-neutral-600">
                      {p.sizes.map((s) => {
                        const pr = s.price - Math.round(s.ml * cpm);
                        return <span key={s.id}>{s.size.toLowerCase()} <span className={pr < 0 ? 'text-red-600' : 'text-emerald-700'}>{pr < 0 ? '−' : '+'}৳{Math.abs(pr)}</span></span>;
                      })}
                    </div>
                  )}
                  <div className="flex gap-5 mt-4 text-[13px] font-semibold">
                    <button onClick={() => moveMl(p, 'restock')} className="text-neutral-950 border-b border-neutral-400">+ New bottle</button>
                    <button onClick={() => moveMl(p, 'remove')} className="text-neutral-500 border-b border-neutral-300">− Remove ml</button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
        {!loading && shown.length === 0 && <p style={serif} className="py-6 text-lg text-neutral-400">Nothing here</p>}
        {shown.length > limit && (
          <button onClick={() => setLimit(limit + 40)} className="mt-4 text-xs font-semibold text-neutral-700 underline underline-offset-4">
            Show more ({shown.length - limit})
          </button>
        )}
      </div>

      {(changeCount > 0 || msg) && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[min(92vw,560px)] flex items-center justify-between gap-3 px-4 py-3 rounded-full bg-white border border-neutral-200 shadow-lg">
          <span className={`text-[13px] font-semibold ${msg ? (msg.ok ? 'text-emerald-700' : 'text-red-600') : 'text-neutral-900'}`}>
            {changeCount > 0 ? `${changeCount} unsaved change${changeCount > 1 ? 's' : ''}` : msg?.text}
          </span>
          <span className="flex items-center gap-3">
            {changeCount > 0 ? (
              <>
                <button onClick={() => { setEdits({}); setMsg(null); }} className="text-xs font-semibold text-neutral-500">Undo</button>
                <button onClick={save} disabled={saving} className="px-4 py-1.5 rounded-full bg-neutral-900 text-white text-xs font-semibold disabled:opacity-50">
                  {saving ? 'Saving…' : 'Save'}
                </button>
              </>
            ) : (
              <button onClick={() => setMsg(null)} aria-label="Close" className="text-neutral-400"><X className="w-4 h-4" /></button>
            )}
          </span>
        </div>
      )}

      {showOrder && (
        <OfflineOrder perfumes={list} headers={headers} onClose={() => setShowOrder(false)}
          onDone={(text) => { setShowOrder(false); setMsg({ ok: true, text }); load(); }} />
      )}
    </div>
  );
};

/* ---------- Offline order (Messenger / WhatsApp / Instagram / phone / in person) ---------- */

const CHANNELS = [
  { id: 'messenger', label: 'Messenger' },
  { id: 'whatsapp', label: 'WhatsApp' },
  { id: 'instagram', label: 'Instagram' },
  { id: 'phone', label: 'Phone call' },
  { id: 'in_person', label: 'In person' },
];

type Line = { product_id: string; size: string; quantity: number };

export const OfflineOrder: React.FC<{
  perfumes: Perfume[];
  headers: Record<string, string>;
  onClose: () => void;
  onDone: (text: string) => void;
}> = ({ perfumes, headers, onClose, onDone }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [channel, setChannel] = useState('messenger');
  const [paid, setPaid] = useState(false);
  const [fee, setFee] = useState('');
  const [lines, setLines] = useState<Line[]>([{ product_id: '', size: '', quantity: 1 }]);
  const [pick, setPick] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const byId = useMemo(() => Object.fromEntries(perfumes.map((p) => [p.id, p])), [perfumes]);
  const sorted = perfumes;

  const setLine = (i: number, patch: Partial<Line>) => setLines(lines.map((l, k) => (k === i ? { ...l, ...patch } : l)));
  const priceOf = (l: Line) => byId[l.product_id]?.sizes.find((s) => s.size === l.size)?.price ?? 0;
  const subtotal = lines.reduce((n, l) => n + priceOf(l) * (l.quantity || 0), 0);
  const total = subtotal + (Number(fee) || 0);

  // ml needed per perfume across all lines, to warn before saving
  const shortBy = (l: Line) => {
    const p = byId[l.product_id];
    if (!p || !l.size) return null;
    const need = lines.filter((x) => x.product_id === l.product_id)
      .reduce((n, x) => n + (p.sizes.find((s) => s.size === x.size)?.ml ?? 0) * (x.quantity || 0), 0);
    return need > (p.ml_left ?? 0) ? `Only ${p.ml_left ?? 0}ml left` : null;
  };

  const submit = async () => {
    setErr(null);
    if (!name.trim()) return setErr('Enter the customer name');
    if (phone.replace(/\D/g, '').length < 10) return setErr('Enter a valid phone number');
    const items = lines.filter((l) => l.product_id && l.size);
    if (!items.length) return setErr('Add at least one perfume');
    if (items.some((l) => !(l.quantity >= 1))) return setErr('Quantity must be at least 1');
    const short = items.map(shortBy).find(Boolean);
    if (short) return setErr(short);
    setBusy(true);
    try {
      const r = await fetch('/api/admin/offline_order.php', {
        method: 'POST', credentials: 'include', headers,
        body: JSON.stringify({ customer_name: name, customer_phone: phone, address, channel, payment_status: paid ? 'paid' : 'unpaid', delivery_fee: Number(fee) || 0, items }),
      });
      const j = await r.json();
      if (!r.ok || !j.success) throw new Error(j.error || 'Couldn’t save the order');
      const ml = (j.data.deducted || []).reduce((n: number, d: any) => n + Number(d.deducted_ml || 0), 0);
      onDone(`Order ${j.data.order_number} added — ${ml}ml taken from stock`);
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  };

  const field = 'w-full bg-transparent outline-none border-b border-neutral-300 focus:border-neutral-900 py-1.5 text-[15px] font-semibold text-neutral-950 placeholder:text-neutral-400 placeholder:font-medium';
  const lbl = 'block text-[10px] font-semibold tracking-[0.16em] text-neutral-500 uppercase';

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center p-0 sm:p-6" onClick={onClose}>
      <div className="w-full sm:max-w-lg max-h-[92vh] overflow-y-auto bg-white rounded-t-3xl sm:rounded-3xl p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between">
          <div>
            <div className="text-[11px] font-semibold tracking-[0.3em] text-neutral-600">OFFLINE ORDER</div>
            <div style={serif} className="text-3xl text-neutral-950 mt-1">New order</div>
          </div>
          <button onClick={onClose} aria-label="Close" className="w-8 h-8 rounded-full flex items-center justify-center text-neutral-500 hover:bg-neutral-100"><X className="w-4 h-4" /></button>
        </div>

        <div className="mt-5">
          <span className={lbl}>Order came from</span>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {CHANNELS.map((c) => (
              <button key={c.id} onClick={() => setChannel(c.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${channel === c.id ? 'bg-neutral-900 text-white border-neutral-900' : 'border-neutral-300 text-neutral-700'}`}>
                {c.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-5">
          <label><span className={lbl}>Customer</span><input className={field} value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" /></label>
          <label><span className={lbl}>Phone</span><input className={field} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="01XXXXXXXXX" inputMode="tel" /></label>
        </div>
        <label className="block mt-4"><span className={lbl}>Address (optional)</span><input className={field} value={address} onChange={(e) => setAddress(e.target.value)} placeholder="For delivery" /></label>

        <div className="mt-6">
          <span className={lbl}>Perfumes</span>
          {lines.map((l, i) => {
            const p = byId[l.product_id];
            const warn = shortBy(l);
            return (
              <div key={i} className="mt-3 pb-3 border-b border-neutral-100">
                {!p ? (
                  <div>
                    <input className={field} value={i === lines.length - 1 ? pick : ''} onChange={(e) => setPick(e.target.value)} placeholder="Type perfume or brand…" />
                    {pick.trim().length >= 2 && i === lines.length - 1 && (
                      <div className="mt-1 max-h-48 overflow-y-auto rounded-xl border border-neutral-200">
                        {sorted.filter((x) => `${x.brand} ${x.name}`.toLowerCase().includes(pick.trim().toLowerCase())).slice(0, 8).map((x) => (
                          <button key={x.id} onClick={() => {
                            const first = x.sizes.find((s) => s.ml <= (x.ml_left ?? 0)) || x.sizes[0];
                            setLine(i, { product_id: x.id, size: first?.size || '' }); setPick('');
                          }} className="w-full text-left px-3 py-2 hover:bg-neutral-50 flex justify-between gap-2">
                            <span className="truncate"><span className="text-[10px] font-semibold tracking-[0.14em] text-neutral-500">{x.brand}</span><br /><span style={serif} className="text-[17px]">{x.name}</span></span>
                            <span className="text-xs font-bold self-center" style={{ color: COLOR[stateOf(x)] }}>{x.ml_left ?? 0}ml</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <span className="min-w-0"><span className="text-[10px] font-semibold tracking-[0.14em] text-neutral-500">{p.brand}</span><br /><span style={serif} className="text-[18px] text-neutral-950">{p.name}</span></span>
                      <button onClick={() => setLines(lines.length > 1 ? lines.filter((_, k) => k !== i) : [{ product_id: '', size: '', quantity: 1 }])} className="text-xs font-semibold text-neutral-400 hover:text-red-600">Remove</button>
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5 mt-2">
                      {p.sizes.map((s) => {
                        const off = s.ml > (p.ml_left ?? 0);
                        return (
                          <button key={s.id} disabled={off} onClick={() => setLine(i, { size: s.size })}
                            className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${l.size === s.size ? 'bg-neutral-900 text-white border-neutral-900' : 'border-neutral-300 text-neutral-700'} ${off ? 'opacity-35 line-through' : ''}`}>
                            {s.size.toLowerCase()} · ৳{s.price}
                          </button>
                        );
                      })}
                      <span className="ml-auto inline-flex items-center gap-2 text-sm font-bold">
                        <button onClick={() => setLine(i, { quantity: Math.max(1, l.quantity - 1) })} className="w-6 h-6 rounded-full border border-neutral-300">−</button>
                        {l.quantity}
                        <button onClick={() => setLine(i, { quantity: l.quantity + 1 })} className="w-6 h-6 rounded-full border border-neutral-300">+</button>
                      </span>
                    </div>
                    {warn && <p className="text-xs font-semibold text-red-600 mt-1.5">{warn}</p>}
                  </div>
                )}
              </div>
            );
          })}
          {lines[lines.length - 1].product_id && (
            <button onClick={() => setLines([...lines, { product_id: '', size: '', quantity: 1 }])} className="mt-3 text-xs font-semibold text-neutral-900 border-b border-neutral-400">+ Add another perfume</button>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 mt-5 items-end">
          <label><span className={lbl}>Delivery fee</span><input className={field} value={fee} onChange={(e) => setFee(e.target.value.replace(/\D/g, ''))} placeholder="0" inputMode="numeric" /></label>
          <div className="inline-flex rounded-full border border-neutral-300 p-0.5 justify-self-start">
            {[false, true].map((v) => (
              <button key={String(v)} onClick={() => setPaid(v)} className={`px-3 py-1 rounded-full text-xs font-semibold ${paid === v ? 'bg-neutral-900 text-white' : 'text-neutral-700'}`}>
                {v ? 'Paid' : 'Not paid'}
              </button>
            ))}
          </div>
        </div>

        {err && <p className="mt-4 text-sm font-semibold text-red-600">{err}</p>}

        <div className="flex items-center justify-between mt-6">
          <span><span className={lbl}>Total</span><span style={serif} className="text-3xl text-neutral-950">৳{total.toLocaleString()}</span></span>
          <button onClick={submit} disabled={busy} className="px-6 py-3 rounded-full bg-neutral-900 text-white text-sm font-semibold disabled:opacity-50">
            {busy ? 'Saving…' : 'Add order'}
          </button>
        </div>
        <p className="mt-3 text-[11px] font-medium text-neutral-500">The ml is taken from stock right away. Cancel the order in Orders to put it back.</p>
      </div>
    </div>
  );
};
