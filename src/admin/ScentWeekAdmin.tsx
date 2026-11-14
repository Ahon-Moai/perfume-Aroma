import React, { useEffect, useMemo, useState } from 'react';
import { ArrowUp, ArrowDown, X, Search, Sparkles } from 'lucide-react';
import { getErrorMessage } from '../services/api';

type P = { id: string; name: string; brand: string; image?: string };
type Cfg = { mode: 'auto' | 'manual'; product_ids: string[]; fill_auto: boolean };

interface Props {
  products: P[];
  csrfToken: string;
  initial?: Partial<Cfg> | null;
  onSaved?: () => void;
}

const MAX = 6;

const ScentWeekAdmin: React.FC<Props> = ({ products, csrfToken, initial, onSaved }) => {
  const [cfg, setCfg] = useState<Cfg>({ mode: 'auto', product_ids: [], fill_auto: true });
  const [q, setQ] = useState('');
  const [autoPicks, setAutoPicks] = useState<Array<{ product_id: string; gender: string; ml_sold: number }>>([]);
  const [week, setWeek] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (initial) setCfg((c) => ({ ...c, ...initial, product_ids: (initial.product_ids || []).map(String) }));
  }, [initial]);

  useEffect(() => {
    fetch('/api/scent_week.php?auto=1')
      .then((r) => r.json())
      .then((j) => { setAutoPicks(j.data?.items || []); setWeek(j.data?.week ?? null); })
      .catch(() => {});
  }, []);

  const byId = useMemo(() => new Map(products.map((p) => [String(p.id), p])), [products]);
  const results = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return [];
    return products
      .filter((p) => !cfg.product_ids.includes(String(p.id)) && `${p.brand} ${p.name}`.toLowerCase().includes(t))
      .slice(0, 8);
  }, [q, products, cfg.product_ids]);

  const add = (id: string) => {
    if (cfg.product_ids.length >= MAX) return;
    setCfg({ ...cfg, product_ids: [...cfg.product_ids, id] });
    setQ('');
  };
  const remove = (id: string) => setCfg({ ...cfg, product_ids: cfg.product_ids.filter((x) => x !== id) });
  const move = (i: number, d: number) => {
    const ids = [...cfg.product_ids];
    const j = i + d;
    if (j < 0 || j >= ids.length) return;
    [ids[i], ids[j]] = [ids[j], ids[i]];
    setCfg({ ...cfg, product_ids: ids });
  };

  const save = async () => {
    setSaving(true);
    setMsg('');
    try {
      const res = await fetch('/api/admin/homepage.php', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrfToken },
        body: JSON.stringify({ type: 'section', section_key: 'scent_week', title: 'Scent of the week', subtitle: '', content: cfg, is_enabled: true, display_order: 2 }),
      });
      const data = await res.json();
      if (data.success) { setMsg('Saved. The homepage shows it right away.'); onSaved?.(); }
      else setMsg(getErrorMessage(data?.error || data, 'Couldn’t save'));
    } catch {
      setMsg('Couldn’t save. Check your connection and try again.');
    } finally {
      setSaving(false);
    }
  };

  const Row = ({ p, i, right }: { p?: P; i: number; right?: React.ReactNode }) => (
    <div className="flex items-center gap-3 py-2 border-b border-[#F0F0F0] last:border-0">
      <span className="w-6 text-[11px] font-semibold text-[#737373]">No.{i + 1}</span>
      {p?.image ? <img src={p.image} alt="" className="w-9 h-9 object-contain bg-[#F6F6F6] rounded-md" referrerPolicy="no-referrer" /> : <span className="w-9 h-9 bg-[#F6F6F6] rounded-md" />}
      <div className="flex-1 min-w-0">
        <p className="text-[10px] uppercase tracking-widest text-[#737373] truncate">{p?.brand || '—'}</p>
        <p className="text-[13px] font-semibold text-[#111] truncate">{p?.name || 'Not available'}</p>
      </div>
      {right}
    </div>
  );

  return (
    <div className="bg-white border border-[#EAEAEA] p-6 space-y-5 text-xs text-[#111111]">
      <div className="flex items-center gap-2 pb-3 border-b border-[#EAEAEA]">
        <Sparkles className="w-4 h-4" />
        <h3 className="font-serif text-base">Scent of the week{week ? ` · Nº ${week}` : ''}</h3>
      </div>

      {/* Mode */}
      <div className="grid grid-cols-2 gap-2 max-w-md">
        {(['auto', 'manual'] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setCfg({ ...cfg, mode: m })}
            className={`text-left p-3 rounded-xl border transition-colors ${cfg.mode === m ? 'border-[#111] bg-[#111] text-white' : 'border-[#EAEAEA] hover:border-[#111]'}`}
          >
            <p className="text-[12px] font-semibold">{m === 'auto' ? 'Automatic' : 'I’ll choose'}</p>
            <p className={`text-[11px] mt-0.5 ${cfg.mode === m ? 'text-white/70' : 'text-[#737373]'}`}>
              {m === 'auto' ? 'Best sellers, him / her / unisex' : 'Pick up to 6 perfumes yourself'}
            </p>
          </button>
        ))}
      </div>

      {cfg.mode === 'manual' && (
        <div className="space-y-3 max-w-xl">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#9a9a9a]" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={cfg.product_ids.length >= MAX ? 'You’ve picked 6 — remove one to add another' : 'Search a perfume or brand'}
              disabled={cfg.product_ids.length >= MAX}
              className="w-full bg-[#F8F8F8] border border-[#EAEAEA] pl-8 pr-3 py-2.5 text-xs rounded-lg focus:border-[#111] disabled:opacity-60"
            />
            {results.length > 0 && (
              <div className="absolute z-10 left-0 right-0 mt-1 bg-white border border-[#EAEAEA] rounded-lg shadow-lg overflow-hidden">
                {results.map((p) => (
                  <button key={p.id} type="button" onClick={() => add(String(p.id))} className="w-full flex items-center gap-3 px-3 py-2 hover:bg-[#F6F6F6] text-left">
                    {p.image ? <img src={p.image} alt="" className="w-7 h-7 object-contain" referrerPolicy="no-referrer" /> : <span className="w-7 h-7" />}
                    <span className="text-[11px] text-[#737373] uppercase tracking-wider">{p.brand}</span>
                    <span className="text-[12px] font-semibold">{p.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="border border-[#EAEAEA] rounded-xl px-3">
            {cfg.product_ids.length === 0 ? (
              <p className="py-4 text-[12px] text-[#737373]">No perfumes picked yet. Search above to add one.</p>
            ) : (
              cfg.product_ids.map((id, i) => (
                <Row key={id} p={byId.get(id)} i={i} right={
                  <div className="flex items-center gap-1">
                    <button type="button" onClick={() => move(i, -1)} className="p-1.5 hover:bg-[#F2F2F2] rounded" aria-label="Move up"><ArrowUp className="w-3.5 h-3.5" /></button>
                    <button type="button" onClick={() => move(i, 1)} className="p-1.5 hover:bg-[#F2F2F2] rounded" aria-label="Move down"><ArrowDown className="w-3.5 h-3.5" /></button>
                    <button type="button" onClick={() => remove(id)} className="p-1.5 hover:bg-[#FBEAEA] text-[#A32D2D] rounded" aria-label="Remove"><X className="w-3.5 h-3.5" /></button>
                  </div>
                } />
              ))
            )}
          </div>

          <label className="flex items-center gap-2 text-[12px] cursor-pointer select-none">
            <input type="checkbox" checked={cfg.fill_auto} onChange={(e) => setCfg({ ...cfg, fill_auto: e.target.checked })} />
            Fill the empty spots with best sellers
          </label>
        </div>
      )}

      {/* What automatic would show */}
      <div className="max-w-xl">
        <p className="text-[10px] tracking-widest uppercase text-[#737373] mb-1">Best sellers this week (automatic)</p>
        <div className="border border-[#EAEAEA] rounded-xl px-3">
          {autoPicks.length === 0 ? (
            <p className="py-4 text-[12px] text-[#737373]">Not enough orders yet. The homepage fills in with a him / her / unisex mix.</p>
          ) : (
            autoPicks.map((a, i) => (
              <Row key={a.product_id} p={byId.get(String(a.product_id))} i={i} right={
                <span className="text-[11px] text-[#737373] whitespace-nowrap">{Math.round(a.ml_sold)} ml sold</span>
              } />
            ))
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button type="button" onClick={save} disabled={saving} className="px-5 py-2.5 bg-[#111111] text-white text-[10px] tracking-widest uppercase disabled:opacity-50 rounded-full">
          {saving ? 'Saving…' : 'Save'}
        </button>
        {msg && <span className="text-[12px] text-[#737373]">{msg}</span>}
      </div>
    </div>
  );
};

export default ScentWeekAdmin;
