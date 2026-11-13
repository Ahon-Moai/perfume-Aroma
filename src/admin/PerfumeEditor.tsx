import React, { useEffect, useMemo, useRef, useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { categoryOf } from '../lib/brandCategory';

/**
 * Simple perfume editor — 12 fields on one screen, live preview of the customer page.
 * Saves into the existing product fields so the shop, filters and Help-me-choose keep working.
 * Fields this editor doesn't show (gallery, attributes, pyramid notes, …) are kept as they are.
 */

const HOUSES = [['Arabian', 'Middle Eastern'], ['Designer', 'Designer'], ['Niche', 'Niche']] as const;
const GENDERS = ['Him', 'Her', 'Unisex'] as const;
const TYPES: [string, string][] = [['EDP', 'Eau de Parfum'], ['EDT', 'Eau de Toilette'], ['Extrait', 'Extrait de Parfum'], ['Parfum', 'Parfum']];
// Simple scent words → the family names the shop already uses
const SCENTS: [string, string, string][] = [
  ['Fresh', 'Fresh / Citrus', '#2fa8e0'], ['Sweet', 'Gourmand', '#ff6fa0'], ['Floral', 'Floral', '#e76fb6'],
  ['Fruity', 'Fruity', '#ff8a3d'], ['Woody', 'Woody', '#8a6a4f'], ['Warm', 'Amber / Oriental', '#c7782a'],
  ['Musky', 'Musk', '#a78bdb'], ['Aromatic', 'Aromatic / Herbal', '#4f9a6a'],
];
const SEASONS: [string, string][] = [['Summer', 'Summer'], ['Winter', 'Winter'], ['Spring', 'Spring'], ['Autumn', 'Autumn'], ['All year', 'All Seasons']];
const BEST = ['Day', 'Night', 'Both'] as const;
const LASTS = ['Light', 'Moderate', 'Long-lasting'] as const;
const SIZES = ['1.5', '3', '5', '10', '15', '30'];

const serif = { fontFamily: "'Cormorant Garamond', Georgia, serif", fontWeight: 600 } as const;
const lbl = 'block text-[10px] font-semibold tracking-[0.22em] text-neutral-400 uppercase mb-1.5';
const line = 'w-full bg-transparent outline-none text-[15px] font-medium text-neutral-950 placeholder:text-neutral-300';

const scentOf = (fam: string) => {
  const f = fam.toLowerCase();
  if (/fresh|citrus|aquatic|marine/.test(f)) return 'Fresh';
  if (/gourmand|sweet|vanilla|caramel/.test(f)) return 'Sweet';
  if (/floral|rose|jasmine/.test(f)) return 'Floral';
  if (/fruity/.test(f)) return 'Fruity';
  if (/wood|leather|earthy/.test(f)) return 'Woody';
  if (/amber|oriental|spic|oud|tobacco/.test(f)) return 'Warm';
  if (/musk|powder/.test(f)) return 'Musky';
  if (/aromatic|herbal|lavender|green/.test(f)) return 'Aromatic';
  return null;
};
const typeOf = (c?: string) => {
  const t = (c || '').toLowerCase();
  if (t.includes('extrait')) return 'Extrait';
  if (t.includes('toilette') || t === 'edt') return 'EDT';
  if (t === 'parfum') return 'Parfum';
  return 'EDP';
};
const lastsOf = (l?: string) => {
  const t = String(l || '').toLowerCase();
  if (!t) return '';
  if (/light|2–4|2-4|soft/.test(t)) return 'Light';
  if (/moderate|4–6|4-6|6–8|6-8/.test(t) && !/8\+|12|eternal|long/.test(t)) return 'Moderate';
  return 'Long-lasting';
};
const mlOf = (s: string) => String(parseFloat(String(s).replace(/[^\d.]/g, '')));

type Form = {
  brand: string; name: string; house: string; gender: string; type: string; desc: string;
  scents: string[]; notes: string; seasons: string[]; best: string; lasts: string; image: string;
  prices: Record<string, string>;
};

const Seg: React.FC<{ items: readonly (string | readonly [string, string])[]; value: string; onPick: (v: string) => void }> = ({ items, value, onPick }) => (
  <div className="inline-flex flex-wrap gap-0.5 p-0.5 rounded-full border border-neutral-300">
    {items.map((it) => {
      const [v, t] = typeof it === 'string' ? [it, it] : it;
      return (
        <button key={v} type="button" onClick={() => onPick(v)}
          className={`px-3 py-1 rounded-full text-xs font-semibold transition ${value === v ? 'bg-neutral-900 text-white' : 'text-neutral-500 hover:text-neutral-900'}`}>
          {t}
        </button>
      );
    })}
  </div>
);

const Tags: React.FC<{ items: string[]; value: string[]; onToggle: (v: string) => void }> = ({ items, value, onToggle }) => (
  <div className="flex flex-wrap gap-x-4 gap-y-1.5">
    {items.map((v) => (
      <button key={v} type="button" onClick={() => onToggle(v)}
        className={`text-[13px] font-semibold pb-0.5 border-b transition ${value.includes(v) ? 'text-neutral-950 border-neutral-950' : 'text-neutral-400 border-transparent hover:text-neutral-700'}`}>
        {v}
      </button>
    ))}
  </div>
);

export const PerfumeEditor: React.FC<{
  productId: string | null; // null = new perfume
  csrfToken: string;
  onClose: () => void;
  onSaved: (msg: string) => void;
}> = ({ productId, csrfToken, onClose, onSaved }) => {
  const [loading, setLoading] = useState(!!productId);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [orig, setOrig] = useState<any>(null);
  const [pick, setPick] = useState('5');
  const fileRef = useRef<HTMLInputElement>(null);
  const [f, setF] = useState<Form>({
    brand: '', name: '', house: 'Arabian', gender: 'Unisex', type: 'EDP', desc: '', scents: [], notes: '',
    seasons: [], best: '', lasts: '', image: '', prices: {},
  });
  const set = (patch: Partial<Form>) => setF((x) => ({ ...x, ...patch }));
  const headers = { 'Content-Type': 'application/json', 'X-CSRF-Token': csrfToken };

  useEffect(() => {
    if (!productId) return;
    (async () => {
      try {
        const r = await fetch(`/api/admin/products.php?id=${encodeURIComponent(productId)}`, { credentials: 'include', headers });
        const j = await r.json();
        if (!r.ok || !j.success) throw new Error(j.error || 'Couldn’t load this perfume');
        const p = j.data;
        const sp = p.scent_profile || {};
        const notes: string[] = (p.notes && p.notes.length ? p.notes : [...(p.top_notes || []), ...(p.heart_notes || []), ...(p.base_notes || [])]);
        const dn: string[] = sp.daytimeNighttime || [];
        const prices: Record<string, string> = {};
        (p.variants || []).forEach((v: any) => { prices[mlOf(v.size)] = String(Math.round(+v.price)); });
        setOrig(p);
        setF({
          brand: p.brand || '', name: p.name || '',
          house: categoryOf(p.brand || '', p.category),
          gender: ['Him', 'Her', 'Unisex'].includes(p.gender) ? p.gender : 'Unisex',
          type: typeOf(p.concentration),
          desc: p.short_description || sp.scentDescription || '',
          scents: Array.from(new Set((sp.fragranceFamilies || []).map(scentOf).filter(Boolean) as string[])),
          notes: Array.from(new Set(notes.map((n) => String(n).trim()).filter(Boolean))).join(', '),
          seasons: SEASONS.filter(([, v]) => (sp.seasons || []).includes(v)).map(([k]) => k),
          best: dn.length > 1 ? 'Both' : dn.length ? (/night/i.test(dn[0]) ? 'Night' : 'Day') : '',
          lasts: lastsOf(sp.longevity),
          image: p.image || '',
          prices,
        });
        const first = SIZES.find((s) => prices[s]);
        if (first) setPick(prices['5'] ? '5' : first);
      } catch (e: any) {
        setErr(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [productId]);

  const sizes = useMemo(() => SIZES.filter((s) => +f.prices[s] > 0), [f.prices]);
  const pickPrice = +f.prices[pick] || +f.prices[sizes[0]] || 0;

  const upload = async (file: File) => {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const r = await fetch('/api/uploads.php', { method: 'POST', credentials: 'include', headers: { 'X-CSRF-Token': csrfToken }, body: fd });
      const j = await r.json();
      if (!j.success || !j.data?.url) throw new Error(j.error || 'Upload failed');
      set({ image: j.data.url });
    } catch (e: any) {
      setErr(e.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const save = async () => {
    setErr(null);
    if (!f.brand.trim() || !f.name.trim()) return setErr('Enter the brand and the name');
    if (!sizes.length) return setErr('Add a price for at least one size');
    setSaving(true);
    try {
      const o = orig || {};
      const sp = { ...(o.scent_profile || {}) };
      sp.fragranceFamilies = SCENTS.filter(([k]) => f.scents.includes(k)).map(([, v]) => v);
      sp.seasons = SEASONS.filter(([k]) => f.seasons.includes(k)).map(([, v]) => v);
      sp.daytimeNighttime = f.best === 'Both' ? ['Daytime', 'Nighttime'] : f.best === 'Day' ? ['Daytime'] : f.best === 'Night' ? ['Nighttime'] : [];
      sp.longevity = f.lasts || '';
      sp.concentration = f.type;
      sp.genderPositioning = f.gender === 'Him' ? 'Masculine' : f.gender === 'Her' ? 'Feminine' : 'Unisex';
      if (f.desc.trim()) sp.scentDescription = f.desc.trim();
      const notes = f.notes.split(',').map((n) => n.trim()).filter(Boolean);
      const oldV: any[] = o.variants || [];
      const variants = sizes.map((s) => {
        const was = oldV.find((v) => mlOf(v.size) === s);
        return {
          size: `${s}ML`, price: +f.prices[s], cost_price: was ? +was.cost_price || 0 : 0,
          sku: was?.sku, stock_qty: was ? was.stock_qty : 100, image: was?.image || '',
        };
      });
      const body = {
        brand: f.brand.trim().toUpperCase(), name: f.name.trim(),
        slug: o.slug || `${f.brand} ${f.name}`.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
        category: f.house, gender: f.gender, concentration: (TYPES.find(([k]) => k === f.type) || TYPES[0])[1],
        starting_price: Math.min(...variants.map((v) => v.price)), cost_price: +o.cost_price || 0,
        short_description: f.desc.trim(), description: o.description || '',
        image: f.image, notes,
        top_notes: o.top_notes || [], heart_notes: o.heart_notes || [], base_notes: o.base_notes || [],
        attributes: o.attributes || [], scent_profile: sp,
        status: o.status || 'published', inventory_qty: o.inventory_qty ?? 100,
        is_featured: +o.is_featured || 0, is_new_arrival: +o.is_new_arrival || 0,
        variants,
      };
      const url = productId ? `/api/admin/products.php?id=${encodeURIComponent(productId)}` : '/api/admin/products.php';
      const r = await fetch(url, { method: productId ? 'PUT' : 'POST', credentials: 'include', headers, body: JSON.stringify(body) });
      const j = await r.json();
      if (!r.ok || !j.success) throw new Error(j.error || 'Couldn’t save');
      onSaved(`${f.name.trim()} saved`);
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setSaving(false);
    }
  };

  const toggle = (k: 'scents' | 'seasons', v: string) =>
    set({ [k]: f[k].includes(v) ? f[k].filter((x) => x !== v) : [...f[k], v] } as any);

  const facts: [string, string][] = ([
    ['Notes', f.notes],
    ['Season', f.seasons.join(' · ')],
    ['Best for', f.best === 'Both' ? 'Day & night' : f.best],
    ['Lasts', f.lasts],
  ] as [string, string][]).filter(([, v]) => !!v);

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center sm:p-6" onClick={onClose}>
      <div className="w-full sm:max-w-5xl max-h-[94vh] overflow-y-auto bg-white rounded-t-[28px] sm:rounded-[28px] p-5 sm:p-8" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <div className="text-[10px] font-semibold tracking-[0.3em] text-neutral-500">{productId ? 'EDIT PERFUME' : 'NEW PERFUME'}</div>
          <button onClick={onClose} aria-label="Close" className="w-9 h-9 -mr-2 rounded-full flex items-center justify-center text-neutral-500 hover:bg-neutral-100"><X className="w-5 h-5" /></button>
        </div>

        {loading ? (
          <div className="py-24 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-neutral-400" /></div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] gap-8 mt-3">
            {/* Form */}
            <div>
              <div className="flex items-center gap-4 pb-3">
                <div className="w-16 h-16 rounded-2xl bg-neutral-100 overflow-hidden flex items-center justify-center shrink-0">
                  {f.image ? <img src={f.image} alt="" className="w-full h-full object-cover" /> : <span className="text-[10px] text-neutral-400">No photo</span>}
                </div>
                <button type="button" onClick={() => fileRef.current?.click()} className="text-xs font-semibold border-b border-neutral-400 text-neutral-900">
                  {uploading ? 'Uploading…' : f.image ? 'Change photo' : 'Add photo'}
                </button>
                <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => { const x = e.target.files?.[0]; if (x) upload(x); e.target.value = ''; }} />
              </div>

              <div className="py-3 border-b border-neutral-200"><span className={lbl}>Brand</span><input className={line} value={f.brand} onChange={(e) => set({ brand: e.target.value })} placeholder="Lattafa" /></div>
              <div className="py-3 border-b border-neutral-200"><span className={lbl}>Name</span><input className={`${line} text-[26px]`} style={serif} value={f.name} onChange={(e) => set({ name: e.target.value })} placeholder="Khamrah" /></div>
              <div className="py-3 border-b border-neutral-200 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><span className={lbl}>House</span><Seg items={HOUSES} value={f.house} onPick={(v) => set({ house: v })} /></div>
                <div><span className={lbl}>For</span><Seg items={GENDERS} value={f.gender} onPick={(v) => set({ gender: v })} /></div>
              </div>
              <div className="py-3 border-b border-neutral-200"><span className={lbl}>Type</span><Seg items={TYPES.map(([k]) => k)} value={f.type} onPick={(v) => set({ type: v })} /></div>
              <div className="py-3 border-b border-neutral-200"><span className={lbl}>Description</span>
                <textarea className={`${line} resize-none min-h-[46px] leading-relaxed`} value={f.desc} onChange={(e) => set({ desc: e.target.value })} placeholder="One line customers will understand — e.g. warm vanilla & spice for evenings." />
              </div>
              <div className="py-3 border-b border-neutral-200"><span className={lbl}>Scent</span><Tags items={SCENTS.map(([k]) => k)} value={f.scents} onToggle={(v) => toggle('scents', v)} /></div>
              <div className="py-3 border-b border-neutral-200"><span className={lbl}>Key notes</span><input className={line} value={f.notes} onChange={(e) => set({ notes: e.target.value })} placeholder="Cinnamon, Dates, Praline, Vanilla" /></div>
              <div className="py-3 border-b border-neutral-200"><span className={lbl}>Season</span><Tags items={SEASONS.map(([k]) => k)} value={f.seasons} onToggle={(v) => toggle('seasons', v)} /></div>
              <div className="py-3 border-b border-neutral-200 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><span className={lbl}>Best for</span><Seg items={BEST} value={f.best} onPick={(v) => set({ best: v })} /></div>
                <div><span className={lbl}>Lasts</span><Seg items={LASTS} value={f.lasts} onPick={(v) => set({ lasts: v })} /></div>
              </div>
              <div className="py-3">
                <span className={lbl}>Prices · ৳ <span className="normal-case tracking-normal font-medium">(leave empty if you don’t sell that size)</span></span>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                  {SIZES.map((s) => (
                    <label key={s} className="text-[10px] font-semibold tracking-[0.12em] text-neutral-400">
                      {s}ML
                      <input inputMode="numeric" value={f.prices[s] || ''} placeholder="—"
                        onChange={(e) => set({ prices: { ...f.prices, [s]: e.target.value.replace(/\D/g, '') } })}
                        className="block w-full bg-transparent outline-none border-b border-dashed border-neutral-300 focus:border-neutral-900 text-[17px] font-bold text-neutral-950 py-0.5 mt-0.5 tabular-nums" />
                    </label>
                  ))}
                </div>
              </div>

              {err && <p className="text-sm font-semibold text-red-600 mt-2">{err}</p>}
              <div className="flex justify-end gap-3 mt-5">
                <button onClick={onClose} className="px-5 py-2.5 rounded-full text-xs font-semibold text-neutral-600">Cancel</button>
                <button onClick={save} disabled={saving || uploading} className="px-7 py-2.5 rounded-full bg-neutral-900 text-white text-xs font-semibold tracking-[0.18em] disabled:opacity-50">
                  {saving ? 'SAVING…' : 'SAVE'}
                </button>
              </div>
            </div>

            {/* Live preview */}
            <div className="lg:sticky lg:top-0 self-start rounded-[28px] overflow-hidden shadow-[0_0_0_.5px_rgba(0,0,0,.08),0_24px_50px_-30px_rgba(0,0,0,.35)]">
              <div className="h-56 bg-neutral-50 flex items-center justify-center">
                {f.image ? <img src={f.image} alt="" className="max-h-full max-w-full object-contain" /> : <span className="text-xs text-neutral-300">Photo</span>}
              </div>
              <div className="p-5">
                <div className="text-[9.5px] tracking-[0.3em] text-neutral-500 uppercase">{f.brand || 'Brand'} · {HOUSES.find(([k]) => k === f.house)?.[1]}</div>
                <div style={serif} className="text-[28px] leading-[1.02] mt-1.5">{f.name || 'Perfume name'}</div>
                <div className="text-[11px] tracking-[0.06em] text-neutral-500 uppercase mt-1">{f.type} · For {f.gender}</div>
                {f.desc && <p className="text-[13px] leading-relaxed text-neutral-600 mt-3">{f.desc}</p>}
                {f.scents.length > 0 && (
                  <div className="flex flex-wrap gap-x-3 gap-y-1 mt-3 text-[11px] text-neutral-600">
                    {f.scents.map((s) => <span key={s} className="inline-flex items-center gap-1"><i className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: SCENTS.find(([k]) => k === s)?.[2] }} />{s}</span>)}
                  </div>
                )}
                {facts.length > 0 && (
                  <div className="mt-3 border-t border-neutral-100">
                    {facts.map(([k, v]) => <div key={k} className="flex justify-between gap-3 py-2 border-b border-neutral-100 text-xs text-neutral-500"><span>{k}</span><b className="font-medium text-neutral-900 text-right">{v}</b></div>)}
                  </div>
                )}
                {sizes.length > 0 && (
                  <div className="pp-glass-group mt-4">
                    {sizes.map((s) => (
                      <button key={s} type="button" onClick={() => setPick(s)} className={`pp-glass-pill${(pick === s || (!f.prices[pick] && s === sizes[0])) ? ' is-active' : ''}`}>
                        <span className="pp-glass-pill__size">{s}ml</span>
                        <span className="pp-glass-pill__price">৳{f.prices[s]}</span>
                      </button>
                    ))}
                  </div>
                )}
                <div className="mt-3 text-center text-[11px] tracking-[0.24em] py-3 rounded-full bg-neutral-900 text-white">ADD TO BAG · ৳{pickPrice.toLocaleString()}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
